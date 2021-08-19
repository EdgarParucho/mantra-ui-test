<template>
  <v-container>
    <v-tabs v-model="tab">
      <v-tabs-slider color="accent" />
      <v-tab>
        Asignados
      </v-tab>
      <v-tab>
        Por validar
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-data-table :headers="headers" dense :items="scheduledMaintenances">
          <template v-slot:item.actions="{ item }">
            <v-menu>
              <template v-slot:activator="{ on }">
                <v-btn color="primary" small v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list color="primary" dark dense>
                <v-list-item-group>
                  <v-list-item
                    v-for="option, index in serviceMenu" :key="index"
                    @click="showDialog(option.action, item)"
                    :disabled="$store.state.session.user.userRole > option.minRole"
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
      </v-tab-item>
      <v-tab-item>
        <v-data-table :headers="headers" dense :items="finishedMaintenances">
          <template v-slot:item.actions="{ item }">
            <v-btn @click="showDialog('validate', item)" color="primary" small>
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="dialog">
      <v-card>
        <MaintenanceForm
          v-if="editInterface"
          :editing="selectedService"
          :collections="collections"
          :mobile="mobile"
          :pendingMaintenance="pendingMaintenance"
          @hideInterface="hideInterface('edit')"
        />
        <MaintenanceUpdate
          v-if="updateInterface"
          :updating="selectedService"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="hideInterface('update')"
        />
        <MaintenanceValidation
          v-if="validateInterface"
          :updating="selectedService"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="hideInterface('validate')"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

import MaintenanceForm from '@/components/preventive/MaintenanceForm'
import MaintenanceUpdate from '@/components/preventive/MaintenanceUpdate'
import MaintenanceValidation from '@/components/preventive/MaintenanceValidation'
import { mapActions } from 'vuex'

export default {

  name: 'ScheduledMaintenances',
  components: { MaintenanceForm, MaintenanceUpdate, MaintenanceValidation },
  props: ['maintenances', 'mobile', 'collections', 'pendingMaintenance'],

  data: () => {
    return {
      tab: 0,
      editInterface: false,
      inventoryInterface: false,
      updateInterface: false,
      validateInterface: false,
      dialog: false,
      headers: [
        { text: 'Cliente', value: 'clientName' },
        { text: 'Oficina', value: 'officeName' },
        { text: 'Técnico', value: 'schedule.technician.fullName' },
        { text: 'Acciones', value: 'actions' }
      ],
      serviceMenu: [
        { action: 'edit', title: 'Reasignar', icon: 'mdi-account-arrow-left', minRole: 2 },
        { action: 'update', title: 'Actualizar', icon: 'mdi-file-refresh-outline', minRole: 2 },
        { action: 'delete', title: 'Eliminar', icon: 'mdi-delete', minRole: 1 }
      ],
      selectedService: {}
    }
  },

  computed: {

    scheduledMaintenances () {
      return this.maintenances.filter(service => !service.finished)
    },

    finishedMaintenances () {
      return this.maintenances.filter(service => service.status === 'Culminado' || service.status === 'Por culminar')
    }

  },

  methods: {

    ...mapActions(['deleteDocument']),

    hideInterface (menu) {
      this.dialog = false
      this[`${menu}Interface`] = false
    },

    confirmDelete (body) {
      confirm('Esta acción es irreversible, por favor confirme') && this.deleteDocument({ collection: 'Maintenance', body })
    },

    showDialog (menu, service) {
      if (menu === 'delete') return this.confirmDelete(service)

      this.selectedService = Object.assign({}, service)
      this[`${menu}Interface`] = true
      this.dialog = true
    }

  }
}
</script>
