<template>
  <v-container>
    <Header
      closable="1"
      title="Documentación"
      subtitle="Detalles del servicio"
      @hideInterface="$emit('hideInterface')"
    />
    <v-card v-if="serviceCopy.reportCode" class="mx-auto" elevation="2">
      <v-row align="center" justify="center">
        <v-col align="center">
          <v-avatar class="mb-2">
            <v-img src="@/assets/logo.svg"></v-img>
          </v-avatar>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-row>
        <v-col :cols="mobile ? 12 : 6">
          <v-card-title>Servicio {{ serviceCopy.reportCode }}</v-card-title>
          <v-card-subtitle>
            <v-icon small>mdi-tools</v-icon>
            {{ serviceCopy.itsSpecial ? 'Especial' : 'Correctivo' }}
          </v-card-subtitle>
          <v-card-text>
            <div class="my-1 text-subtitle-2">
              <v-icon small>mdi-calendar-outline</v-icon>
              Reporte: {{ serviceCopy.reportedAt | friendlyDate }}
            </div>
            <div class="my-1 text-subtitle-2">
              <v-icon small>mdi-timer-outline</v-icon>
              Expira:
              <span v-if="serviceCopy.itsSpecial">S. L. A. No aplicado</span>
              <span v-else>{{ serviceCopy.expireDate | friendlyDate }}</span>
            </div>
            <div class="my-1 text-subtitle-2">
              <v-icon small>mdi-cog</v-icon>
              Piezas solicitadas: {{ serviceCopy.pieces.length }}
            </div>
            <v-chip
              :color="colorsXStatus[serviceCopy.status]"
              label
              dark
              small
            >
              {{ serviceCopy.status }}
            </v-chip>
          </v-card-text>
        </v-col>

        <v-col :cols="mobile ? 12 : 6" align="end">

          <v-card-title class="justify-end">
            {{ serviceCopy.clientName }}
          </v-card-title>

          <v-card-subtitle>
            {{ serviceCopy.officeName }}
            <v-icon small>mdi-bank</v-icon>
          </v-card-subtitle>

          <v-card-text>
            <div class="my-1 text-subtitle-2">
              {{ serviceCopy.productName }}
              <v-icon small>mdi-printer</v-icon>
            </div>
            <div class="my-1 text-subtitle-2">
              {{ serviceCopy.serialCode }}
              <v-icon small>mdi-barcode</v-icon>
            </div>

            <div class="my-1 text-subtitle-2">
              {{ serviceCopy.description }}
              <v-icon small>mdi-comment-text-outline</v-icon>
            </div>

            <v-chip
              color="secondary"
              label
              small
            >
              {{ serviceCopy.schedule.technician.fullName }}
            </v-chip>

          </v-card-text>
        </v-col>
      </v-row>
    </v-card>

    <MaintenanceInfo v-else :selectedDocument="serviceCopy" :hideHeader="true" />

    <v-row class="my-10">
      <v-col align="center">
        <v-btn @click="searchRelated(selectedDocument)" small outlined
          :loading="searching">
          <v-icon left>mdi-folder-search</v-icon>
          Otros servicios del producto
        </v-btn>
      </v-col>
      <v-col align="center">
        <v-btn v-if="!originalIsSelected" @click="selectOriginal" small outlined color="error">
          <v-icon left>mdi-undo</v-icon>
          Volver al servicio original
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="serviceCopy.reportCode">
      <v-col>
        <v-alert type="info" icon="mdi-information-outline" rounded="pill" text>
          Bitácora del servicio
        </v-alert>
        <v-timeline
          align-top
          reverse
          :dense="mobile"
        >
          <v-timeline-item
            v-for="documentation, index in serviceCopy.documentation"
            :key="index"
            fill-dot
            :color="colorsXStatus[documentation.status]"
            small
          >
            <v-card class="elevation-2 my-1" outlined color="#eee">
              <v-card-title class="text-h6 text-no-wrap">
                {{ documentation.type }}
              </v-card-title>
              <v-card-text class="white text--primary">
                <p>
                {{ documentation.observations }}
                </p>
              </v-card-text>
              <v-container v-if="documentation.serviceOrder">
                <section v-if="documentation.serviceOrder.number">
                  <small class="caption text--secondary">
                    <v-chip v-if="documentation.visit" color="info" label x-small>
                      Visita técnica
                    </v-chip>
                    <br>
                    <template v-if="documentation.technician">
                      <v-chip
                        v-if="documentation.technician.fullName !== 'No asignado'"
                        color="info"
                        label
                        x-small
                      >
                        {{ documentation.technician.fullName }}
                      </v-chip>
                    </template>
                    <br>
                    <span v-if="documentation.visit">
                      {{ documentation.date | friendlyDate }}
                    </span>
                    <v-row align="center">
                      <v-col>
                        <v-text-field
                          v-model="documentation.serviceOrder.number"
                          prepend-inner-icon="mdi-card-bulleted"
                          maxLength="6" :rules="rules.serviceOrderRules" persistent-hint
                          :hint="documentation.serviceOrder.validated
                            ? 'Validado'
                            : 'No validado'"
                        />
                      </v-col>
                      <v-col>
                        <v-tooltip :color="documentation.serviceOrder.validated ? 'warning' : 'primary'" top>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              :outlined="!documentation.serviceOrder.validated"
                              :color="documentation.serviceOrder.validated ? 'primary' : 'warning'"
                              :loading="validating"
                              small v-on="on"
                              :disabled="$store.state.session.user.userRole > 2"
                              @click="validateOrder(serviceCopy, index)"
                            >
                              <v-icon>
                                {{ documentation.serviceOrder.validated ? 'mdi-check' : 'mdi-exclamation' }}
                              </v-icon>
                            </v-btn>
                          </template>
                          {{ documentation.serviceOrder.validated ? 'Invalidar' : 'Validar' }}
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </small>
                </section>
              </v-container>
            </v-card>
            <small class="caption ml-4 text--secondary lighten-2 lighten-1">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-avatar
                    v-on="on"
                    color="secondary"
                    size="20"
                  >
                  <span class="white--text">{{ documentation.author.fullName | initials}}</span>
                </v-avatar>
                </template>
                {{ documentation.author.fullName }}
                </v-tooltip>
                | {{ documentation.updatedAt | friendlyDate }}
                <v-chip
                  class="ml-1"
                  v-if="documentation.status"
                  dark
                  :color="colorsXStatus[documentation.status]"
                  label
                  x-small
                >
                  {{ documentation.status }}
                </v-chip>
              </small>
          </v-timeline-item>
        </v-timeline>
      </v-col>
    </v-row>
    <v-bottom-sheet v-model="drawer">
      <v-card>
        <ProductHistory
          v-if="drawer"
          :mobile="mobile"
          :relatedServices="relatedDocuments"
          @showInterface="selectCopy"
          @hideInterface="drawer = false"
        />
      </v-card>
    </v-bottom-sheet>
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

