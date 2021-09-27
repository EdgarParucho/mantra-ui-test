<template>
  <v-container>
    <Header :title="technicianName" subtitle="Indicadores individuales" />
    <v-row>
      <v-col v-for="card, index in cards" :key="index" :cols="mobile ? 12 : 4">
        <DashboardCard :cardInfo="card" :mobile="mobile" />
      </v-col>
    </v-row>
    
    <v-row justify="space-around">
      <v-col :cols="mobile ? 12 : 3">
        <v-sheet class="pa-3" v-if="updatingState">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph v-else id="dashboardGraph3" :updatingState="updatingState"
          :chartData="userSLA" title="Cumplimiento de S. L. A." :subtitle="thisYear"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <v-alert type="success" color="info" rounded="pill" text>
          Cerrados recientemente
        </v-alert>
        <v-chip-group v-model="currentWeek" color="secondary" mandatory>
          <v-chip :value="true" filter>Semana en curso</v-chip>
          <v-chip :value="false" filter>Semana pasada</v-chip>
        </v-chip-group>
        <v-expansion-panels>
          <v-expansion-panel v-for="day, index of selectedWeekData" :key="index" :disabled="!day.services.length">
            <v-expansion-panel-header>{{ day.name }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <Panel v-for="service, n of day.services" :key="n" :service="service" :mobile="mobile" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col :cols="mobile ? 12 : 3">
        <v-sheet class="pa-3" v-if="updatingState">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph v-else id="dashboardGraph4" :updatingState="updatingState"
          :chartData="userAveragePerVisits" title="Visitas por servicio" :subtitle="thisYear"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-sheet class="pa-3" v-if="updatingState">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph v-else id="dashboardGraph1" :updatingState="updatingState"
          :chartData="servicesXClient" title="Servicios por cliente" :subtitle="thisYear"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <v-sheet class="pa-3" v-if="updatingState">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph v-else id="dashboardGraph2" :updatingState="updatingState"
          :chartData="servicesXProduct" title="Servicios por producto" :subtitle="thisYear"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
import Header from '@/components/generals/Header'
import Panel from '@/components/generals/Panel'
import moment from 'moment-timezone'
import Graph from '@/components/generals/Graph'
import DashboardCard from '@/components/generals/DashboardCard'

export default {
  name: 'Technician',
  components: { Header, DashboardCard, Graph, Panel },
  
  data:() => ({
    currentWeek: true
  }),


  computed: {
    
    ...mapState(['collections', 'updatingState']),
    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    technicianName () {
      const selectedUser = this.collections.User.find(user => user._id === this.$route.params.id)
      return selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''
    },

    selectedWeekNumber () {
      const thisWeek = moment(new Date()).isoWeek()
      return this.currentWeek ? thisWeek : thisWeek - 1
    },

    selectedWeekData () {
      const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']
      const data = []
      for (const day of days) {
        const dayCorrectives = service => service.documentation.find(
          ({ date, visit }) => moment(date).parseZone('America/Caracas').format('dddd') === day
          && moment(date).parseZone('America/Caracas').isoWeek() === this.selectedWeekNumber
          && visit
        )
        const dayPreventives = ({ schedule }) => moment(schedule.scheduledDate).parseZone('America/Caracas').format('dddd') === day
          && moment(schedule.scheduledDate).parseZone('America/Caracas').isoWeek() === this.selectedWeekNumber
        const correctives = this.userServices.closeds.filter(dayCorrectives)
        const preventives = this.userServices.maintenances.filter(dayPreventives)
        data.push({
          name: day,
          services: [...correctives, ...preventives]
        })
      }
      return data
    },

    cards () {
      return [
        { data: this.userServices.actives, title: 'Asignaciones', icon: require('@/assets/svg/resume.svg') },
        { data: this.userServices.closeds, title: `Cerrados - ${this.thisYear}` , icon: require('@/assets/svg/calendar.svg') },
        { data: this.userServices.notValidated, title: 'Por validar', icon: require('@/assets/svg/messages.svg') }
      ]
    },

    userServices () {
      const filterByUser = service => service.schedule.technician._id === this.$route.params.id
      const reportNotValidated = service => service.documentation.find(
        register => register.serviceOrder && !register.serviceOrder.validated && register.serviceOrder.number !== ''
      )
      const activeReports = this.collections.Active.filter(filterByUser)
      const activeMaintenances = this.collections.Maintenance.filter(service => service.schedule.technician._id === this.$route.params.id
        && service.status !== 'Validado' && service.status !== 'Culminado')
      const actives = [...activeReports, ...activeMaintenances]
      const maintenances = this.collections.Maintenance.filter(filterByUser)
      const closeds = this.collections.Closed.filter(filterByUser)
      const notValidated = [
        ...maintenances.filter(service => service.status === 'Culminado'),
        ...closeds.filter(reportNotValidated)
      ]
      const productsPerMaintenance = maintenances.reduce((acc, val) => [...val.inventory], [])
      return { actives, closeds, maintenances, notValidated, productsPerMaintenance }
    },

    servicesXClient () {
      const type = 'bar'
      const options = {}
      const labels = this.formOptions.clients.map(client => client.clientName)
      const data = {
        labels,
        datasets: [
          { label: 'Correctivo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.primary, borderRadius: 5 },
          { label: 'Preventivo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.accent, borderRadius: 5 }
        ]
      }
      for (const client of data.labels) {
        const servicesPerClient = service => service.clientName === client
        data.datasets[0].data.push(this.userServices.closeds.filter(servicesPerClient).length)
        data.datasets[1].data.push(this.userServices.maintenances.filter(servicesPerClient).length)
      }
      return { type, data, options }
    },

    servicesXProduct () {
      let labels = this.collections.Product.map(product => product.productType)
      labels = [...new Set(labels)].sort()
      const chart = {
        title: 'Servicios por producto',
        config: {
          type: 'line',
          options: {},
          data: {
            labels,
            datasets: [
              {
                label: 'Correctivo',
                data: [],
                borderColor: this.$vuetify.theme.currentTheme.primary
              },
              {
                label: 'Preventivo',
                data: [],
                borderColor: this.$vuetify.theme.currentTheme.accent
              }
            ]
          }
        }
      }
      for (const label of labels) {
        const servicesPerProduct = service => service.productType === label
        chart.config.data.datasets[0].data.push(this.userServices.closeds.filter(servicesPerProduct).length)
        chart.config.data.datasets[1].data.push(this.userServices.productsPerMaintenance.filter(servicesPerProduct).length)
      }
      return chart.config
    },

    userSLA () {
      const type = 'doughnut'
      const options = {}
      const labels = ['Dentro del acuerdo', 'Fuera del acuerdo']
      const data = {
        labels,
        datasets: [
          { label: 'Dentro del acuerdo', data: [], backgroundColor: [this.$vuetify.theme.currentTheme.primary, this.$vuetify.theme.currentTheme.error] }
        ]
      }
      const reports = this.userServices.closeds.filter(service => !service.itsSpecial)
      const slaOk = reports.filter(service => !service.expired)
      const slaExpired = reports.filter(service => service.expired)
      data.datasets[0].data.push(slaOk.length)
      data.datasets[0].data.push(slaExpired.length)
      return { type, data, options }
    },

    userAveragePerVisits () {
      const type = 'pie'
      const options = {}
      const labels = ['1 visita', '2 o más visitas']
      const data = {
        labels,
        datasets: [
          { data: [], backgroundColor: [this.$vuetify.theme.currentTheme.primary, this.$vuetify.theme.currentTheme.error] }
        ]
      }
      const oneVisitServices = this.userServices.closeds.filter(service => service.documentation.filter(register => register.visit).length === 1)
      const overOneVisitServices = this.userServices.closeds.filter(service => service.documentation.filter(register => register.visit).length > 1)
      data.datasets[0].data.push(oneVisitServices.length)
      data.datasets[0].data.push(overOneVisitServices.length)
      return { type, data, options }
    },

    thisYear () {
      return moment(new Date()).format('YYYY')
    }

  }
}
</script>
