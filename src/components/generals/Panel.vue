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
              <span>{{ service.reportCode ? service.reportCode : 'Mantenimiento' }}</span>
            </v-badge>
          </v-list-item-title>
          <v-list-item-subtitle class="subtitle-1 text-wrap">
            {{ service.officeName }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="subtitle-2 text-wrap" v-if="service.reportCode">
            {{ service.productType }}
          </v-list-item-subtitle>

          <v-list-item-subtitle class="subtitle-2" v-if="service.reportCode">
            {{ service.serialCode }}
            <v-tooltip v-if="service.relatedDocuments" right small color="accent">
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  icon
                  small
                  color="accent"
                  @click="showHistory(service)"
                >
                  <v-icon small color="accent">
                    mdi-check
                  </v-icon>
                </v-btn>
              </template>
              Ver historial
            </v-tooltip>

            <v-tooltip v-else right small color="accent">
              <template v-slot:activator="{ on }">
                <v-btn
                  v-if="service.serialCode !== 'SIN SERIAL'"
                  v-on="on"
                  icon
                  small
                  @click="$emit('searchRelated', service)"
                >
                  <v-icon small color="error">
                    mdi-magnify
                  </v-icon>
                </v-btn>
              </template>
              Buscar historial
            </v-tooltip>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn @click="showInterface(service)" :disabled="!service.reportCode" icon small>
            <v-icon color="primary">mdi-information-outline</v-icon>
          </v-btn>
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
        <CorrectiveInfo
          v-if="detailsInterface"
          :mobile="mobile"
          :selectedDocument="selectedDocument"
          @hideInterface="hideInterface"
        />
        <MaintenanceInfo
          v-if="inventoryInterface"
          :selectedDocument="selectedDocument"
          @hideInterface="inventoryInterface = false"
        />
      </v-card>
    </v-dialog>

    <v-bottom-sheet v-model="bottomSheet" scrollable>
      <v-card>
        <v-card-text>
          <ProductHistory
            v-if="bottomSheet"
            :mobile="mobile"
            :relatedServices="selectedServiceRelated"
            @showInterface="showInterface"
            @hideInterface="bottomSheet = false"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

  </v-container>
</template>

<script>

import CorrectiveInfo from '@/components/corrective/CorrectiveInfo'
import ProductHistory from '@/components/corrective/ProductHistory'
import MaintenanceInfo from '@/components/preventive/MaintenanceInfo'
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
  name: 'Panel',
  props: ['service', 'mobile'],
  components: {
    CorrectiveInfo,
    ProductHistory,
    MaintenanceInfo
  },
  data: () => {
    return {
      inventoryInterface: false,
      detailsInterface: false,
      bottomSheet: false,
      searching: false,
      dialog: false,
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

    hideInterface () {
      this.dialog = false
      this.selectedDocument = {}
      this.detailsInterface = false
    },

    showInterface (service) {
      this.dialog = true
      this.selectedDocument = Object.assign({}, service)
      this.detailsInterface = true
    },

    showHistory (service) {
      this.selectedServiceRelated = service.relatedDocuments
      this.bottomSheet = true
    }
  }
}
</script>