import Vue from 'vue'
import moment from 'moment-timezone'
import { mapActions, mapMutations } from 'vuex'
import { rules } from '@/helpers/form.js'
import MaintenanceInfo from '../preventive/MaintenanceInfo.vue'
import ProductHistory from '@/components/corrective/ProductHistory.vue'
import Header from '@/components/generals/Header'

moment.locale('es')

export default Vue.extend({

  name: 'CorrectiveInfo',
  components: { MaintenanceInfo, Header, ProductHistory },
  props: ['selectedDocument', 'mobile' ],
  
  data: () => {
    return {
      drawer: false,
      rules,
      validating: false,
      selection: 1,
      snackbar: false,
      snackbarMessage: '',
      snackbarIcon: '',
      snackbarIconColor: '',
      searching: false,
      serviceCopy: {},
      relatedDocuments: [],
      originalIsSelected: true
    }
  },

  created () {
    this.serviceCopy = this.selectedDocument
    if (this.selectedDocument.relatedDocuments) {
      if (this.selectedDocument.relatedDocuments.length) this.relatedDocuments = this.selectedDocument.relatedDocuments
    }
  },

  filters: {

    friendlyDate (date) {
      return moment(date).parseZone('America/Caracas').format('DD/MM/YYYY HH:mm')
    },

    relativeDate (date) {
      return moment(date).fromNow()
    },

    initials (name) {
      const fullName = name.split(' ')
      return fullName[0][0] + fullName[1][0]
    }

  },

  computed: {
    
    assignedTo () {
      const assignements = this.serviceCopy.documentation.filter(record => record.technician)
      return assignements.length ? assignements.pop().technician.fullName : 'No asignado'
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
    }
  },

  methods: {

    ...mapActions(['updateDocument', 'findDocuments']),
    ...mapMutations(['setRelatedDocuments']),

    validateOrder (body, i) {
      this.validating = true
      body.documentation[i].serviceOrder.validated = !body.documentation[i].serviceOrder.validated
      this.updateDocument({
        collection: body.status.includes('Cerrado') ? 'Closed' : 'Active',
        body
      })
        .finally(() => this.validating = false)
    },

    searchRelated (service) {
      if (this.relatedDocuments.length) return this.drawer = true
      this.searching = true
      const closedsFilter = { 
        "$or": [
          { serialCode: service.serialCode }, { "documentation.newSerial": service.serialCode }
        ],
        _id: { "$ne": service._id }
      }
      const searchInCollections = [
        this.findDocuments({ collection: 'Closed', filter: closedsFilter }),
        this.findDocuments({ collection: 'Inventory', filter: { serialCode: service.serialCode } })
      ]
      Promise.all(searchInCollections)
        .then((res) => {
          this.searching = false
          const data = [...res[0], ...res[1]]
          if (data.length) {
            this.setRelatedDocuments({ serialCode: service.serialCode, data })
            this.relatedDocuments = data
            this.drawer = true
            this.alertResult(true)
          } else {
            this.alertResult(false)
          }
        })
        .catch(() => this.searching = false)
    },

    alertResult (results) {
      if (results) {
        this.snackbarMessage = 'Encontramos servicios relacionados'
        this.snackbarIcon = 'mdi-check'
        this.snackbarIconColor = 'accent lighten-1'
        this.snackbar = true
      } else {
        this.snackbarMessage = 'La búsqueda no arrojó resultados'
        this.snackbarIcon = 'mdi-alert'
        this.snackbarIconColor = 'error lighten-1'
        this.snackbar = true
      }
    },

    selectCopy (interd, service) {
      this.serviceCopy = service
      this.originalIsSelected = false
      this.drawer = false
    },

    selectOriginal () {
      this.serviceCopy = this.selectedDocument
      this.originalIsSelected = true
    }
  }
})
</script>
