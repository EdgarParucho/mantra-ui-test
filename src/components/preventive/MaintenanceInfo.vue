<template>
  <v-container>
    <Header
      closable="1"
      title="Documentación"
      :subtitle="`Serial: ${selectedDocument.serialCode}`"
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
          <v-card-title>Servicio Preventivo</v-card-title>
          <v-card-subtitle>
            <v-icon small>mdi-broom</v-icon>
            Mantenimiento
          </v-card-subtitle>
          <v-card-text>
            <div class="my-1 text-subtitle-2">
              <v-icon small>mdi-calendar-outline</v-icon>
              <span>{{ selectedDocument.schedule.scheduledDate | friendlyDate }}</span>
            </div>
            <div class="my-1 text-subtitle-2">
              <v-icon small>mdi-card-bulleted-outline</v-icon>
              Orden de servicio: {{ selectedDocument.serviceOrder }}
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

  </v-container>
</template>

<script>

import Vue from 'vue'
import moment from 'moment-timezone'
import Header from '@/components/generals/Header'

moment.locale('es')

export default Vue.extend({
  name: 'MaintenanceInfo',
  props: ['selectedDocument'],
  components: { Header },
  filters: {
    friendlyDate (date) {
      return moment(date).parseZone('America/Caracas').format('DD/MM/YYYY')
    }
  },
  computed: {
    mobile () {
      return (
        this.$vuetify.breakpoint.name === 'xs' ||
        this.$vuetify.breakpoint.name === 'sm'
      )
    },
    colorsXStatus () {
      return {
        "Operativo": this.$vuetify.theme.currentTheme.success,
        "Inoperativo": this.$vuetify.theme.currentTheme.error
      }
    }
  }
})
</script>
