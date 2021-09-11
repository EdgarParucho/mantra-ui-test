<template>
  <v-container>

    <Header title="Oficinas" subtitle="Red de oficinas de clientes" />

    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-skeleton-loader v-if="updatingState" type="image" width="100%" />
				<v-skeleton-loader v-if="updatingState" type="image" width="100%" />
        <OfficePanels
          v-else
          :collections="collections"
          :mobile="mobile"
          @editOffice="editOffice"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <v-sheet class="pa-3" v-if="updatingState">
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="card"
          ></v-skeleton-loader>
        </v-sheet>
        <Graph
          v-else
          id="officesGraph1"
          :updatingState="updatingState"
          :chartData="officesXClient"
          title="Oficinas por cliente"
          subtitle="Según actividad"
        />
      </v-col>
    </v-row>

    <MainButton @showForm="createOffice" :updatingState="updatingState" />

    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="dialog">
      <v-card>
        <OfficeForm
          v-if="dialog"
          :mobile="mobile"
          :editing="selectedOffice"
          :collections="collections"
          @hideInterface="dialog = false"
        />
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>

import { mapState } from 'vuex'
import Graph from '@/components/generals/Graph'
import Header from '@/components/generals/Header'
import MainButton from '@/components/generals/MainButton'
import OfficePanels from '@/components/offices/OfficePanels.vue'
import OfficeForm from '@/components/offices/OfficeForm'

export default {

  name: 'Maintenance',
  components: {
    Graph,
    Header,
    OfficePanels,
    OfficeForm,
    MainButton
  },

  data: () => {
    return {
      dialog: false
    }
  },

  computed: {

    ...mapState(['collections', 'updatingState']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    officesXClient () {
      const labels = this.collections.Client.map(client => client.clientName)
      const type = 'line'
      const options = {}
      const data = {
        labels,
        datasets: [
          { label: 'Activas', data: [], borderColor: this.$vuetify.theme.currentTheme.success },
          { label: 'Inactivas', data: [], borderColor: this.$vuetify.theme.currentTheme.error }
        ]
      }
      for (const label of labels) {
        const activeOffices = office => office.clientName === label && office.isActive
        const inactiveOffices = office => office.clientName === label && !office.isActive
        data.datasets[0].data.push(this.collections.Office.filter(activeOffices).length)
        data.datasets[1].data.push(this.collections.Office.filter(inactiveOffices).length)
      }
      return { type, data, options }
    },



  },

  methods: {

    editOffice (office) {
      this.selectedOffice = Object.assign({}, office)
      this.dialog = true
    },
    
    createOffice () {
      this.selectedOffice = null
      this.dialog = true
    }

  }
}
</script>
