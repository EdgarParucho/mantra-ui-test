<template>
  <v-container>
    <Header title="Estado general" subtitle="Indicadores de gestión" />
    <v-row>
      <v-col :cols="mobile ? 12 : 3">
        <v-row v-for="card, index in cards" :key="index">
          <DashboardCard :cardInfo="card" :mobile="mobile" />
        </v-row>
      </v-col>
      <v-col :cols="mobile ? 12 : 9">
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

import { mapState } from 'vuex'
import Header from '@/components/generals/Header'
import moment from 'moment-timezone'
import DashboardCard from '@/components/generals/DashboardCard'
import QueryResult from '@/components/corrective/QueryResult'

export default {
  name: 'Dashboard',
  components: { Header, DashboardCard, QueryResult },
  
  data:() => ({ showTodays: true }),

  computed: {

    ...mapState(['collections']),

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

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }

  }

}
</script>