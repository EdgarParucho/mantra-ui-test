<template>
  <v-container>

    <Header title="Oficinas" subtitle="Red de oficinas de clientes" />

    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-skeleton-loader v-if="loading" type="image" width="100%" />
				<v-skeleton-loader v-if="loading" type="image" width="100%" />
        <OfficePanels
          v-else
          :collections="collections"
          :mobile="mobile"
          @editOffice="editOffice"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <OfficesCards :mobile="mobile" />
      </v-col>
    </v-row>

    <MainButton @showForm="createOffice" :loading="loading" />

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
import Header from '@/components/generals/Header'
import MainButton from '@/components/generals/MainButton'
import OfficePanels from '@/components/offices/OfficePanels.vue'
import OfficeForm from '@/components/offices/OfficeForm'
import OfficesCards from '@/components/offices/OfficesCards'

export default {

  name: 'Maintenance',
  components: {
    Header,
    OfficePanels,
    OfficeForm,
    MainButton,
    OfficesCards
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
    }

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
