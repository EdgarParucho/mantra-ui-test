<template>
  <v-container>

    <Header
      closable="1"
      title="Eliminar servicio"
      :subtitle="`Código: ${selectedDocument.reportCode}`"
      @hideInterface="$emit('hideInterface')"
    />

    <v-alert type="error" dense text>Esta acción es irreversible</v-alert>

    <v-form @submit.prevent="deleteService(selectedDocument)" ref="form" v-model="form">
      <v-row justify="center">
        <v-col :cols="mobile ? 12 : 6">
          <v-text-field
            v-model="reportCode"
            :rules="codesMatch"
            label="Código del servicio"
            hint="Confirme el código del servicio"
          />
        </v-col>
      </v-row>
      <v-row class="pb-2" align="center">
        <v-col align="center">
          <v-btn :disabled="!form" @click="deleteService(selectedDocument)" :loading="loader" color="error">
            Eliminar
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>

import Vue from 'vue'
import { mapActions } from 'vuex'
import Header from '@/components/generals/Header'

export default Vue.extend({

  name: 'CorrectiveDelete',
  components: { Header },
  props: ['mobile', 'selectedDocument'],

  data: () => ({
    form: false,
    reportCode: '',
    loader: false
  }),

  computed: {

    codesMatch () {
      return [v => v === this.selectedDocument.reportCode || 'Confirme el código del servicio' ]
    }
  
  },
  methods: {

    ...mapActions(['deleteDocument']),

    deleteService (body) {
      this.loader = true
      this.deleteDocument({ collection: 'Active', body })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    }

  }
})
</script>
