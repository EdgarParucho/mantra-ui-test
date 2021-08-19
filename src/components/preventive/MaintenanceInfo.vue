<template>
  <v-container>
    <Header
      closable="1"
      title="Documentación"
      :subtitle="`Serial: ${selectedDocument.serialCode}`"
      @hideInterface="$emit('hideInterface')"
    />

    <v-row class="mt-5">
      <v-col :cols="mobile ? 12 : 6">
        <v-row>
          <v-col>
            <v-card class="my-2 px-2">
              <v-row align="center">
                <v-col cols="3">
                  <v-img src="@/assets/svg/protection.svg" width="70"></v-img>
                </v-col>
                <v-col cols="9">
                  <v-card-title>
                    Mantenimiento
                  </v-card-title>
                  <v-card-subtitle>{{ selectedDocument.serviceDate | dateNoTime }}</v-card-subtitle>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card class="my-2 px-2">
              <v-row align="center">
                <v-col cols="3">
                  <v-img src="@/assets/svg/bank.svg" width="70"></v-img>
                </v-col>
                <v-col cols="9">
                  <v-card-title>{{ selectedDocument.clientName }}</v-card-title>
                  <v-card-subtitle>{{ selectedDocument.officeName }}</v-card-subtitle>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card class="my-2 px-2">
              <v-row align="center">
                <v-col cols="3">
                  <v-img src="@/assets/svg/barcode-identification.svg" width="70"></v-img>
                </v-col>
                <v-col cols="9">
                  <v-card-title>
                    {{ selectedDocument.serialCode }}
                  </v-card-title>
                  <v-card-subtitle>{{ selectedDocument.productName }}</v-card-subtitle>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col>
        <v-row>
          <v-col>
            <v-card class="my-2 px-2">
              <v-row align="center">
                <v-col cols="3">
                  <v-img src="@/assets/svg/status.svg" width="70"></v-img>
                </v-col>
                <v-col cols="9">
                  <v-card-title>{{ selectedDocument.status }}</v-card-title>
                  <v-card-subtitle>Status del producto</v-card-subtitle>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card class="my-2 px-2">
              <v-row align="center">
                <v-col cols="3">
                  <v-img src="@/assets/svg/technician.svg" width="70"></v-img>
                </v-col>
                <v-col cols="9">
                  <v-card-title class="text-no-wrap">{{ selectedDocument.technician.fullName }}</v-card-title>
                  <v-card-subtitle>Personal asignado</v-card-subtitle>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card class="my-2 px-2">
              <v-row align="center">
                <v-col cols="3">
                  <v-img src="@/assets/svg/failure.svg" width="70"></v-img>
                </v-col>
                <v-col cols="9">
                  <v-card-title>Orden {{ selectedDocument.serviceOrder }}</v-card-title>
                  <v-card-subtitle>{{ selectedDocument.observations }}</v-card-subtitle>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
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
    dateNoTime (date) {
      return moment(date).parseZone('America/Caracas').format('LL')
    }
  },

  computed: {

    mobile () {
      return (
        this.$vuetify.breakpoint.name === 'xs' ||
        this.$vuetify.breakpoint.name === 'sm'
      )
    }
  }
})
</script>
