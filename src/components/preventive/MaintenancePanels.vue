<template>
  <div>
    <v-data-table :items="formOptions.clients" :headers="table1Headers">
      <template v-slot:item.offices="{ item }">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon color="primary">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list color="primary" dark dense>
            <v-list-item-group>
              <v-list-item
                v-for="option, index in serviceMenu" :key="index"
                @click="showBottomSheet(item.clientName, option.action, option.title)"
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

    <v-bottom-sheet v-model="bottomSheet" scrollable>
      <v-card>

        <Header
          closable="1"
          :title="bottomSheetTitle"
          :subtitle="bottomSheetSubtitle"
          @hideInterface="bottomSheet = false"
        />

        <v-card-text>
          <v-row>
            <v-col :cols="mobile ? 6 : 2">
              <v-text-field v-model="tableFilter" prepend-inner-icon="mdi-magnify" />
            </v-col>
          </v-row>
          <v-data-table :items="maintenanceData" :search="tableFilter" :headers="table2Headers">
            <template v-slot:item.lastMaintenance="{ item }">
              <span v-if="item.lastMaintenance">{{ item.lastMaintenance | friendlyDate }}</span>
              <span v-else>No registrado</span>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn @click="showInventory(item)" small icon color="primary">
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
              <v-btn
                v-if="bottomSheetSubtitle === 'Por atender'"
                small
                icon
                color="primary"
                @click="assignMaintenance(item)"
              >
                <v-icon>mdi-account-arrow-left</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>

      </v-card>
    </v-bottom-sheet>

    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="dialog">
      <v-card>
        <OfficeInventory
          v-if="inventoryInterface"
          :mobile="mobile"
          :inventory="selectedInventory"
          @hideInterface="hideInterface('inventory')"
        />
        <MaintenanceForm
          v-if="assignInterface"
          :startTemplate="startTemplate"
          :collections="collections"
          :mobile="mobile"
          :pendingMaintenance="formOptions.pendingMaintenance"
          @hideInterface="hideInterface('assign')"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import moment from 'moment-timezone'
import OfficeInventory from '@/components/preventive/OfficeInventory'
import MaintenanceForm from '@/components/preventive/MaintenanceForm'
import Header from '@/components/generals/Header'
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'PreventivePanels',
  components: { Header, OfficeInventory, MaintenanceForm },
  props: ['collections', 'mobile', 'finishedMaintenance'],
  data: () => {
    return {
      inventoryInterface: false,
      assignInterface: false,
      bottomSheet: false,
      bottomSheetTitle: '',
      bottomSheetSubtitle: '',
      tableFilter: '',
      serviceMenu: [
        { action: 'finished', title: 'Atendidas', icon: 'mdi-check' },
        { action: 'pending', title: 'Por atender', icon: 'mdi-exclamation' },
      ],
      table1Headers: [
        { text: 'Cliente', value: 'clientName' },
        { text: 'Oficinas', value: 'offices' }
      ],
      table2Headers: [
        { text: 'Oficina', value: 'officeName' },
        { text: 'Último mantenimiento', value: 'lastMaintenance'},
        { text: 'Acciones', value: 'actions'}
      ],
      startTemplate: {},
      maintenanceData: [],
      dialog: false,
      selectedInventory: []
    }
  },
  filters: {
    friendlyDate (dateSubmitted) {
      return moment(dateSubmitted).parseZone('America/Caracas').format('DD [de] MMMM [de] YYYY')
    }
  },
  computed: {
    ...mapState(['selectedDocument']),
    ...mapGetters(['formOptions']),
  },
  methods: {
    ...mapMutations(['showSnackbar']),

    activeContract (client) {
      return client.contracts.find(contract => contract.active)
    },

    showBottomSheet (client, status, subtitle) {
      this.maintenanceData = status === 'finished'
        ? this.finishedMaintenance.filter(office => office.clientName === client)
        : this.formOptions.pendingMaintenance.filter(office => office.clientName === client)
      this.bottomSheetTitle = client
      this.bottomSheetSubtitle = subtitle
      this.bottomSheet = true
    },

    showInventory (officeInfo) {
      this.selectedInventory = this.collections.Office.find(office => office.officeName === officeInfo.officeName).inventory
      if (!this.selectedInventory.length) return this.showSnackbar({ message: 'El inventario no se ha registrado aún' })
      else this.dialog = true, this.inventoryInterface = true
    },

    assignMaintenance (office) {
      const registeredAlready = this.collections.Maintenance.find(service => service.officeName === office.officeName)
      if (registeredAlready) return this.showSnackbar({ message: 'Registrado actualmente' })
      this.assignInterface = true
      this.startTemplate = {
        clientName: office.clientName,
        officeName: office.officeName
      }
      this.dialog = true
    },

    hideInterface (menu) {
      this[`${menu}Interface`] = false
      this.dialog = false
    }

  }
}
</script>
