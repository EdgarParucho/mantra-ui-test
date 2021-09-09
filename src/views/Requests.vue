<template>
  <v-container>
    <Header title="Solicitudes" subtitle="Gestione la reposición del stock de repuestos" />
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
          id="requestsGraph1"
          :loading="loading"
          :chartData="requestsXTechnician"
          title="Solicitudes por técnicos"
          subtitle="Activas"
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
          id="requestsGraph2"
          :loading="loading"
          :chartData="requestsXProduct"
          title="Solicitudes por productos"
          subtitle="Activas"
        />
      </v-col>
    </v-row>
    <v-sheet>
      <v-row align="center">
        <v-col class="ml-2" md="3">
          <v-text-field v-model="tableFilter" prepend-inner-icon="mdi-magnify" label="Filtrar" />
        </v-col>
      </v-row>
      <v-data-table
        class="elevation-2"
        :headers="headers"
        :items="requestPerService"
        :search="tableFilter"
      >
        <template v-slot:top>
          <v-dialog v-model="dialog" fullscreen>
            <v-card>
              <RequestDetails
                v-if="dialog"
                :originalItem="originalItem"
                :selectedDocument="selectedDocument"
                @hideInterface="dialog = false"
              />
            </v-card>
          </v-dialog>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn @click="editItem(item)" color="primary" small>
            <v-icon>
              mdi-magnify
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-sheet>
  </v-container>
</template>

<script>

import Graph from '@/components/generals/Graph'
import Header from '@/components/generals/Header'
import RequestDetails from '@/components/storehouse/RequestDetails'
import moment from 'moment-timezone'
import { mapState, mapGetters } from 'vuex'

export default {

  name: 'Requests',
  components: { Graph, Header, RequestDetails },

  data: () => {
    return {
      tableFilter: '',
      headers: [
        { text: 'F. Solicitud', value: 'requestDate' },
        { text: 'Reporte', value: 'reportCode' },
        { text: 'Técnico', value: 'technician' },
        { text: 'Cliente', value: 'clientName' },
        { text: 'Oficina', value: 'officeName' },
        { text: 'Acciones', value: 'actions' }
      ],
      dialog: false,
      selectedDocument: {},
      originalItem: {},
      timeout: 4000
    }
  },

  computed: {

    ...mapState(['collections', 'loading']),
    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },
    
    requestPerService () {
      let reports = this.collections.Request.map(f => f.reportCode)
      reports = [...new Set(reports)]
      const requestsByReports = []
      for (const n in reports) {
        const requests =  this.collections.Request.filter(b => b.reportCode === reports[n])
        requestsByReports.push({
          reportCode: requests[0].reportCode,
          technician: requests[0].technician,
          clientName: requests[0].clientName,
          officeName: requests[0].officeName,
          productName: requests[0].productName,
          courierCompany: '',
          courierOffice: '',
          dispatchDate: moment(new Date()).format('YYYY-MM-DD'),
          requestDate: moment(requests[0].requestDate).format('DD [de] MMMM'),
          requestedBy: requests[0].requestedBy,
          // destination: `${requests[0].courierCompany} ${requests[0].courierOffice}`,
          requests
        })
      }
      return requestsByReports
    },

    requestsXTechnician () {
      const type = 'line'
      const options = {}
      const data = {
        labels: this.formOptions.technicians.map(tech => tech.text),
        datasets: [
          { label: 'Solicitudes por técnico', data: [], borderColor: this.$vuetify.theme.currentTheme.primary },
        ]
      }
      for (const technician of this.formOptions.technicians) {
        const technicianRequests = request => request.technician.fullName === technician.text
        data.datasets[0].data.push(this.collections.Request.filter(technicianRequests).length)
      }
      return { type, data, options }
    },

    requestsXProduct () {
      let labels = this.collections.Request.map(request => request.productType)
      labels = [...new Set(labels)]
      const type = 'bar'
      const options = { indexAxis: 'y' }
      const data = {
        labels,
        datasets: [
          { label: 'Solicitudes por producto', data: [], backgroundColor: this.$vuetify.theme.currentTheme.primary },
        ]
      }
      for (const product of labels) {
        const productRequests = request => request.productType === product
        data.datasets[0].data.push(this.collections.Request.filter(productRequests).length)
      }
      return { type, data, options }
    }
  },

  methods: {

    editItem (item) {
      this.selectedDocument = Object.assign({}, item)
      this.originalItem = JSON.parse(JSON.stringify(item))
      this.dialog = true
    }

  }
}
</script>
