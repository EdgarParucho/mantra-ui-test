<template>
  <v-container>
    <Header title="Productos" subtitle="Administre la información de los productos" />
    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-skeleton-loader v-if="updatingState" type="image" width="100%" />
				<v-skeleton-loader v-if="updatingState" type="image" width="100%" />
        <ProductsPanels
          v-else
          :mobile="mobile"
          :collections="collections"
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
          id="productsGraph1"
          :updatingState="updatingState"
          :chartData="servicesXProduct"
          title="Servicios por producto"
          :subtitle="thisMonth"
        />
      </v-col>
    </v-row>
    <MainButton
      @showForm="dialog = true"
      :disabled="$store.state.session.user.userRole > 1"
      :updatingState="updatingState"
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

import moment from 'moment-timezone'
import Graph from '@/components/generals/Graph'
import Header from '@/components/generals/Header'
import ProductForm from '@/components/products/ProductForm'
import ProductsPanels from '@/components/products/ProductsPanels'
import MainButton from '@/components/generals/MainButton'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'Products',
  components: {
    Graph,
    Header,
    ProductsPanels,
    ProductForm,
    MainButton
  },

  data: () => {
    return { dialog: false }
  },

  computed: {

    ...mapState(['collections', 'updatingState']),
    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },
    corrective () {
      return [...this.collections.Active, ...this.collections.Closed]
    },
    thisMonth () {
      return moment(new Date()).format('MMMM')
    },
    servicesXProduct () {
      let labels = this.collections.Product.map(product => product.productType)
      labels = [...new Set(labels)]
      const type = 'line'
      const options = {}
      const data = {
        labels,
        datasets: [
          { label: 'Correctivo', data: [], borderColor: this.$vuetify.theme.currentTheme.primary },
          { label: 'Preventivo', data: [], borderColor: this.$vuetify.theme.currentTheme.accent }
        ]
      }
      for (const label of labels) {
        const productCorrectives = service => service.productType === label
        data.datasets[0].data.push(this.corrective.filter(productCorrectives).length)
        const productPreventives = service => service.inventory.find(product => product.productType === label)
        const productServices = this.finishedMaintenance.filter(productPreventives)
        let productQuantity = 0
        console.log(productServices)
        for (const service of productServices) {
          productQuantity = productQuantity + service.inventory.filter(product => product.productType === label).length
        }
        data.datasets[1].data.push(productQuantity)
      }
      return { type, data, options }
    },

    finishedMaintenance () {
      const thisMonthFirst = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const fromThisMonth = (service) => moment(service.schedule.scheduledDate).parseZone('America/Caracas').isSameOrAfter(thisMonthFirst)
      const main = this.collections.Maintenance.filter(service => fromThisMonth(service))
      return main
    }
  }
}
</script>
