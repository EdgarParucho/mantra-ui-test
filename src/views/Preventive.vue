<template>
  <v-container>
    <Header title="Mantenimiento preventivo" subtitle="Servicios programados e inventario de clientes" />
    <v-row justify="center">
      <v-col :cols="mobile ? 12 : 3" v-for="card, index in cards" :key="index">
        <DashboardCard :cardInfo="card" :mobile="mobile" />
      </v-col>
    </v-row>
    <v-row justify="space-between">
      <v-col :cols="mobile ? 12 : 8">
        <v-skeleton-loader v-if="loading" type="image" width="100%" />
				<v-skeleton-loader v-if="loading" type="image" width="100%" />
        <MaintenancePanels
          v-else
          :collections="collections"
          :mobile="mobile"
          :finishedMaintenance="finishedMaintenance"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 4">
        <v-sheet class="pa-3" v-if="loading">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph
          v-else
          id="preventiveGraph1"
          :loading="loading"
          :chartData="servicesXStatus"
          title="Estatus de servicios"
          :subtitle="`Mantenimiento preventivo - ${thisMonth}`"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet class="pa-3" v-if="loading">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph
          v-else
          id="preventiveGraph2"
          :loading="loading"
          :chartData="servicesXClient"
          title="Servicios por cliente"
          :subtitle="`Mantenimiento preventivo - ${thisMonth}`"
        />
      </v-col>
      <v-col>
        <v-sheet class="pa-3" v-if="loading">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph
          v-else
          id="preventiveGraph3"
          :loading="loading"
          :chartData="servicesXTechnician"
          title="Servicios por técnico"
          :subtitle="`Mantenimiento preventivo - ${thisMonth}`"
        />
      </v-col>
    </v-row>

    <MainButton @showForm="dialog = true" :loading="loading" />

    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="dialog">
      <v-card>
        <MaintenanceForm
          v-if="dialog"
          :mobile="mobile"
          :collections="collections"
          @hideInterface="dialog =  false"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

import Graph from '@/components/generals/Graph'
import { mapState, mapGetters } from 'vuex'
import moment from 'moment-timezone'
import Header from '@/components/generals/Header'
import MainButton from '@/components/generals/MainButton'
import MaintenanceForm from '@/components/preventive/MaintenanceForm'
// import MaintenanceTable from '@/components/preventive/MaintenanceTable'
import MaintenancePanels from '@/components/preventive/MaintenancePanels.vue'
import DashboardCard from '@/components/generals/DashboardCard'

export default {
  name: 'Preventive',
  components: {
    DashboardCard,
    Graph,
    Header,
    MainButton,
    MaintenancePanels,
    MaintenanceForm,
    // MaintenanceTable
  },

  data: () => {
    return {
      dialog: false
    }
  },

  computed: {

    ...mapState(['collections', 'loading']),
    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    thisYearFirst () {
      return `${moment(new Date()).format('yyyy')}-01-01`
    },

    thisMonth () {
      return moment(new Date()).format('MMMM')
    },

    servicesXStatus () {
      const type = 'polarArea'
      const options = {}
      let statusOptions = this.finishedMaintenance.map(service => service.status)
      statusOptions = [...new Set(statusOptions)]
      const data = {
        labels: statusOptions,
        datasets: [{ label: 'Preventivo', data: [], backgroundColor: [] }]
      }
      for (const status of statusOptions) {
        data.datasets[0].backgroundColor.push(this.colorsXStatus[status])
        data.datasets[0].data.push(this.finishedMaintenance.filter(service => service.status === status).length)
      }
      return { type, data, options }
    },

    colorsXStatus () {
      return {
        "Validado": this.$vuetify.theme.currentTheme.success,
        "Culminado": this.$vuetify.theme.currentTheme.secondary,
        "Por culminar": this.$vuetify.theme.currentTheme.info,
        "Asignado": this.$vuetify.theme.currentTheme.warning
      }
    },

    servicesXClient () {
      const type = 'bar'
      const options = {}
      const data = {
        labels: this.formOptions.clients.map(client => client.clientName),
        datasets: [
          { label: 'Servicios por preventivo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.accent }
        ]
      }
      for (const client of this.formOptions.clients) {
        const clientServices = office => office.clientName === client.clientName
        data.datasets[0].data.push(this.finishedMaintenance.filter(clientServices).length)
      }
      return { type, data, options }
    },

    servicesXTechnician () {
      const type = 'line'
      const options = {}
      const data = {
        labels: this.formOptions.technicians.map(tech => tech.text),
        datasets: [
          { label: 'Servicios por preventivo', data: [], borderColor: this.$vuetify.theme.currentTheme.accent  }
        ]
      }
      for (const technician of this.formOptions.technicians) {
        const technicianServices = office => office.inventory.filter(product => product.schedule.technician.fullName === technician.text).length
        data.datasets[0].data.push(this.finishedMaintenance.filter(technicianServices).length)
      }
      return { type, data, options }
    },

    finishedMaintenance () {
      const thisMonthFirst = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const fromThisMonth = (service) => moment(service.schedule.scheduledDate).parseZone('America/Caracas').isSameOrAfter(thisMonthFirst)
      const main = this.collections.Maintenance.filter(service => fromThisMonth(service))
      console.log(main)
      return main
    },

    cards () {
      return [
        {
          data: this.collections.Maintenance.filter(service => service.status !== 'Culminado'),
          title: 'Asignados',
          icon: require('@/assets/svg/dashboard.svg')
        },
        {
          data: this.collections.Maintenance.filter(service => service.status === 'Culminado'),
          title: 'Por validar',
          icon: require('@/assets/svg/gear.svg')
        }
      ]
    }

  }

}
</script>
