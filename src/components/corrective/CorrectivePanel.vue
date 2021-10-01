<template>
  <v-container>
    <v-list dense>
      <v-list-item>

        <v-list-item-avatar v-show="!mobile">
          <v-icon :class="$vuetify.theme.dark ? 'dark' : 'gradients'" dark>
            mdi-label
          </v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="font-weight-bold">
            <v-badge
              class="subtitle-1 font-weight-bold"
              :value="service.itsSpecial"
              bordered
              color="accent"
              icon="mdi-medal-outline"
            >
              <span>{{ service.reportCode }}</span>
            </v-badge>
          </v-list-item-title>
          <v-list-item-subtitle class="subtitle-1 text-wrap">
            {{ service.officeName }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="subtitle-2 text-wrap">
            {{ service.productType }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="subtitle-2">
            {{ service.serialCode }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn @click="showInterface('details', service)" icon small>
            <v-icon color="primary">mdi-information-outline</v-icon>
          </v-btn>
          <v-menu>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on">
                <v-icon color="primary">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list color="primary" dark dense>
              <v-list-item-group>
                <v-list-item
                  v-for="option, index in actionsMenu" :key="index"
                  @click="showInterface(option.action, service)"
                  :disabled="option.requiredRole < $store.state.session.user.userRole"
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
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-dialog
      v-model="dialog"
      :fullscreen="detailsInterface"
      :width="mobile ? '90%' : '60%'"
      persistent
    >
      <v-card>
        <CorrectiveForm
          v-if="editInterface"
          :mobile="mobile"
          :collections="collections"
          :editing="selectedDocument"
          @hideInterface="hideInterface('edit')"
        />
        <CorrectiveInfo
          v-if="detailsInterface"
          :mobile="mobile"
          :selectedDocument="selectedDocument"
          @hideInterface="hideInterface('details')"
        />
        <MaintenanceInfo
          v-if="inventoryInterface"
          :selectedDocument="selectedDocument"
          @hideInterface="hideInterface('inventory')"
        />
        <CorrectiveSchedule
          v-if="scheduleInterface"
          :mobile="mobile"
          :selectedDocument="selectedDocument"
          @hideInterface="hideInterface('schedule')"
        />
        <CorrectiveUpdate
          v-if="updateInterface"
          :mobile="mobile"
          :selectedDocument="selectedDocument"
          @hideInterface="hideInterface('update')"
        />
        <CorrectiveDelete
          v-if="deleteInterface"
          :mobile="mobile"
          :selectedDocument="selectedDocument"
          @hideInterface="hideInterface('delete')"
        />
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>

import CorrectiveInfo from './CorrectiveInfo'
import CorrectiveSchedule from './CorrectiveSchedule'
import CorrectiveUpdate from './CorrectiveUpdate'
import CorrectiveForm from './CorrectiveForm'
import MaintenanceInfo from '@/components/preventive/MaintenanceInfo'
import CorrectiveDelete from './CorrectiveDelete'
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
  name: 'CorrectivePanel',
  props: ['service', 'mobile'],
  components: {
    CorrectiveInfo,
    CorrectiveSchedule,
    CorrectiveUpdate,
    CorrectiveForm,
    CorrectiveDelete,
    MaintenanceInfo
  },
  data: () => {
    return {
      inventoryInterface: false,
      scheduleInterface: false,
      detailsInterface: false,
      updateInterface: false,
      deleteInterface: false,
      editInterface: false,
      searching: false,
      dialog: false,

      actionsMenu: [
        { action: 'schedule', title: 'Asignar', icon: 'mdi-account-arrow-left', requiredRole: 2 },
        { action: 'update', title: 'Actualizar', icon: 'mdi-file-refresh-outline', requiredRole: 2 },
        { action: 'edit', title: 'Editar', icon: 'mdi-file-document-edit-outline', requiredRole: 2 },
        { action: 'delete', title: 'Eliminar', icon: 'mdi-delete', requiredRole: 1 }
      ],
      selectedDocument: {},
      selectedServiceRelated: []
    }
  },

  computed: {
    ...mapState(['collections'])
  },

  methods: {

    ...mapMutations(['setRelatedDocuments']),

    ...mapActions(['findDocuments']),

    hideInterface (menu) {
      this.dialog = false
      this.selectedDocument = {}
      this[`${menu}Interface`] = false
    },

    showInterface (menu, service) {
      this.dialog = true
      this.selectedDocument = Object.assign({}, service)
      this[`${menu}Interface`] = true
    }
  }
}
</script>
