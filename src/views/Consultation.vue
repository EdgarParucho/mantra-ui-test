<template>
  <v-container>
    <Header
      title="Consultas"
      subtitle="Especifique los valores para realizar una consulta"
    />
    <v-sheet class="px-3">
      <v-row>
        <v-col>
          <v-tabs v-model="tab">
            <v-tabs-slider color="accent" />
            <v-tab>Filtro</v-tab>
            <v-tab :disabled="!result.length">Resultado</v-tab>
          </v-tabs>
        </v-col>  
        <v-col align="end">
          <QueryChips v-show="!tab" @submitQuery="searchCorrective" />
        </v-col>
      </v-row>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-form ref="form">
            <v-row>

              <v-col :cols="mobile ? 12 : 6">
                <v-row align="center">
                  <v-col :cols="mobile ? 9 : 8">
                    <v-radio-group row v-model="serviceType">
                      <v-radio
                        class="ml-2"
                        v-for="(n, i) in ['Correctivo', 'Preventivo']"
                        :key="i"
                        :label="n"
                        :value="n"
                      />
                    </v-radio-group>
                  </v-col>
                  <v-col :cols="mobile ? 3 : 4" align="end">
                    <v-btn class="my-1" @click="clearFilter" color="accent" small>
                      <v-icon>mdi-broom</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row class="mt-0">
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
                      v-model="sla"
                      :items="[
                        'Dentro del acuerdo',
                        'Fuera del acuerdo'
                      ]"
                      :disabled="serviceType === 'Preventivo'"
                      label="S. L. A."
                      solo
                    />
                  </v-col>
                  <v-col>
                    <v-select
                      v-model="filter.status"
                      :items="statusOptions"
                      :disabled="serviceType === 'Preventivo'"
                      label="Status"
                      solo
                    />
                  </v-col>
                </v-row>
                <v-row class="mt-0">
                  <v-col>
                    <v-select
                      v-model="filter.productType"
                      :items="formOptions.productTypes"
                      label="Producto"
                      solo
                    />
                  </v-col>
                </v-row>
                <v-row class="mt-0">
                  <v-col>
                    <v-autocomplete
                      v-model="technician"
                      :items="formOptions.technicians"
                      label="Personal asignado"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col :cols="mobile ? 12 : 6">
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
                  </v-col>
                </v-row>
                <v-row>
                  <v-col :cols="mobile ? 12 : 6">
                    <v-chip-group color="accent">
                      <v-icon>mdi-filter</v-icon>
                      <v-chip @click="dateQuickFilter('thisYear')" small>{{ thisYear }}</v-chip>
                      <v-chip @click="dateQuickFilter('thisMonth')" small>{{ thisMonth }}</v-chip>
                      <v-chip @click="dateQuickFilter('lastMonth')" small>{{ lastMonth }}</v-chip>
                    </v-chip-group>
                  </v-col>
                  <v-col :cols="mobile ? 12 : 6">
                    <v-text-field
                      v-model="dateRangeText"
                      label="Rango"
                      readonly
                    />
                  </v-col>
                </v-row>
                <v-btn
                  class="mb-15 mr-10"
                  @click="serviceType === 'Preventivo' ? searchInventory(filter) : searchCorrective(filter)"
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
            <QueryResult :xlsFormat="xlsFormat" :result="result" />
          </v-sheet>
        </v-tab-item>
      </v-tabs-items>
    </v-sheet>
  </v-container>
</template>
<script>

import Header from '@/components/generals/Header'
import QueryChips from '@/components/corrective/QueryChips'
import QueryResult from '@/components/corrective/QueryResult'
import moment from 'moment-timezone'
import { mapMutations, mapGetters, mapActions } from 'vuex'

