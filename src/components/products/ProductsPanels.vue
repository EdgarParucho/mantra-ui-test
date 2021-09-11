<template>
  <div>
    <v-expansion-panels v-model="panel" multiple>
      <v-expansion-panel v-for="(category, index) in categories" :key="index">
        <v-expansion-panel-header>{{ category }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-sheet v-for="product, index in orderedProducts(category)" :key="index">
            <v-list-item>
              <v-list-item-avatar v-show="!mobile">
                <v-icon class="grey lighten-1" dark>mdi-label</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="mb-1 font-weight-bold overline">
                  <v-chip outlined label>{{ product.brand }}</v-chip>
                </v-list-item-title>
                <v-list-item-title class="subheader">
                  {{ product.model }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-menu>
                  <template v-slot:activator="{ on }">
                    <v-btn icon small v-on="on" :disabled="$store.state.session.user.userRole > 1">
                      <v-icon color="accent">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item-group>
                      <v-list-item @click="editProduct(product)">
                        <v-list-item-icon>
                          <v-icon>mdi-pencil</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            Editar
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item @click="confirmDelete(product)">
                        <v-list-item-icon>
                          <v-icon>mdi-delete</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            Eliminar
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-menu>
              </v-list-item-action>
            </v-list-item>
          </v-sheet>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-dialog v-model="editInterface" :width="mobile ? '90%' : '60%'" persistent>
      <v-card>
        <ProductForm
          v-if="editInterface"
          :collections="collections"
          :mobile="mobile"
          :editing="selectedDocument"
          @hideInterface="editInterface = false"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import moment from 'moment-timezone'
import ProductForm from '@/components/products/ProductForm.vue'
import { mapActions } from 'vuex'

export default {

  components: { ProductForm },
  name: 'ProductsPanels',
  props: ['collections', 'mobile'],

  data: () => ({

    panel: [],
    bottomSheet: false,
    editInterface: false,
    selectedDocument: {}

  }),

  filters: {

    friendlyDate (dateSubmitted) {
      return moment(dateSubmitted).parseZone('America/Caracas').format('DD [de] MMMM [de] YYYY')
    }

  },

  computed: {

    categories () {
      let brands = this.collections.Product.map(c => c.productType)
      brands = [...new Set(brands)]
      return brands
    }

  },

  methods: {

    ...mapActions(['deleteDocument']),

    orderedProducts (category) {
      let filteredServices = this.collections.Product.filter(product => product.productType === category)
      filteredServices = filteredServices.sort(function (a, b) {
        if (a.brand > b.brand) {
          return 1
        }
        if (a.brand < b.brand) {
          return -1
        }
        return 0
      })
      return filteredServices
    },

    editProduct (product) {
      this.selectedDocument = Object.assign({}, product)
      this.editInterface = true
    },

    confirmDelete (product) {
      confirm('Por favor confirme, esta acción es irreversible') && this.deleteProduct(product)
    },

    deleteProduct (body) {
      const document = { collection: 'Product', body }
      this.deleteDocument(document)
        .then(() => this.panel = [])
        .catch(() => this.panel = [])
    }

  }
}
</script>
