<template>
  <v-container>

    <Header title="Mantenimiento preventivo" subtitle="Servicios programados e inventario de clientes" />

    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-skeleton-loader v-if="loading" type="image" width="100%" />
				<v-skeleton-loader v-if="loading" type="image" width="100%" />
        <MaintenancePanels
          v-else
          :collections="collections"
          :mobile="mobile"
          :finishedMaintenance="finishedMaintenance"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <MaintenanceTable
          :mobile="mobile"
          :collections="collections"
          :maintenances="collections.Maintenance"
        />
      </v-col>
    </v-row>

    <MainButton @showForm="dialog = true" :loading="loading" />

    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="dialog">
      <v-card>
        <MaintenanceForm
          v-if="dialog"
          :mobile="mobile"
          :collections="collections"
          @hideInterface="dialog =  false"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

import { mapState } from 'vuex'
import moment from 'moment-timezone'
import Header from '@/components/generals/Header'
import MainButton from '@/components/generals/MainButton'
import MaintenanceForm from '@/components/preventive/MaintenanceForm'
import MaintenanceTable from '@/components/preventive/MaintenanceTable'
import MaintenancePanels from '@/components/preventive/MaintenancePanels.vue'

export default {
  name: 'Preventive',
  components: {
    Header,
    MainButton,
    MaintenancePanels,
    MaintenanceForm,
    MaintenanceTable
  },

  data: () => {
    return {
      dialog: false
    }
  },

  computed: {

    ...mapState(['collections', 'loading']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    thisYearFirst () {
      return `${moment(new Date()).format('yyyy')}-01-01`
    },

    finishedMaintenance () {
      const periodStartDate = `${moment(new Date()).format('yyyy')}-01-01`
      const periodFinishDate = moment(periodStartDate).add(1, 'y').format()
      return this.collections.Office.filter(office =>
        office.lastMaintenance > periodStartDate
        && office.lastMaintenance < periodFinishDate
      )
    }

  }

}
</script>
