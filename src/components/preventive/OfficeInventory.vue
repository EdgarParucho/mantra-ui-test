<template>
  <v-container>
    <Header
      closable="1"
      title="Inventario"
      subtitle="Último mantenimiento"
      @hideInterface="$emit('hideInterface')"
    />
    <v-card>
      <v-card-text>
        <v-tabs v-model="tab">
        <v-tabs-slider color="accent" />
        <v-tab v-for="product, index in productTypes" :key="index">
          {{ product.productType }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-if="productTypes.length" v-model="tab">
        <v-tab-item v-for="product, index in productTypes" :key="index">
          <v-data-table :items="product.registeredProducts" :headers="headers" />
        </v-tab-item>
      </v-tabs-items>
        <v-card-title v-else>Información no registrada</v-card-title>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Header from '@/components/generals/Header'
export default {
  name: 'OfficeInventory',
  components: { Header },
  props: ['inventory', 'mobile'],
  data: () => {
    return {
      tab: 0,
      headers: [
        { text: 'Producto', value: 'productName' },
        { text: 'Serial', value: 'serialCode' }
      ]
    }
  },
  computed: {
    productTypes () {
      let products = this.inventory.map(product => product.productType)
      products = new Set([...products])
      const filteredProducts = []
      for (let productType of products) {
        const registeredProducts = this.inventory.filter(inventory => inventory.productType === productType)
        filteredProducts.push({ productType, registeredProducts })
      }
      return filteredProducts
    }
  }
}
</script>
