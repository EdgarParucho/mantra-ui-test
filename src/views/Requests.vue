<template>
  <v-container>

    <Header title="Solicitudes" subtitle="Gestione la reposición del stock de repuestos" />

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

import Header from '@/components/generals/Header'
import RequestDetails from '@/components/storehouse/RequestDetails'
import moment from 'moment-timezone'
import { mapState } from 'vuex'

export default {

  name: 'Requests',
  components: { Header, RequestDetails },

  data: () => {
    return {
      tableFilter: '',
      headers: [
        { text: 'F. Solicitud', value: 'requestDate' },
        { text: 'Reporte', value: 'reportCode' },
        { text: 'Técnico', value: 'technician.fullName' },
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

    ...mapState(['collections']),

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
