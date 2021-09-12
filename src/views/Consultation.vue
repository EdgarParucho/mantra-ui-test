<template>
  <v-container>
    <Header
      title="Consultas"
      subtitle="Especifique los valores para realizar una consulta"
    />
    <v-sheet class="px-3">
      <v-row align="center">
        <v-col>
          <v-tabs v-model="tab">
            <v-tabs-slider color="accent" />
            <v-tab>Filtro</v-tab>
            <v-tab :disabled="!result.length">Resultado</v-tab>
          </v-tabs>
        </v-col>  
        <v-col>
          <QueryChips v-show="!tab" @submitQuery="searchCorrective" />
        </v-col>
      </v-row>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-form ref="form">
            <v-row>
              <v-col :cols="mobile ? 12 : 6">
                <v-row align="center">
                  <v-col :cols="6">
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
                  <v-col align="end">
                    <v-btn
                      v-show="!tab"
                      class="my-1"
                      @click="clearFilter"
                      :block="mobile"
                      :color="serviceType === 'Correctivo' ? 'primary' : 'accent'"
                      small
                    >
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
                <small class="font-weight-bold">Filtrar por fecha de:</small>
                <v-row>
                  <v-col :cols="mobile ? 12 : 6">
                    <v-radio-group row v-model="dateFilter" :disabled="serviceType === 'Preventivo'">
                      <v-radio
                        v-for="(n, i) in ['reportedAt', 'schedule.scheduledDate']"
                        :key="i"
                        :label="n === 'reportedAt' ? 'Reporte' : 'Atención'"
                        :value="n"
                      />
                    </v-radio-group>
                  </v-col>
                  <v-col :cols="mobile ? 12 : 6">
                    <v-chip-group color="accent">
                      <v-icon>mdi-filter</v-icon>
                      <v-chip @click="dateQuickFilter('thisYear')" small>{{ thisYear }}</v-chip>
                      <v-chip @click="dateQuickFilter('thisMonth')" small>{{ thisMonth }}</v-chip>
                      <v-chip @click="dateQuickFilter('lastMonth')" small>{{ lastMonth }}</v-chip>
                    </v-chip-group>
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
          <v-row justify="center" v-if="resultIsCorrective && result.length">
            <v-col :cols="mobile ? 12 : 3">
              <DashboardCard :cardInfo="cardInfo" :mobile="mobile" />
            </v-col>
          </v-row>
          <QueryResult :xlsFormat="xlsFormat" :result="result" />
          <v-row>
            <v-col v-for="chart, index in charts" :key="index" :cols="mobile ? 12 : 6">
              <Graph
                v-if="showGraphs"
                :id="`consultationGraph${index}`"
                :title="chart.title"
                :chartData="chart.config"
                :subtitle="resultIsCorrective ? 'Correctivo' : 'Preventivo'"
              />
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs-items>
    </v-sheet>
  </v-container>
</template>
<script>

import DashboardCard from '@/components/generals/DashboardCard'
import Graph from '@/components/generals/Graph'
import Header from '@/components/generals/Header'
import QueryChips from '@/components/corrective/QueryChips'
import QueryResult from '@/components/corrective/QueryResult'
import moment from 'moment-timezone'
import { mapMutations, mapGetters, mapActions } from 'vuex'

