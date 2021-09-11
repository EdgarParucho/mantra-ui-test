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
            <v-row>
              <v-col v-for="chart, index in charts" :key="index" :cols="mobile ? 12 : 6">
                <Graph
                  v-if="showGraphs"
                  :id="`dispatchesGraph${index}`"
                  :title="chart.title"
                  :chartData="chart.config"
                  subtitle="Despachos realizados"
                />
              </v-col>
            </v-row>
          </v-sheet>
        </v-tab-item>
      </v-tabs-items>
    </v-sheet>
  </v-container>
</template>
<script>

import Graph from '@/components/generals/Graph'
import Header from '@/components/generals/Header'
import QueryChips from '@/components/storehouse/QueryChips'
import QueryResult from '@/components/storehouse/QueryResult'
import moment from 'moment-timezone'
import { mapMutations, mapGetters, mapState, mapActions } from 'vuex'

export default {
  name: 'Consultation',
  components: { Graph, Header, QueryChips, QueryResult },
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
      showGraphs: false,
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
    },
    dispatchesXClient () {
      let labels = this.result.map(dispatch => dispatch.clientName)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Registros por cliente',
        config: {
          type: 'line',
          options: {},
          data: {
            labels,
            datasets: [{
              label: 'Despachos registrados',
              data: [],
              borderColor: this.$vuetify.theme.currentTheme.accent
            }]
          }
        }
      }
      for (const client of labels) {
        const clientDispatches = dispatch => dispatch.clientName === client
        chart.config.data.datasets[0].data.push(this.result.filter(clientDispatches).length)
      }
      return chart
    },

    costXClient () {
      let labels = this.result.map(dispatch => dispatch.clientName)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Inversión por cliente',
        config: {
          type: 'bar',
          options: {
            scales: {
              y: { ticks: { callback: (value) => '$' + value}}
            }
          },
          data: {
            labels,
            datasets: [{
              label: 'Despachos registrados',
              data: [],
              backgroundColor: 'rgba(10, 200, 40, .5)',
              borderColor: this.$vuetify.theme.currentTheme.primary,
              borderWidth: 2,
              borderRadius: 5
            }]
          }
        }
      }
      for (const label of labels) {
        const labelData = this.result.filter(dispatch => dispatch.clientName === label && dispatch.dispatch.cost > 0)
        let references = labelData.map(item => item.dispatch.reference)
        references = [...new Set(references)]
        const dataForSpendings = []
        for (const reference of references) dataForSpendings.push(labelData.find(item => item.dispatch.reference === reference).dispatch.cost)
        const labelSpending = dataForSpendings .reduce((a, v) =>  a = a + parseInt(v), 0)
        chart.config.data.datasets[0].data.push(labelSpending)
      }
      return chart
    },

    dispatchesXProduct () {
      let labels = this.result.map(dispatch => dispatch.productType)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Despachos por producto',
        config: {
          type: 'line',
          options: { indexAxis: 'y' },
          data: {
            labels,
            datasets: [{
              label: 'Despachos registrados',
              data: [],
              borderColor: this.$vuetify.theme.currentTheme.accent
            }]
          }
        }
      }
      for (const label of labels) {
        const productCorrectives = dispatch => dispatch.productType === label
        chart.config.data.datasets[0].data.push(this.result.filter(productCorrectives).length)
      }
      return chart
    },

    costXProduct () {
      let labels = this.result.map(dispatch => dispatch.productType)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Inversión por producto',
        config: {
          type: 'bar',
          options: {
            scales: {
              y: { ticks: { callback: (value) => '$' + value}}
            },
            indexAxis: 'y'
          },
          data: {
            labels,
            datasets: [{
              label: 'Despachos registrados',
              data: [],
              backgroundColor: 'rgba(10, 200, 40, .5)',
              borderColor: this.$vuetify.theme.currentTheme.primary,
              borderWidth: 2,
              borderRadius: 5
            }]
          }
        }
      }
      for (const label of labels) {
        const labelData = this.result.filter(dispatch => dispatch.productType === label && dispatch.dispatch.cost > 0)
        let references = labelData.map(item => item.dispatch.reference)
        references = [...new Set(references)]
        const dataForSpendings = []
        for (const reference of references) dataForSpendings.push(labelData.find(item => item.dispatch.reference === reference).dispatch.cost)
        console.log(dataForSpendings)
        const labelSpending = dataForSpendings .reduce((a, v) =>  a = a + parseInt(v), 0)
        chart.config.data.datasets[0].data.push(labelSpending)
      }
      return chart
    },

    dispatchesXTechnician () {
      let labels = this.result.map(dispatch => dispatch.technician.fullName)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Registros por técnico',
        config: {
          type: 'line',
          options: {},
          data: {
            labels,
            datasets: [
              {
                label: 'Despachos registrados',
                data: [],
                borderColor: this.$vuetify.theme.currentTheme.accent
              }
            ]
          }
        }
      }
      for (const technician of labels) {
        const technicianDispatches = dispatch => dispatch.technician.fullName === technician
        chart.config.data.datasets[0].data.push(this.result.filter(technicianDispatches).length)
      }
      return chart
    },

    costXTechnician () {
      let labels = this.result.map(dispatch => dispatch.technician.fullName)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Inversión por técnico',
        config: {
          type: 'bar',
          options: {
            scales: {
              y: { ticks: { callback: (value) => '$' + value}}
            }
          },
          data: {
            labels,
            datasets: [
              {
                label: 'Despachos registrados',
                data: [],
                backgroundColor: 'rgba(10, 200, 40, .5)',
                borderColor: this.$vuetify.theme.currentTheme.primary,
                borderWidth: 2,
                borderRadius: 5
              }
            ]
          }
        }
      }
      for (const label of labels) {
        const labelData = this.result.filter(dispatch => dispatch.technician.fullName === label && dispatch.dispatch.cost > 0)
        let references = labelData.map(item => item.dispatch.reference)
        references = [...new Set(references)]
        const dataForSpendings = []
        for (const reference of references) dataForSpendings.push(labelData.find(item => item.dispatch.reference === reference).dispatch.cost)
        console.log(dataForSpendings)
        const labelSpending = dataForSpendings .reduce((a, v) =>  a = a + parseInt(v), 0)
        chart.config.data.datasets[0].data.push(labelSpending)
      }
      return chart
    },

    charts () {
      return [
        this.dispatchesXClient,
        this.costXClient,
        this.dispatchesXProduct,
        this.costXProduct,
        this.dispatchesXTechnician,
        this.costXTechnician
      ]
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
      this.showGraphs = false
      this.findDocuments({ collection: 'Dispatch', filter })
        .then((res) => {
          this.result = res
          if (res.length) this.xlsFormat(this.result)
            this.showSnackbar({ message: `Registros encontrados: ${res.length}` })
            this.showGraphs = true
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