export default {

  name: 'Consultation',
  components: { Header, QueryChips, QueryResult },

  data: () => {
    return {
      // Form data
      filter: {},
      technician: '',
      serviceType: 'Correctivo',
      dates: [],
      sla: '',
      result: [],
      tab: 0,
      xlsFormat: [],
      loader: false
    }
  },

  computed: {

    ...mapGetters(['formOptions']),
    
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
      if (this.dates[0] && !this.dates[1]) return this.dates[0]
      else return ''
    },

    statusOptions () {
      return ['Cerrado - Operativo', 'Cerrado - Reemplazado', 'Cerrado - Desincorporado']
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
      this.technician = ''
      this.sla = ''
    },

    searchCorrective (filter) {
      this.loader = true
      Promise.all([
        this.findDocuments({ collection: 'Closed', filter }),
        this.findDocuments({ collection: 'Active', filter })
      ])
        .then((res) => {
          this.result = [...res[0], ...res[1]]
          this.showSnackbar({ message: `Resultados de su búsqueda: ${this.result.length}` })
          if (this.result.length > 0) this.reportXlsFormat(this.result)
          this.loader = false
        })
        .catch(() => this.loader = false)
    },

    discardProps (filter) {
      delete filter.expired
      delete filter.status
      return filter
    },

    searchInventory (filter) {
      this.loader = true
      filter = this.discardProps(filter)
      console.log(filter)
      this.findDocuments({ collection: 'Inventory', filter })
        .then((res) => {
          this.result = res
          console.log(res)
          if (this.result.length) this.inventoryXlsFormat(this.result)
          this.showSnackbar({ message:  `Resultados de su búsqueda: ${this.result.length}`}),
          this.loader = false
        })
        .catch(() => this.loader = false)
    },

    reportXlsFormat (data) {
      const rows = []
      for (const i in data) {
        const filteredVisits = data[i].documentation.filter(i => i.visit)
        const Visitas = filteredVisits.length
        const lasVisit = Visitas ? filteredVisits[Visitas - 1] : null
        const Documentacion = lasVisit ? lasVisit.observations : data[i].documentation[data[i].documentation.length - 1].observations
        const Fecha_atencion = lasVisit
          ? moment(lasVisit.date).parseZone('America/Caracas').format('L LT')
          : moment(data[i].schedule.scheduledDate).parseZone('America/Caracas').format('L LT')
        const Repuestos = []
        for (const request of data[i].pieces) Repuestos.push(`${request.pieceName} (${request.quantity})`)
        rows.push({
          Fecha_reporte: moment(data[i].reportedAt).parseZone('America/Caracas').format('L LT'),
          Fecha_atencion,
          Cliente: data[i].clientName,
          Oficina: data[i].officeName,
          Estado: data[i].officeState,
          Region: data[i].officeRegion,
          Reporte: data[i].reportCode,
          Producto: data[i].productName,
          Serial: data[i].serialCode,
          Falla: data[i].description,
          Documentacion,
          Status: data[i].status,
          SLA: data[i].expired ? 'Fuera del acuerdo' : 'Dentro del acuerdo',
          Tecnico: lasVisit ? lasVisit.technician.fullName : data[i].schedule.technician.fullName,
          Categoria: data[i].category,
          Repuestos,
          Visitas
        })
      }
      this.xlsFormat = rows
      this.tab = 1
    },

    inventoryXlsFormat (data) {
      const rows = []
      for (const i in data) {
        rows.push({
          Cliente: data[i].clientName,
          Oficina: data[i].officeName,
          Estado: data[i].officeState,
          Region: data[i].officeRegion,
          Producto: data[i].productName,
          Serial: data[i].serialCode,
          Ubicación: data[i].location,
          Status: data[i].status,
          Técnico: data[i].schedule.technician.fullName,
          Fecha_atencion: data[i].schedule.scheduledDate,
          Orden_servicio: data[i].serviceOrder,
          Observaciones: data[i].observations
        })
      }
      this.xlsFormat = rows
      this.tab = 1
    }
  },

  watch: {

    sla: function () {
      this.filter.expired = this.sla === 'Fuera del acuerdo'
    },

    technician: function () {
      this.filter["$and"] =
        this.serviceType === 'Correctivo'
          ?  [
              { "reportedAt": { "$gte": this.dates[0] } },
              { "reportedAt": { "$lte": this.dates[1] } },
              { "schedule.technician.fullName": this.technician.fullName }
            ]
          : [
              { "schedule.scheduledDate": { "$gte": this.dates[0] } },
              { "schedule.scheduledDate": { "$lte": this.dates[1] } },
              { "schedule.technician": this.technician }
            ]
    },

    serviceType: function () {
      this.filter["$and"] = this.serviceType === 'Correctivo'
        ?  [
            { "reportedAt": { "$gte": this.dates[0] } },
            { "reportedAt": { "$lte": this.dates[1] } },
            { "schedule.technician.fullName": this.technician.fullName }
          ]
        : [
            { "schedule.scheduledDate": { "$gte": this.dates[0] } },
            { "schedule.scheduledDate": { "$lte": this.dates[1] } },
            { "schedule.technician.fullName": this.technician.fullName }
          ]
    },

    dates: function () {
      this.filter["$and"] = this.serviceType === 'Correctivo'
        ?  [
            { "reportedAt": { "$gte": this.dates[0] } },
            { "reportedAt": { "$lte": this.dates[1] } },
            { "schedule.technician.fullName": this.technician.fullName }
          ]
        : [
            { "schedule.scheduledDate": { "$gte": this.dates[0] } },
            { "schedule.scheduledDate": { "$lte": this.dates[1] } },
            { "schedule.technician.fullName": this.technician.fullName }
          ]
    }
  }
}
</script>
