<template>
  <v-container>
    <Header title="Mantenimiento correctivo" subtitle="Bandeja de servicios activos" />
    <v-row justify="center">
      <v-col :cols="mobile ? 12 : 3" v-for="card, index in cards" :key="index">
        <DashboardCard :cardInfo="card" :mobile="mobile" />
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
        <Graph
          v-else
          id="correctiveGraph2"
          :updatingState="updatingState"
          :chartData="servicesXClient"
          title="Servicios por cliente"
          :subtitle="`Mantenimiento correctivo - ${thisMonth}`"
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
        <Graph
          v-else
          id="correctiveGraph3"
          :updatingState="updatingState"
          :chartData="servicesXTechnician"
          title="Servicios por técnico"
          :subtitle="`Mantenimiento correctivo - ${thisMonth}`"
        />
      </v-col>
    </v-row>
    <v-row justify="space-between">
      <v-col :cols="mobile ? 12 : 8">
        <v-skeleton-loader v-if="updatingState" type="image" width="100%" />
				<v-skeleton-loader v-if="updatingState" type="image" width="100%" />
        <CorrectivePanels
          v-else
          :mobile="mobile"
          :collections="collections"
          :orderedServices="orderedServices"
          @searchRelated="(service) => searchRelated(service, notifyAnyway = true)"
        />

      </v-col>
      <v-col :cols="mobile ? 12 : 4">
        <v-sheet class="pa-3" v-if="updatingState">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph
          v-else
          id="correctiveGraph1"
          :updatingState="updatingState"
          :chartData="servicesXStatus"
          title="Estatus de servicios"
          :subtitle="`Mantenimiento correctivo - ${thisMonth}`"
        />
      </v-col>
    </v-row>

    <MainButton @showForm="dialog = true" :updatingState="updatingState" />

    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="dialog">
      <v-card>

        <CorrectiveForm
          v-if="dialog"
          :mobile="mobile"
          :collections="collections"
          @hideInterface="dialog = false"
          @searchRelated="searchRelated"
        />

      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" dark outlined :timeout="2000" rounded="pill" centered transition="fab-transition">
      <v-row align="center">
        <v-col>
          <span class="white--text">
            {{ snackbarMessage }}
          </span>
        </v-col>
        <v-col cols="2">
          <v-btn :color="snackbarIconColor" fab outlined small @click.native="snackbar = false">
            <v-icon>
              {{ snackbarIcon }}
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-snackbar>

  </v-container>
</template>

<script>
// @ is an alias to /src
import moment from 'moment-timezone'
import Graph from '@/components/generals/Graph'
import Header from '@/components/generals/Header'
import MainButton from '@/components/generals/MainButton'
import CorrectiveForm from '@/components/corrective/CorrectiveForm'
import CorrectivePanels from '@/components/corrective/CorrectivePanels'
import DashboardCard from '@/components/generals/DashboardCard'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'Corrective',
  components: {
    CorrectivePanels,
    DashboardCard,
    Graph,
    Header,
    MainButton,
    CorrectiveForm
  },

  data: () => {
    return {
      dialog: false,
      snackbar: false,
      snackbarMessage: '',
      snackbarIcon: '',
      snackbarIconColor: ''
    }
  },

  computed: {

    ...mapState(['collections', 'updatingState']),

    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    orderedServices () {
      const services = []
      for (const clientName of this.formOptions.clientNames) {
        services.push(
          {
            clientName,
            services: this.collections.Active.filter(service => service.clientName === clientName)
          }
        )
      }
      return services
    },

    cards () {
      return [
        { data: this.collections.Active, title: 'Activos', icon: require('@/assets/svg/dashboard.svg') },
        { data: this.pendingXParts, title: 'Por repuestos', icon: require('@/assets/svg/gear.svg') }
      ]
    },

    pendingXParts () {
      return this.collections.Active.filter(service => service.status === 'Pendiente - Por repuestos')
    },

    corrective () {
      return [...this.collections.Active, ...this.collections.Closed]
    },

    thisMonth () {
      return moment(new Date()).format('MMMM')
    },

    servicesXStatus () {
      const type = 'polarArea'
      const options = {}
      let statusOptions = this.corrective.map(service => service.status)
      statusOptions = [...new Set(statusOptions)]
      const data = {
        labels: statusOptions,
        datasets: [{ label: 'Correctivo', data: [], backgroundColor: [] }]
      }
      for (const status of statusOptions) {
        data.datasets[0].backgroundColor.push(this.colorsXStatus[status])
        data.datasets[0].data.push(this.corrective.filter(service => service.status === status).length)
      }
      return { type, data, options }
    },

    colorsXStatus () {
      return {
        "Cerrado - Operativo": this.$vuetify.theme.currentTheme.success,
        "Cerrado - Reemplazado": this.$vuetify.theme.currentTheme.info,
        "Cerrado - Desincorporado": this.$vuetify.theme.currentTheme.secondary,
        "Pendiente - Por repuestos": this.$vuetify.theme.currentTheme.warning,
        "En programación": this.$vuetify.theme.currentTheme.error,
        "Atención programada": this.$vuetify.theme.currentTheme.accent
      }
    },

    servicesXClient () {
      const type = 'bar'
      const options = {}
      const data = {
        labels: this.formOptions.clients.map(client => client.clientName),
        datasets: [
          { label: 'Servicios por correctivo', borderRadius: 5, data: [], backgroundColor: this.$vuetify.theme.currentTheme.primary },
        ]
      }
      for (const client of this.formOptions.clients) {
        const clientServices = service => service.clientName === client.clientName
        data.datasets[0].data.push(this.corrective.filter(clientServices).length)
      }
      return { type, data, options }
    },

    servicesXTechnician () {
      const type = 'line'
      const options = {}
      const data = {
        labels: this.formOptions.technicians.map(tech => tech.text),
        datasets: [
          { label: 'Servicios por correctivo', data: [], borderColor: this.$vuetify.theme.currentTheme.primary },
        ]
      }
      for (const technician of this.formOptions.technicians) {
        const technicianServices = service => service.schedule.technician.fullName === technician.text
        data.datasets[0].data.push(this.corrective.filter(technicianServices).length)
      }
      return { type, data, options }
    }

  },

  methods: {

    ...mapMutations(['setRelatedDocuments']),

    ...mapActions(['findDocuments']),

    searchRelated (service, notifyAnyway) {
      const closedsFilter = { "$or": [{ serialCode: service.serialCode }, { "documentation.newSerial": service.serialCode }] }
      const findOn = [
        this.findDocuments({ collection: 'Closed', filter: closedsFilter }),
        this.findDocuments({ collection: 'Inventory', filter: { serialCode: service.serialCode } })
      ]
      Promise.all(findOn)
        .then((res) => {
          const data = [...res[0], ...res[1]]
          if (data.length) {
            this.setRelatedDocuments({ serialCode: service.serialCode, data })
            this.snackbarMessage = 'Encontramos servicios relacionados'
            this.snackbarIcon = 'mdi-check'
            this.snackbarIconColor = 'accent lighten-1'
            this.snackbar = true
          } else if (notifyAnyway) {
            this.snackbarMessage = 'La búsqueda no arrojó resultados'
            this.snackbarIcon = 'mdi-alert'
            this.snackbarIconColor = 'error lighten-1'
            this.snackbar = true
          }
        })
    }
  }
}
</script>
