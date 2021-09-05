<template>
  <v-container>
    <Header title="Estado general" :subtitle="`Indicadores de gestión - ${thisMonth}`" />
    <v-alert type="info" icon="mdi-tools" color="primary" dense>
      Los indicadores de mantenimiento <b>correctivo</b> se contabilizan por reporte o servicio especial.
    </v-alert>
    <v-alert type="info" icon="mdi-broom" color="accent" dense>
      Los indicadores de mantenimiento <b>preventivo</b> se contabilizan por oficina culminada y orden validada.
    </v-alert>
    <v-row>
      <v-col v-for="card, index in cards" :key="index" :cols="mobile ? 12 : 4">
        <DashboardCard :cardInfo="card" :mobile="mobile" />
      </v-col>
    </v-row>
    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-sheet class="pa-3" v-if="loading">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph v-else id="dashboardGraph2" :loading="loading" :chartData="servicesXClient" title="Servicios por cliente" :subtitle="thisMonth" />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <v-sheet class="pa-3" v-if="loading">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph v-else id="dashboardGraph1" :loading="loading" :chartData="servicesXTechnician" title="Servicios por técnico" :subtitle="thisMonth" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Asignaciones del día</v-card-title>
          <v-chip-group mandatory active-class="primary--text" light>
            <v-icon>mdi-filter</v-icon>
            <v-chip @click="showTodays = true" small>
              {{ today }}
            </v-chip>
            <v-chip @click="showTodays = false" small>
              {{ nextWorkingDay }}
            </v-chip>
          </v-chip-group>
          <QueryResult :result="showTodays ? todaySchedule : nextDaySchedule" :mobile="mobile" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
import Header from '@/components/generals/Header'
import moment from 'moment-timezone'
import Graph from '@/components/generals/Graph'
import DashboardCard from '@/components/generals/DashboardCard'
import QueryResult from '@/components/corrective/QueryResult'

export default {
  name: 'Dashboard',
  components: { Header, DashboardCard, QueryResult, Graph },
  
  data:() => ({ showTodays: true }),

  computed: {

    ...mapState(['collections', 'loading']),
    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    cards () {
      return [
        { data: this.nextToExpire, title: 'Próximos a vencer', icon: require('@/assets/svg/timer.svg') },
        { data: this.collections.Closed, title: `Cerrados - ${moment(new Date()).format('MMMM')}` , icon: require('@/assets/svg/file.svg') },
        { data: this.expiredServices, title: 'Fuera del acuerdo', icon: require('@/assets/svg/sla.svg') }
      ]
    },
    
    today () {
      return moment(new Date()).format('dddd')
    },  

    nextWorkingDay () {
      let daysToAdd = 1
      if (this.today === 'viernes') daysToAdd = 3
      if (this.today === 'sábado') daysToAdd = 2
      return moment(new Date()).add(daysToAdd, 'days').format('dddd')
    },

    todaySchedule () {
      const todayFilter = service =>
        moment(service.schedule.scheduledDate).parseZone('America/Caracas').format('D-M-yy') === moment(new Date()).format('D-M-yy')
      const allServices = [...this.collections.Active, ...this.collections.Closed, ...this.collections.Maintenance]
      const todaySchedule = allServices.filter(todayFilter)
      return todaySchedule
    },

    nextDaySchedule () {
      let daysToAdd = 1
      if (this.today === 'viernes') daysToAdd = 3
      if (this.today === 'sábado') daysToAdd = 2
      const tomorrowFilter = service =>
        moment(service.schedule.scheduledDate).parseZone('America/Caracas').format('D-M-yy') === moment(new Date()).add(daysToAdd, 'days').format('D-M-yy')
      const allServices = [...this.collections.Active, ...this.collections.Closed, ...this.collections.Maintenance]
      const nextDaySchedule = allServices.filter(tomorrowFilter)
      return nextDaySchedule
    },

    nextToExpire () {
      const reports = this.collections.Active.filter(service => !service.itsSpecial)
      const nextToExpire = reports.filter(report => moment(report.expireDate)
        .diff(new Date(), 'hours') < 15
        && moment(report.expireDate)
        .diff(new Date(), 'hours') > -1)
      return nextToExpire
    },

    expiredServices () {
      return this.collections.Closed.filter(service => service.expired)
    },

    thisMonth () {
      return moment(new Date()).format('MMMM')
    },

    corrective () {
      return [...this.collections.Active, ...this.collections.Closed]
    },

    servicesXClient () {
      const type = 'bar'
      const options = {}
      const data = {
        labels: this.formOptions.clients.map(client => client.clientName),
        datasets: [
          { label: 'Correctivo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.primary },
          { label: 'Preventivo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.accent }
        ]
      }
      for (const client of this.formOptions.clients) {
        const clientServices = service => service.clientName === client.clientName
        data.datasets[0].data.push(this.corrective.filter(clientServices).length)
      }
      for (const client of this.formOptions.clients) {
        const clientServices = office => office.clientName === client.clientName
        data.datasets[1].data.push(this.finishedMaint.filter(clientServices).length)
      }
      return { type, data, options }
    },

    servicesXTechnician () {
      const type = 'line'
      const options = {}
      const data = {
        labels: this.formOptions.technicians.map(tech => tech.text),
        datasets: [
          { label: 'Correctivo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.primary },
          { label: 'Preventivo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.accent  }
        ]
      }
      for (const technician of this.formOptions.technicians) {
        const technicianServices = service => service.schedule.technician.fullName === technician.text
        data.datasets[0].data.push(this.corrective.filter(technicianServices).length)
      }
      for (const technician of this.formOptions.technicians) {
        const technicianServices = office => office.inventory.filter(product => product.schedule.technician.fullName === technician.text).length
        data.datasets[1].data.push(this.finishedMaint.filter(technicianServices).length)
      }
      return { type, data, options }
    },

    finishedMaint () {
      const lastMonthFirst = new Date(new Date().getFullYear(), new Date().getMonth() -1, 1)
      const thisMonthFirst = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const afterLastMonth = (office) => moment(office.lastMaintenance).parseZone('America/Caracas').isAfter(lastMonthFirst)
      const beforeThisMonth = (office) => moment(office.lastMaintenance).parseZone('America/Caracas').isBefore(thisMonthFirst)
      const main = this.collections.Office.filter(office => afterLastMonth(office) && beforeThisMonth(office))
      return main
    }
  }

}
</script>