export default {

  name: 'Consultation',
  components: {
    DashboardCard,
    Graph,
    Header,
    QueryChips,
    QueryResult
  },

  data: () => {
    return {
      showGraphs: true,
      filter: {},
      dateFilter: 'schedule.scheduledDate',
      technician: '',
      serviceType: 'Correctivo',
      dates: [],
      sla: '',
      result: [],
      tab: 0,
      xlsFormat: [],
      loader: false,
      resultIsCorrective: false
    }
  },

  computed: {

    ...mapGetters(['formOptions']),
    
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    cardInfo () {
      const withServiceOrders = this.result.filter(
        service => service.documentation.find(
          register => register.serviceOrder && !register.serviceOrder.validated && register.serviceOrder.number !== ''
        )
      )
      return {
        title: 'Por validar',
        data: withServiceOrders,
        icon: require('@/assets/svg/messages.svg')
      }
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

    minDate () {
      if (this.dates[0] && !this.dates[1]) return this.dates[0]
      else return ''
    },

    statusOptions () {
      return ['Cerrado - Operativo', 'Cerrado - Reemplazado', 'Cerrado - Desincorporado']
    },

    servicesXClient () {
      let labels = this.result.map(service => service.clientName)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Servicios por cliente',
        config: {
          type: 'radar',
          options: {},
          data: {
            labels,
            datasets: [{
              label: 'Servicios registrados',
              data: [],
              backgroundColor: this.chartColor()
            }]
          }
        }
      }
      for (const client of labels) {
        const clientServices = service => service.clientName === client
        chart.config.data.datasets[0].data.push(this.result.filter(clientServices).length)
      }
      return chart
    },

    servicesXTechnician () {
      let labels = this.result.map(service => service.schedule.technician.fullName)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Servicios por técnico',
        config: {
          type: 'radar',
          options: {},
          data: {
            labels,
            datasets: [{ label: 'Servicios registrados', data: [], borderColor: this.chartColor() }]
          }
        }
      }
      for (const technician of labels) {
        const technicianServices = service => service.schedule.technician.fullName === technician
        chart.config.data.datasets[0].data.push(this.result.filter(technicianServices).length)
      }
      return chart
    },

    servicesXProduct () {
      let labels = this.result.map(service => service.productType)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Servicios por producto',
        config: {
          type: 'line',
          options: { indexAxis: 'y' },
          data: {
            labels,
            datasets: [{
              label: 'Servicios registrados',
              data: [],
              borderColor: this.chartColor()
            }]
          }
        }
      }
      for (const label of labels) {
        const productCorrectives = service => service.productType === label
        chart.config.data.datasets[0].data.push(this.result.filter(productCorrectives).length)
      }
      return chart
    },

    servicesXState () {
      let labels = this.result.map(service => service.officeState)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Servicios por estado',
        config: {
          type: 'bar',
          options: {},
          data: {
            labels,
            datasets: [{
              label: 'Servicios registrados',
              data: [],
              backgroundColor: this.chartColor(),
              borderRadius: 5
            }]
          }
        }
      }
      for (const label of labels) {
        const productCorrectives = service => service.officeState === label
        chart.config.data.datasets[0].data.push(this.result.filter(productCorrectives).length)
      }
      return chart
    },

    servicesXMonth () {
      const labels = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
      const chart = {
        title: 'Servicios por mes',
        config: {
          type: 'line',
          options: {},
          data: {
            labels,
            datasets: [{ label: 'Fecha de atención', data: [], borderColor: this.chartColor() }]
          }
        }
      }
      if (this.serviceType === 'Correctivo') chart.config.data.datasets.push(
        { label: 'Fecha de reporte', data: [], borderColor: this.$vuetify.theme.currentTheme.secondary }
      )
      for (const label of labels) {
        const servicesByReportDate = service => moment(service.reportedAt).format('MMMM') === label
        const servicesByScheduledDate = service => moment(service.schedule.scheduledDate).format('MMMM') === label
        chart.config.data.datasets[0].data.push(this.result.filter(servicesByScheduledDate).length)
        if (this.serviceType === 'Correctivo') chart.config.data.datasets[1].data.push(this.result.filter(servicesByReportDate).length)
      }
      return chart
    },

    slaXClient () {
      let labels = this.result.map(service => service.clientName)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'S. L. A. Por cliente',
        config: {
          data: {
            datasets: [
              {
                type: 'bar',
                label: '% Cumplimiento',
                data: [],
                backgroundColor: this.$vuetify.theme.currentTheme.primary,
                borderRadius: 5
              },
              {
                type: 'line',
                label: 'Meta',
                data: [],
                borderColor: this.$vuetify.theme.currentTheme.secondary
              },
              {
                type: 'line',
                label: 'Promedio general',
                data: [],
                borderColor: '',
              }
            ],
            labels
          },
          options: {
            scales: {
              y: { ticks: { callback: (value) => '%' + value}}
            }
          }
        }
      }
      let generalAverage = 0
      for (const label of labels) {
        const clientServices = this.result.filter(service => service.clientName === label && !service.itsSpecial)
        const slaOk = clientServices.filter(service => !service.expired)
        const clientAverage = (slaOk.length / clientServices.length) * 100
        chart.config.data.datasets[0].data.push(clientAverage)
        chart.config.data.datasets[1].data.push(95)
        generalAverage = generalAverage + clientAverage
      }
      generalAverage = generalAverage / labels.length
      let counter = 0
      do {
        chart.config.data.datasets[2].data.push(generalAverage)
        counter++
      } while (counter <= labels.length)
      chart.config.data.datasets[2].borderColor = (generalAverage >= 95)
        ? this.$vuetify.theme.currentTheme.success
        : this.$vuetify.theme.currentTheme.error
      return chart
    },

    charts () {
      const correctiveCharts = [
        this.servicesXClient, this.servicesXTechnician, this.servicesXProduct, this.servicesXState, this.servicesXMonth, this.slaXClient
      ]
      const preventiveCharts = [
        this.servicesXClient, this.servicesXTechnician, this.servicesXProduct, this.servicesXState
      ]
      return this.serviceType === 'Correctivo' ? correctiveCharts : preventiveCharts
    }

  },

  methods: {

    ...mapActions(['findDocuments']),
    ...mapMutations(['showSnackbar']),

    chartColor () {
      return this.serviceType === 'Correctivo' ? this.$vuetify.theme.currentTheme.primary : this.$vuetify.theme.currentTheme.accent
    },
    
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
      this.showGraphs = false
      this.loader = true
      Promise.all([
        this.findDocuments({ collection: 'Closed', filter }),
        this.findDocuments({ collection: 'Active', filter })
      ])
        .then((res) => {
          this.loader = false
          this.result = [...res[0], ...res[1]]
          this.showSnackbar({ message: `Resultados de su búsqueda: ${this.result.length}` })
          if (this.result.length < 1) return
          this.reportXlsFormat(this.result)
          this.resultIsCorrective =  true
          this.showGraphs = true
        })
        .catch(() => this.loader = false)
    },

    discardProps (filter) {
      delete filter.expired
      delete filter.status
      return filter
    },

    searchInventory (filter) {
      this.showGraphs = false
      this.loader = true
      filter = this.discardProps(filter)
      console.log(filter)
      this.findDocuments({ collection: 'Inventory', filter })
        .then((res) => {
          this.result = res
          if (this.result.length) this.inventoryXlsFormat(this.result)
          this.showSnackbar({ message:  `Resultados de su búsqueda: ${this.result.length}`}),
          this.resultIsCorrective =  false
          this.loader = false
          this.showGraphs = true
        })
        .catch(() => this.loader = false)
    },

    reportXlsFormat (data) {
      const rows = []
      for (const service of data) {
        const filteredVisits = service.documentation.filter(i => i.visit)
        const Visitas = filteredVisits.length
        const lasVisit = Visitas ? filteredVisits[Visitas - 1] : null
        const Documentacion = lasVisit ? lasVisit.observations : service.documentation[service.documentation.length - 1].observations
        const Fecha_atencion = lasVisit
          ? moment(lasVisit.date).parseZone('America/Caracas').format('L LT')
          : moment(service.schedule.scheduledDate).parseZone('America/Caracas').format('L LT')
        const Repuestos = []
        for (const request of service.pieces) Repuestos.push(`${request.pieceName} (${request.quantity})`)
        rows.push({
          Fecha_reporte: moment(service.reportedAt).parseZone('America/Caracas').format('L LT'),
          Fecha_atencion,
          Cliente: service.clientName,
          Oficina: service.officeName,
          Estado: service.officeState,
          Region: service.officeRegion,
          Reporte: service.reportCode,
          Producto: service.productName,
          Serial: service.serialCode,
          Falla: service.description,
          Documentacion,
          Status: service.status,
          SLA: service.expired ? 'Fuera del acuerdo' : 'Dentro del acuerdo',
          Tecnico: lasVisit ? lasVisit.technician.fullName : service.schedule.technician.fullName,
          Categoria: service.category,
          Repuestos,
          Visitas,
          Zona: service.isLocal ? 'Local' : 'Foránea'
        })
      }
      this.xlsFormat = rows
      this.tab = 1
    },

    inventoryXlsFormat (data) {
      const rows = []
      for (const service of data) {
        rows.push({
          Cliente: service.clientName,
          Oficina: service.officeName,
          Estado: service.officeState,
          Region: service.officeRegion,
          Producto: service.productName,
          Serial: service.serialCode,
          Ubicación: service.location,
          Status: service.status,
          Técnico: service.schedule.technician.fullName,
          Fecha_atencion: service.schedule.scheduledDate,
          Orden_servicio: service.serviceOrder,
          Observaciones: service.observations
        })
      }
      this.xlsFormat = rows
      this.tab = 1
    },

    assembleFilter () {
      const filterDateBy = this.serviceType === 'Preventivo' ? 'schedule.scheduledDate' : this.dateFilter
      this.filter["$and"] = [
        { [filterDateBy]: { "$gte": this.dates[0] } },
        { [filterDateBy]: { "$lte": this.dates[1] } },
        { "schedule.technician.fullName": this.technician.fullName }
      ]
    }
  },

  watch: {

    sla: function () {
      this.filter.expired = this.sla === 'Fuera del acuerdo'
    },

    technician: function () {
      this.assembleFilter()
    },

    serviceType: function () {
      this.assembleFilter()
    },

    dates: function () {
      this.assembleFilter()
    },
  
    dateFilter: function () {
      this.assembleFilter()
    }
  }

}
</script>
