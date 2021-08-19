<template>
  <v-container>

    <Header
      closable="1"
      title="Información de solicitud"
      :subtitle="`Servicio: ${selectedDocument.reportCode}`"
      @hideInterface="$emit('hideInterface')"
    />

    <v-form ref="form" v-model="formStatus">
      <v-tabs v-model="tab">
        <v-tabs-slider color="accent" />
        <v-tab>Detalles</v-tab>
        <v-tab>Despacho</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">

        <v-tab-item>
          <v-card min-height="500" flat>
            <v-row justify="space-around">
              <v-col :cols="mobile ? 12 : 4">
                <v-list>
                  <v-list-item-group color="primary">
                    <v-list-item
                      v-for="(item, index) in listItems"
                      :key="index"
                    >
                      <v-list-item-icon>
                        <v-icon>{{ item.icon }}</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title v-text="item.title" />
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-col>

              <v-col :cols="mobile ? 12 : 6">
                <v-row
                  v-for="(item, index) in selectedDocument.requests"
                  :key="index"
                  align="center"
                >
                  <v-col cols="9">
                    <v-select
                      v-model="item.pieceName"
                      :items="filteredListOfPieces"
                      :rules="rules.required"
                      :hint="item.replacementCause"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-btn @click="deleteItem(item)" :disabled="userNotAuthorized" small color="error">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-tab-item>

        <v-tab-item>
          <v-card min-height="500" flat>
            <v-row justify="space-around">
              <v-col class="mt-1" :cols="mobile ? 12 : 4">
                <v-row>
                  <v-col>
                    <v-select
                      v-model="technician"
                      :items="formOptions.technicians"
                      prepend-inner-icon="mdi-account-arrow-left"
                      label="Destinatario"
                      @change="content = []"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-menu
                      v-model="menu1"
                      transition="scale-transition"
                      :close-on-content-click="false"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="dispatch.date"
                          v-on="on"
                          readonly
                          v-bind="attrs"
                          label="Fecha de despacho"
                          :rules="rules.required"
                          prepend-inner-icon="mdi-calendar-question"
                        />
                      </template>
                      <v-date-picker
                        v-model="dispatch.date"
                        first-day-of-week="1"
                        locale="es"
                        no-title
                        @input="menu1 = false"
                      />
                    </v-menu>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-select
                      v-model="dispatch.method"
                      :items="['MRW', 'Entrega personal']"
                      label="Método"
                      prepend-inner-icon="mdi-truck-fast-outline"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="dispatch.destiny"
                      label="Oficina destino"
                      :rules="
                        dispatch.method === 'Entrega personal'
                          ? []
                          : rules.required
                      "
                      prepend-inner-icon="mdi-store"
                      :readonly="dispatch.method === 'Entrega personal'"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="dispatch.reference"
                      label="Referencia"
                      :rules="
                        dispatch.method === 'Entrega personal'
                          ? []
                          : rules.required
                      "
                      prepend-inner-icon="mdi-barcode"
                      :readonly="dispatch.method === 'Entrega personal'"
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="dispatch.cost"
                      label="Costo"
                      :rules="
                        dispatch.method === 'Entrega personal'
                          ? []
                          : rules.required
                      "
                      prepend-inner-icon="mdi-cash"
                      :hint="dispatch.cost | formatNumberAsUSD"
                      :readonly="dispatch.method === 'Entrega personal'"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="mt-6" :cols="mobile ? 12 : 6">
                <v-row
                  v-for="(item, index) in selectedDocument.requests"
                  :key="index"
                  justify="center"
                >
                  <v-col :cols="mobile ? 12 : 8">
                    <v-checkbox
                      class="my-0"
                      v-model="content"
                      :value="item"
                      :label="item.pieceName"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-tab-item>
        <v-app-bar dense bottom>
          <v-row>
            <v-col align="center">
              <v-btn
                @click="save(dispatch)"
                color="primary"
                :disabled="!formStatus || !content.length || userNotAuthorized"
                :loading="loading"
              >
                Despachar selección
              </v-btn>
            </v-col>
          </v-row>
        </v-app-bar>
      </v-tabs-items>
    </v-form>
  </v-container>
</template>

<script>

import { mapState, mapGetters, mapActions } from 'vuex'
import Header from '@/components/generals/Header'
import { rules } from '@/helpers/form'

export default {

  name: 'RequestDetails',
  components: { Header },
  props: ['originalItem', 'selectedDocument'],

  data: () => {
    return {
      rules,
      tab: 0,
      formStatus: false,
      loading: false,
      menu1: false,
      courierCompany: '',
      courierOffice: '',
      content: [],
      technician: '',
      dispatch: {
        destiny: '',
        cost: '',
        date: '',
        method: '',
        reference: ''
      }
    }
  },

  filters: {
    formatNumberAsUSD (number) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' }).format(number)
    }
  },

  created () {
    this.technician = this.selectedDocument.technician
  },

  computed: {

    ...mapState(['collections']),
    ...mapGetters(['formOptions']),

    userNotAuthorized () {
      return this.$store.state.session.user.department !== 'Almacén'
    },
    
    listItems () {
      return [
        { icon: 'mdi-email-newsletter', title: `#Reporte: ${this.selectedDocument.reportCode}` },
        { icon: 'mdi-account-tie', title: `Cliente: ${this.selectedDocument.clientName}` },
        { icon: 'mdi-bank', title: `Oficina: ${this.selectedDocument.officeName}` },
        { icon: 'mdi-printer', title: `Producto: ${this.selectedDocument.productName}` },
        { icon: 'mdi-calendar', title: `Fecha de solicitud: ${this.selectedDocument.requestDate}` },
        { icon: 'mdi-phone', title: `Cliente: ${this.selectedDocument.requestedBy}` }
      ]
    },

    mobile () {
      return this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs
    },

    filteredListOfPieces () {
      let list = []
      let aux
      for (const i in this.collections.Piece) {
        aux = this.collections.Piece[i].asociatedProducts.find(
          element => element === this.selectedDocument.productName
        )
        if (aux !== undefined) {
          list.push(this.collections.Piece[i])
        }
      }
      list = list.map(n => n.pieceName)
      return list
    }
  },
  methods: {

    ...mapActions(['createDocument', 'deleteDocument']),

    deleteItem (item) {
      confirm('Esta acción es irreversible') && this.confirmDelete(item)
    },

    confirmDelete (body) {
      this.deleteDocument({ collection: 'Request', body })
        .then(() => this.$emit('hideInterface'))
    },

    save (dispatchInfo) {
      this.loading = true
      const dispatchesToCreate = []
      const requestsToDelete = []
      for (let request of this.content) {
        request.dispatch = dispatchInfo
        request.technician = this.technician
        dispatchesToCreate.push(this.createDocument({ collection: 'Dispatch', body: request }))
        requestsToDelete.push(this.deleteDocument({ collection: 'Request', body: request }))
      }
      this.createDispatch(dispatchesToCreate, requestsToDelete)
    },

    createDispatch (documentsToCreate, documentsToDelete) {
      Promise.all(documentsToCreate)
        .then(() => this.deleteRequest(documentsToDelete))
        .catch(() => this.loading = true)
    },

    deleteRequest (documentsToDelete) {
      Promise.all(documentsToDelete)
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loading = true)
    }
  }
}
</script>
