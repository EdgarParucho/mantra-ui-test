<template>
  <v-container>
    <Header title="Personal técnico" subtitle="Indicadores individuales" />
    
    <v-row justify="space-around">
      <v-col :cols="mobile ? 12 : 6">
        <v-sheet class="pa-3" v-if="updatingState">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph v-else id="techniciansGraph1" :updatingState="updatingState"
          :chartData="productsPerTechnician" title="Productos atendidos" :subtitle="`Atenciones (${thisYear})`"
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
        <Graph v-else id="techniciansGraph2" :updatingState="updatingState"
          :chartData="servicesPerState" title="Productos por estado" :subtitle="`Atenciones (${thisYear})`"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col :cols="mobile ? 12 : 8">
        <v-card>
          <v-card-title>
            Resumen
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :search="search"
            :items="techniciansStats"
            :headers="tableHeaders"
          >
            <template v-slot:item.name="{ item }">
              <RouterLink :to="`/technician/${item._id}`">
                {{ item.name }}
              </RouterLink>
            </template>
            <template v-slot:item.oneVisitReports="{ item }">
              {{ item.oneVisitReports | average }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col :cols="mobile ? 12 : 4">
        <v-sheet class="pa-3" v-if="updatingState">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph v-else id="techniciansGraph3" :updatingState="updatingState"
          :chartData="oneVisitAverage" title="Efectividad en 1era visita" :subtitle="`Atenciones (${thisYear})`"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import { states } from '@/helpers/form'
import { mapState, mapGetters } from 'vuex'
import Header from '@/components/generals/Header'
import moment from 'moment-timezone'
import Graph from '@/components/generals/Graph'

export default {
  name: 'Technicians',
  components: { Header, Graph },
  
  data:() => ({
    states,
    tableHeaders: [
      { text: 'Técnico', value: 'name' },
      { text: 'Productos por correctivo', value: 'totalReports' },
      { text: 'Productos por preventivo', value: 'totalMaintenances' },
      { text: 'Efectividad (1 visita)', value: 'oneVisitReports'}
    ],
    search: ''
  }),

  filters: {
    average (val) {
      return `${val}%`
    }
  },

  computed: {

    ...mapState(['collections', 'updatingState']),
    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    productsPerMaintenance () {
      const closedMaintenance = this.collections.Maintenance.filter(service => service.status !== 'Asignado')
      return closedMaintenance.reduce((acc, val) => [...val.inventory], [])
    },

    productsPerTechnician () {
      let labels = this.collections.User.filter(user => user.assignable)
      labels = labels.map(user => `${user.firstName} ${user.lastName}`).sort()
      const chart = {
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
      for (const label of labels) {
        const userServices = service => service.schedule.technician.fullName === label
        chart.data.datasets[0].data.push(this.collections.Closed.filter(userServices).length)
        chart.data.datasets[1].data.push(this.productsPerMaintenance.filter(userServices).length)
      }
      return chart
    },

    servicesPerState () {
      const chart = {
        type: 'line',
        options: {},
        data: {
          labels: this.states,
          datasets: [
            {
              label: 'Correctivo',
              data: [],
              backgroundColor: this.$vuetify.theme.currentTheme.primary
            },
            {
              label: 'Preventivo',
              data: [],
              backgroundColor: this.$vuetify.theme.currentTheme.accent
            }
          ]
        }
      }
      for (const label of chart.data.labels) {
        const stateServices = service => service.officeState === label
        chart.data.datasets[0].data.push(this.collections.Closed.filter(stateServices).length)
        chart.data.datasets[1].data.push(this.productsPerMaintenance.filter(stateServices).length)
      }
      return chart
    },

    oneVisitAverage () {
      const type = 'pie'
      const options = {
        plugins: {
          tooltip: {
            callbacks: {
              label: context => {
                return ` ${context.label}: ${context.parsed}%`
              }
            }
          }
        }
      }
      const labels = ['1 visita', '2 o más visitas']
      const data = {
        labels,
        datasets: [
          { data: [], backgroundColor: [this.$vuetify.theme.currentTheme.primary, this.$vuetify.theme.currentTheme.error] }
        ]
      }
      const oneVisitServices = this.techniciansStats.reduce((acc, val) => acc + val.oneVisitReports, 0) / this.techniciansStats.length
      data.datasets[0].data.push(Math.round(oneVisitServices))
      data.datasets[0].data.push(100 - Math.round(oneVisitServices))
      return { type, data, options }
    },

    techniciansStats () {
      const technicians = this.collections.User.filter(user => user.assignable)
      const stats = []
      for (const technician of technicians) {
        const totalReports = this.collections.Closed.filter(service => service.schedule.technician._id === technician._id)
        const totalMaintenances = this.productsPerMaintenance.filter(service => service.schedule.technician._id === technician._id)
        const oneVisitReports = totalReports.filter(service => service.documentation.filter(register => register.visit).length === 1)
        const average = totalReports.length ? (oneVisitReports.length * 100) / totalReports.length : 0
        stats.push({
          _id: technician._id,
          name: `${technician.firstName} ${technician.lastName}`,
          totalReports: totalReports.length,
          totalMaintenances: totalMaintenances.length,
          oneVisitReports: Math.round(average),
        })
      }
      return stats
    },

    thisYear () {
      return moment(new Date()).format('YYYY')
    }

  }
}
</script>
