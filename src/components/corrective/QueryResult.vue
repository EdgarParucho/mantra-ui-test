<template>
  <v-container>
    <v-row align="center">
      <v-col md="3">
        <v-text-field v-model="tableFilter" prepend-inner-icon="mdi-magnify" label="Filtrar" />
      </v-col>
      <v-col align="end">
        <export-excel v-if="xlsFormat" :data="xlsFormat">
          <v-btn
            dark small
            :disabled="!result.length"
            color="#2a5"
          >
            <v-icon>mdi-microsoft-excel</v-icon>
          </v-btn>
        </export-excel>
      </v-col>
    </v-row>
    <v-data-table
      class="elevation-2"
      dense
      :items-per-page="5"
      :headers="headers"
      :items="result"
      :search="tableFilter"
    >
      <template v-slot:item.serviceType="{ item }">
        {{ item | serviceType }}
      </template>
      <template v-slot:item.reportedAt="{ item }">
        {{ item.reportedAt | friendlyDate }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-btn :color="item.reportCode ? 'primary' : 'accent'" icon small v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list :color="item.reportCode ? 'primary' : 'accent'" dark dense>
            <v-list-item-group v-if="item.reportCode">
              <v-list-item
                v-for="option, index in reportsMenu" :key="index"
                @click="showDialog(option.action, item)"
                :disabled="item.status.includes('Cerrado') && option.action !== 'details'"
              >
                <v-list-item-icon>
                  <v-icon>{{ option.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ option.title }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
            <v-list-item-group v-else>
              <v-list-item
                v-for="option, index in maintenanceMenu" :key="index"
                @click="showDialog(option.action, item)"
                :disabled="
                  (item.status === 'Asignado' && option.title === 'Validar')
                  || (item.status === 'Culminado' && option.title === 'Re-asignar')
                  || (item.status === 'Culminado' && option.title === 'Actualizar')
                "
              >
                <v-list-item-icon>
                  <v-icon>{{ option.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ option.title }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
    <v-dialog
      v-model="dialog"
      :width="mobile ? '90%' : '60%'"
      persistent
      :fullscreen="detailsInterface"
    >
      <v-card>
        <CorrectiveInfo
          v-if="detailsInterface"
          :selectedDocument="selectedDocument"
          :mobile="mobile"
          @hideInterface="hideInterface('details')"
        />
        <CorrectiveSchedule
          v-if="scheduleInterface"
          :selectedDocument="selectedDocument"
          :mobile="mobile"
          @hideInterface="hideInterface('schedule')"
        />
        <CorrectiveUpdate
          v-if="updateInterface"
          :selectedDocument="selectedDocument"
          :mobile="mobile"
          @hideInterface="hideInterface('update')"
        />
        <MaintenanceForm
          v-if="scheduleMaintenanceInterface"
          :editing="selectedDocument"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="hideInterface('scheduleMaintenance')"
        />
        <MaintenanceUpdate
          v-if="updateMaintenanceInterface"
          :updating="selectedDocument"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="hideInterface('updateMaintenance')"
        />
        <MaintenanceValidation
          v-if="validateMaintenanceInterface"
          :updating="selectedDocument"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="hideInterface('validateMaintenance')"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

import CorrectiveSchedule from './CorrectiveSchedule'
import MaintenanceForm from '@/components/preventive/MaintenanceForm'
import MaintenanceUpdate from '@/components/preventive/MaintenanceUpdate'
import MaintenanceValidation from '@/components/preventive/MaintenanceValidation'
import CorrectiveUpdate from './CorrectiveUpdate'
import CorrectiveInfo from '@/components/corrective/CorrectiveInfo'
import moment from 'moment-timezone'
import { mapState } from 'vuex'

export default {
  props: ['result', 'xlsFormat', 'mobile'],
  name: 'QueryResult',
  components: { CorrectiveSchedule, CorrectiveUpdate, CorrectiveInfo, MaintenanceUpdate, MaintenanceForm, MaintenanceValidation },
  data: () => {
    return {
      scheduleInterface: false,
      scheduleMaintenanceInterface: false,
      updateMaintenanceInterface: false,
      validateMaintenanceInterface: false,
      updateInterface: false,
      detailsInterface: false,
      tableFilter: '',
      headers: [
        { text: 'Cliente', value: 'clientName' },
        { text: 'Oficina', value: 'officeName' },
        { text: 'Servicio', value: 'serviceType' },
        { text: 'Técnico', value: 'schedule.technician.fullName' },
        { text: 'Status', value: 'status' },
        { text: 'Acciones', value: 'actions' }
      ],
      reportsMenu: [
        { action: 'details', title: 'Detalles', icon: 'mdi-information-outline' },
        { action: 'schedule', title: 'Re-asignar', icon: 'mdi-account-arrow-left' },
        { action: 'update', title: 'Actualizar', icon: 'mdi-file-refresh-outline' }
      ],
      maintenanceMenu: [
        { action: 'scheduleMaintenance', title: 'Re-asignar', icon: 'mdi-account-arrow-left' },
        { action: 'updateMaintenance', title: 'Actualizar', icon: 'mdi-file-refresh-outline' },
        { action: 'validateMaintenance', title: 'Validar', icon: 'mdi-check' }
      ],
      dialog: false,
      selectedDocument: {}
    }
  },

  computed: { ...mapState(['collections']) },

  filters: {

    friendlyDate (dateSubmitted) {
      return moment(dateSubmitted).parseZone('America/Caracas').format('DD [de] MMMM, HH:mm')
    },

    serviceType (service) {
      let serviceType = 'Preventivo'
      switch (service.itsSpecial) {
        case true:
          serviceType = 'Especial'
          break
        case false:
          serviceType = service.reportCode
          break
        default:
          break
      }
      return serviceType
    }
  },

  methods: {

    hideInterface (menu) {
      this.selectedDocument = {}
      this.dialog = false
      this[`${menu}Interface`] = false
    },

    showDialog (menu, service) {
      this.selectedDocument = Object.assign({}, service)
      this.dialog = true
      this[`${menu}Interface`] = true
    }

  }
}
</script>
