<template>
  <v-container>
    <Header
      closable="1"
      title="Historial"
      :subtitle="`Serial: ${relatedServices[0].serialCode}`"
      @hideInterface="$emit('hideInterface')"
    />
    <v-timeline :dense="mobile">
      <v-timeline-item
        v-for="(service, i) in orderedServices"
        :key="i"
        :color="service.reportCode ? 'primary' : 'secondary'"
        small
      >
        <template v-slot:opposite>
          <span class="headline font-weight-bold">
            {{ service.officeName }}
          </span>
        </template>
        <div class="py-4">
          <v-chip
            class="mb-4"
            :color="service.reportCode ? 'primary' : 'secondary'"
            label
          >
            {{ service.reportCode ? service.reportCode : 'Mantenimiento' }}
          </v-chip>
          <v-tooltip top small color="accent">
            <template v-slot:activator="{ on }">
              <v-btn
                class="ml-1"
                @click="$emit('showInterface', `${service.reportCode ? 'details' : 'inventory' }`, service)"
                icon
                small
                v-on="on"
              >
                <v-icon small color="accent">
                  mdi-eye-settings-outline
                </v-icon>
              </v-btn>
            </template>
            <span>Ver detalle</span>
          </v-tooltip>
          <br>
          <p v-if="mobile">
            {{ service.clientName }}
            {{ service.officeName }}
          </p>
          <span class="font-weight-bold">
            {{ service.status }}
          </span>
          <v-divider />
          <div>
            <small>
              {{ service.serviceDate ? service.serviceDate : service.schedule.scheduledDate | dateNoTime }}
            </small>
            <v-chip class="ma-1" small label>
              {{ service.reportCode ? service.schedule.technician.fullName : service.technician.fullName }}
            </v-chip>
          </div>
        </div>
      </v-timeline-item>
    </v-timeline>
  </v-container>
</template>

<script>

import Header from '@/components/generals/Header'
import moment from 'moment-timezone'

moment.locale('es')

export default {
  name: 'ProductHistory',
  components: { Header },
  props: ['relatedServices', 'mobile'],

  data: () => {
    return { orderedServices: [] }
  },

  created () {
    this.sortServices()
  },

  methods : {

    sortServices () {
      function chronologic (a, b) {
        const dateA = a.serviceDate ? a.serviceDate : a.schedule.scheduledDate
        const dateB = b.serviceDate ? b.serviceDate : b.schedule.scheduledDate
        if (dateA > dateB) {
          return 1
        } else {
          return -1
        }
      }
      this.orderedServices = this.relatedServices.sort(chronologic)
    }
  },

  filters: {

    dateNoTime (date) {
      return moment(date).parseZone('America/Caracas').format('LL')
    }

  }
}
</script>
