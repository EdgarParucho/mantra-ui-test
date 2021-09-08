<template>
  <v-container>
    <Header title="Clientes" subtitle="Administre la información de los clientes" />
    <v-row>
      <v-col :cols="mobile ? 12 : 8">
        <v-skeleton-loader v-if="loading" type="image" width="100%" />
				<v-skeleton-loader v-if="loading" type="image" width="100%" />
        <ClientPanels
          v-else
          :mobile="mobile"
          :collections="collections"
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
          id="clientsGraph2"
          :loading="loading"
          :chartData="contractStatusXClient"
          title="Estatus de contratos"
          :subtitle="thisMonth"
        />
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
        <Graph
          v-else
          id="clientsGraph1"
          :loading="loading"
          :chartData="servicesXClient"
          title="Servicios por cliente"
          :subtitle="thisMonth"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <v-sheet class="pa-3" v-if="loading">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph
          v-else
          id="clientsGraph3"
          :loading="loading"
          :chartData="slaXClient"
          title="S. L. A. Por cliente"
          :subtitle="`${thisMonth} (Cerrados)`"
        />
      </v-col>
    </v-row>
    <MainButton
      @showForm="dialog = true"
      :disabled="$store.state.session.user.userRole > 1"
      :loading="loading"
    />
    <v-dialog v-model="dialog" :width="mobile ? '90%' : '60%'" persistent>
      <v-card>
        <ClientForm
          v-if="dialog"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="dialog = false"
        />
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import moment from 'moment-timezone'
import { mapState, mapGetters } from 'vuex'
import Graph from '@/components/generals/Graph'
import Header from '@/components/generals/Header'
import MainButton from '@/components/generals/MainButton'
import ClientForm from '@/components/clients/ClientForm'
import ClientPanels from '@/components/clients/ClientPanels'

export default {
  name: 'Clients',
  components: {
    Graph,
    Header,
    ClientPanels,
    ClientForm,
    MainButton
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
    corrective () {
      return [...this.collections.Active, ...this.collections.Closed]
    },
    thisMonth () {
      return moment(new Date()).format('MMMM')
    },
    servicesXClient () {
      const type = 'line'
      const options = {}
      const data = {
        labels: this.formOptions.clients.map(client => client.clientName),
        datasets: [
          { label: 'Correctivo', data: [], borderColor: this.$vuetify.theme.currentTheme.primary },
          { label: 'Preventivo', data: [], borderColor: this.$vuetify.theme.currentTheme.accent }
        ]
      }
      for (const client of this.formOptions.clients) {
        const clientServices = service => service.clientName === client.clientName
        data.datasets[0].data.push(this.corrective.filter(clientServices).length)
      }
      for (const client of this.formOptions.clients) {
        const clientServices = office => office.clientName === client.clientName
        data.datasets[1].data.push(this.finishedMaintenance.filter(clientServices).length)
      }
      return { type, data, options }
    },

    finishedMaintenance () {
      const thisMonthFirst = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const fromThisMonth = (service) => moment(service.schedule.scheduledDate).parseZone('America/Caracas').isSameOrAfter(thisMonthFirst)
      const main = this.collections.Maintenance.filter(service => fromThisMonth(service))
      return main
    },

    contractStatusXClient () {
      const type = 'polarArea'
      const options = {}
      const data = {
        labels: ['Activo', 'Inactivo'],
        datasets: [{ label: 'Contrato', data: [], backgroundColor: [] }]
      }
      for (const status of data.labels) {
        const activeContract = client => client.contracts.find(contract => contract.active)
        const inactiveContract = client => client.contracts.find(contract => !contract.active)
        data.datasets[0].data.push(this.collections.Client.filter(status === 'Activo' ? activeContract : inactiveContract).length)
        data.datasets[0].backgroundColor.push(this.colorsXStatus[status])
      }
      return { type, data, options }
    },

    slaXClient () {
      const type = 'bar'
      const options = {}
      const data = {
        labels: this.formOptions.clients.map(client => client.clientName),
        datasets: [
          { label: 'Dentro del acuerdo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.success },
          { label: 'Fuera del acuerdo', data: [], backgroundColor: this.$vuetify.theme.currentTheme.error }
        ]
      }
      for (const client of this.formOptions.clients) {
        const inTime = service => !service.itsSpecial && !service.expired && service.clientName === client.clientName
        data.datasets[0].data.push(this.collections.Closed.filter(inTime).length)
      }
      for (const client of this.formOptions.clients) {
        const expired = service => !service.itsSpecial && service.expired && service.clientName === client.clientName
        data.datasets[1].data.push(this.collections.Closed.filter(expired).length)
      }
      return { type, data, options }
    },

    colorsXStatus () {
      return {
        "Activo": this.$vuetify.theme.currentTheme.success,
        "Inactivo": this.$vuetify.theme.currentTheme.error
      }
    }
  }

}
</script>
