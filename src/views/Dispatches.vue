<template>
  <v-container>
    <Header
      title="Despachos"
      subtitle="Especifique los parámetros y realice una consulta"
    />
    <v-sheet class="px-3">
      <v-tabs v-model="tab">
        <v-tabs-slider color="accent" />
        <v-tab>Filtro</v-tab>
        <v-tab :disabled="!result.length">Resultado</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-form ref="form">
            <v-row>

              <v-col :cols="mobile ? 12 : 6">
                <QueryChips @submitQuery="search" />
                <v-btn class="my-1" @click="clearFilter" block small>
                  <v-icon color="accent">mdi-broom</v-icon>
                </v-btn>
                <v-row class="mt-0">
                  <v-col>
                    <v-autocomplete
                      v-model="filter.technician"
                      :items="formOptions.technicians"
                      label="Personal asignado"
                    />
                  </v-col>
                </v-row>                <v-row class="mt-0">
                  <v-col>
                    <v-autocomplete
                      v-model="filter.clientName"
                      label="Cliente"
                      :items="formOptions.clientNames"
                    />
                  </v-col>
                </v-row>
                <v-row class="mt-0">
                  <v-col>
                    <v-select
                      v-model="filter.productType"
                      :items="formOptions.productTypes"
                      label="Categoria"
                      solo
                    />
                  </v-col>
                </v-row>
                <v-row class="mt-0">
                  <v-col>
                    <v-select
                      v-model="filter.productName"
                      :items="productsByCategory"
                      label="Producto"
                      solo
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col :cols="mobile ? 12 : 6">
                <v-chip-group color="accent">
                  <v-icon>mdi-filter</v-icon>
                  <v-chip @click="dateQuickFilter('thisYear')" small>{{ thisYear }}</v-chip>
                  <v-chip @click="dateQuickFilter('thisMonth')" small>{{ thisMonth }}</v-chip>
                  <v-chip @click="dateQuickFilter('lastMonth')" small>{{ lastMonth }}</v-chip>
                </v-chip-group>
                <v-row class="mt-4">
                  <v-col>
                    <v-date-picker
                      v-model="dates"
                      color="primary"
                      range
                      full-width
                      no-title
                      :min="minDate"
                    />
                    <v-text-field
                      class="mt-5"
                      v-model="dateRangeText"
                      label="Rango"
                      readonly
                    />
                  </v-col>
                </v-row>
                <v-btn
                  class="mb-15 mr-10"
                  @click="search(filter)"
                  fixed absolute
                  bottom right
                  :disabled="dates.length !== 2"
                  color="primary" fab
                  :loading="loader"
                >
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-tab-item>
        <v-tab-item>
          <v-sheet>
            <QueryResult :excelFormat="excelFormat" :result="result" />
          </v-sheet>
        </v-tab-item>
      </v-tabs-items>
    </v-sheet>
  </v-container>
</template>
<script>

import Header from '@/components/generals/Header'
import QueryChips from '@/components/storehouse/QueryChips'
import QueryResult from '@/components/storehouse/QueryResult'
import moment from 'moment-timezone'
import { mapMutations, mapGetters, mapState, mapActions } from 'vuex'

export default {
  name: 'Consultation',
  components: { Header, QueryChips, QueryResult },
  data: () => {
    return {
      tab: null,
      filter: {},
      dates: [],
      dispatch: {
        method: '',
        reference: ''
      },
      excelFormat: [],

      result: [],
      loader: false
    }
  },
  computed: {
    ...mapGetters(['formOptions']),
    ...mapState(['collections']),
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },
    thisYear () {
      return moment(new Date()).format('yyyy')
    },
    thisMonth () {
      return moment(new Date()).format('MMMM')
    },
    lastMonth () {
      return moment(new Date()).subtract(1, 'month').format('MMMM')
    },
    dateRangeText () {
      return this.dates.join(' ~ ')
    },
    minDate () {
      if (this.dates[0] && !this.dates[1]) {
        return this.dates[0]
      } else {
        return ''
      }
    },
    productsByCategory () {
      if (this.filter.productType){
        let prodByCategory = this.collections.Product.filter(product => product.productType === this.filter.productType)
        prodByCategory = prodByCategory.map(product => product.productName)
        return prodByCategory
      } else{
        return this.collections.Product.map(product => product.productName)
      }
    }
  },
  methods: {

    ...mapActions(['findDocuments']),

    ...mapMutations(['showSnackbar']),

    dateQuickFilter (type) {
      this.dates = []
      let firstDate = `${moment(new Date()).format('yyyy-MM-')}01`
      let secondDate = moment(firstDate).add(1, 'M').format('YYYY-MM-DD')
      switch (type) {
        case 'thisMonth':
          secondDate = moment(secondDate).subtract(1, 'days').format('YYYY-MM-DD')
          this.dates.push(firstDate)
          this.dates.push(secondDate)
          break
        case 'lastMonth':
          secondDate = firstDate
          firstDate = moment(firstDate).subtract(1, 'M').format('YYYY-MM-DD')
          secondDate = moment(secondDate).subtract(1, 'days').format('YYYY-MM-DD')
          this.dates.push(firstDate)
          this.dates.push(secondDate)
          break
        case 'thisYear':
          firstDate = `${moment(new Date()).format('yyyy')}-01-01`
          secondDate = moment(firstDate).add(1, 'Y').format('yyyy-MM-DD')
          secondDate = moment(secondDate).subtract(1, 'days').format('YYYY-MM-DD')
          this.dates.push(firstDate)
          this.dates.push(secondDate)
          break
        default:
          break
      }
    },
    clearFilter () {
      this.filter = {}
      this.dates = []
    },
    search (filter) {
      this.loader = true
      this.findDocuments({ collection: 'Dispatch', filter })
        .then((res) => {
          this.result = res
          if (res.length) this.xlsFormat(this.result)
            this.showSnackbar({ message: `Registros encontrados: ${res.length}` })
            this.loader = false
        })
        .catch(() => this.loader = false)
    },
    xlsFormat (data) {
      const rows = []
      for (const i in data) {
        rows.push({
          Despachado: data[i].dispatch.date,
          Técnico: data[i].technician.fullName,
          Producto: data[i].productName,
          Pieza: data[i].pieceName,
          Cliente: data[i].clientName,
          Oficina: data[i].officeName,
          Reporte: data[i].reportCode,
          Método: `${data[i].dispatch.method} ${data[i].dispatch.destiny}`,
          Referencia: data[i].dispatch.reference,
          Costo: data[i].dispatch.cost
        })
      }
      this.excelFormat = rows
      this.loader = false
      this.tab = 1
    }
  }
}
</script>
