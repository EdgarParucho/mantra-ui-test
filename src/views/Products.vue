<template>
  <v-container>
    <Header title="Productos" subtitle="Administre la información de los productos" />
    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-skeleton-loader v-if="loading" type="image" width="100%" />
				<v-skeleton-loader v-if="loading" type="image" width="100%" />
        <ProductsPanels
          v-else
          :mobile="mobile"
          :collections="collections"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <ProductsCards :mobile="mobile" />
      </v-col>
    </v-row>
    <MainButton
      @showForm="dialog = true"
      :disabled="$store.state.session.user.userRole > 1"
      :loading="loading"
    />
    <v-dialog v-model="dialog" :width="mobile ? '90%' : '45%'" persistent>
      <v-card>
        <ProductForm
          v-if="dialog"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="dialog = false"
        />
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
// @ is an alias to /src

import Header from '@/components/generals/Header'
import ProductForm from '@/components/products/ProductForm'
import ProductsPanels from '@/components/products/ProductsPanels'
import ProductsCards from '@/components/products/ProductsCards'
import MainButton from '@/components/generals/MainButton'
import { mapState } from 'vuex'

export default {
  name: 'Products',
  components: {
    Header,
    ProductsPanels,
    ProductsCards,
    ProductForm,
    MainButton
  },

  data: () => {
    return { dialog: false }
  },

  computed: {

    ...mapState(['collections', 'loading']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }

  }
}
</script>
