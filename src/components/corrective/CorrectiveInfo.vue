<template>
  <v-container>
    <Header
      closable="1"
      title="Documentación"
      subtitle="Resumen e historial del servicio"
      @hideInterface="$emit('hideInterface')"
    />
    <v-card class="mx-auto" elevation="2">
      <v-row align="center" justify="center">
        <v-col align="center">
          <v-avatar class="mb-2" color="secondary">
            <v-avatar size="90%" color="white">
              <v-img src="@/assets/logo.png"></v-img>
            </v-avatar>
          </v-avatar>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-row>
        <v-col :cols="mobile ? 12 : 6">
          <v-card-title>Servicio {{ selectedDocument.reportCode }}</v-card-title>
          <v-card-subtitle>
            <v-icon small>mdi-tools</v-icon>
            {{ selectedDocument.itsSpecial ? 'Especial' : 'Correctivo' }}
          </v-card-subtitle>
          <v-card-text>
            <div class="my-1 text-subtitle-2">
              <v-icon small>mdi-calendar-outline</v-icon>
              Reporte: {{ selectedDocument.reportedAt | friendlyDate }}
            </div>
            <div class="my-1 text-subtitle-2">
              <v-icon small>mdi-timer-outline</v-icon>
              Expira:
              <span v-if="selectedDocument.itsSpecial">S. L. A. No aplicado</span>
              <span v-else>{{ selectedDocument.expireDate | friendlyDate }}</span>
            </div>
            <div class="my-1 text-subtitle-2">
              <v-icon small>mdi-cog</v-icon>
              Piezas solicitadas: {{ selectedDocument.pieces.length }}
            </div>
            <v-chip
              :color="colorsXStatus[selectedDocument.status]"
              label
              dark
              small
            >
              {{ selectedDocument.status }}
            </v-chip>
          </v-card-text>
        </v-col>

        <v-col :cols="mobile ? 12 : 6" align="end">

          <v-card-title class="justify-end">
            {{ selectedDocument.clientName }}
          </v-card-title>

          <v-card-subtitle>
            {{ selectedDocument.officeName }}
            <v-icon small>mdi-bank</v-icon>
          </v-card-subtitle>

          <v-card-text>
            <div class="my-1 text-subtitle-2">
              {{ selectedDocument.productName }}
              <v-icon small>mdi-printer</v-icon>
            </div>
            <div class="my-1 text-subtitle-2">
              {{ selectedDocument.serialCode }}
              <v-icon small>mdi-barcode</v-icon>
            </div>

            <div class="my-1 text-subtitle-2">
              {{ selectedDocument.description }}
              <v-icon small>mdi-comment-text-outline</v-icon>
            </div>

            <v-chip
              color="secondary"
              label
              small
            >
              {{ selectedDocument.schedule.technician.fullName }}
            </v-chip>

          </v-card-text>
        </v-col>
      </v-row>
    </v-card>

    <v-row class="mt-10">
      <v-col>
        <v-alert type="info" icon="mdi-information-outline" rounded="pill" text>
          Acciones registradas
        </v-alert>
        <v-timeline
          align-top
          reverse
          :dense="mobile"
        >
          <v-timeline-item
            v-for="documentation, index in selectedDocument.documentation"
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
                      <v-col :cols="mobile ? 7 : 2">
                        <v-text-field
                          v-model="documentation.serviceOrder.number"
                          prepend-inner-icon="mdi-card-bulleted"
                          maxLength="6" :rules="rules.serviceOrderRules" persistent-hint
                          :hint="documentation.serviceOrder.validated
                            ? 'Validado'
                            : 'No validado'"
                        />
                      </v-col>
                      <v-col cols="2">
                        <v-tooltip :color="documentation.serviceOrder.validated ? 'warning' : 'primary'" top>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              :outlined="!documentation.serviceOrder.validated"
                              :color="documentation.serviceOrder.validated ? 'primary' : 'warning'"
                              :loading="loader"
                              small v-on="on"
                              :disabled="$store.state.session.user.userRole > 2"
                              @click="validateOrder(selectedDocument, index)"
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
  </v-container>
</template>

<script>

import Vue from 'vue'
import moment from 'moment-timezone'
import { mapActions } from 'vuex'
import Header from '@/components/generals/Header'
import { rules } from '@/helpers/form.js'

moment.locale('es')

export default Vue.extend({

  name: 'CorrectiveInfo',
  components: { Header },
  props: ['selectedDocument', 'mobile'],
  
  data: () => {
    return {
      rules,
      loader: false,
      selection: 1
    }
  },

  filters: {

    friendlyDate (date) {
      return moment(date).parseZone('America/Caracas').format('DD/MM/YYYY HH:mm')
    },

    initials (name) {
      const fullName = name.split(' ')
      return fullName[0][0] + fullName[1][0]
    }

  },

  computed: {
    
    assignedTo () {
      const assignements = this.selectedDocument.documentation.filter(record => record.technician)
      console.log(assignements)
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

    ...mapActions(['updateDocument']),

    validateOrder (body, i) {
      this.loader = true
      body.documentation[i].serviceOrder.validated = !body.documentation[i].serviceOrder.validated
      this.updateDocument({
        collection: body.status.includes('Cerrado') ? 'Closed' : 'Active',
        body
      })
        .finally(() => this.loader = false)
    }
  }
})
</script>
