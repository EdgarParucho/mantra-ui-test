<template>
  <v-container>
    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información del producto"
      @hideInterface="$emit('hideInterface')"
    />
    <v-form ref="form" v-model="form">
      <v-row>
        <v-col :cols="mobile ? 12 : 6">
          <v-select
            v-model="productType"
            :items="formOptions.productTypes"
            :rules="rules.required"
            persistent-hint
            hint="Tipo"
            solo
          />
        </v-col>
        <v-col :cols="mobile ? 12 : 6">
          <v-text-field
            v-if="productType === 'Agregar'"
            v-model="newProductType"
            :rules="rules.required"
            label="Nuevo tipo de producto"
          />
        </v-col>
        <v-col :cols="mobile ? 12 : 6">
          <v-select
            v-model="brand"
            :items="formOptions.brands"
            :rules="rules.required"
            solo
            hint="Marca"
            persistent-hint
          />
        </v-col>
        <v-col :cols="mobile ? 12 : 6">
          <v-text-field
            v-if="brand === 'Agregar'"
            v-model="newBrand"
            :rules="rules.required"
            label="Nueva marca"
          />
        </v-col>
        <v-col :cols="mobile ? 12 : 6">
          <v-text-field
            v-model="model"
            :rules="rules.required"
            label="Modelo"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col :cols="12">
          <v-autocomplete
            v-model="categories"
            :items="formOptions.categories"
            :rules="rules.required"
            deletable-chips
            chips
            outlined
            small-chips
            multiple
            label="Categorias"
          />
        </v-col>
      </v-row>
      <v-btn
        @click="save(product)"
        :disabled="!form"
        :loading="loader"
        color="success"
        block
      >
        Guardar
      </v-btn>
    </v-form>
  </v-container>
</template>

<script>

import Vue from 'vue'
import { mapMutations, mapActions } from 'vuex'
import moment from 'moment-timezone'
import { rules } from '@/helpers/form'
import Header from '@/components/generals/Header'

moment.locale('es')

export default Vue.extend({

  name: 'ProductForm',
  components: { Header },
  props: ['collections', 'mobile', 'editing'],

  data: () => ({
    form: false,
    brand: '',
    model: '',
    productType: '',
    newProductType: '',
    newBrand: '',
    categories: [],
    originalItem: {},
    loader: false,
    rules

  }),

  created () {
    if (this.editing) {
      this.model = this.editing.model
      this.brand = this.editing.brand
      this.categories = this.editing.categories
      this.productType = this.editing.productType
      this.originalItem = JSON.parse(JSON.stringify(this.editing))
      delete this.originalItem._id
    }
  },

  computed: {

    formOptions () {
      let productTypes = this.collections.Product.map(product => product.productType)
      productTypes.unshift('Agregar')
      let brands = this.collections.Product.map(product => product.brand)
      brands.unshift('Agregar')
      let categories = this.collections.Product.map(product => product.categories)
      function mergeArr(...arr) {
        return arr.reduce((acc, val) => {
          return [...acc, ...new Set(val)]
        }, [])
      }
      categories = mergeArr(categories)[0]
      return { productTypes, categories, brands }
    },

    product () {
      const brand = this.newBrand ? this.newBrand : this.brand
      const productType = this.newProductType ? this.newProductType : this.productType
      const model = this.model
      const productName = `${productType} ${brand} ${model}`
      const categories = this.categories
      return { brand, productType, model, productName, categories }
    },

    requiresMassiveUpdate () {
      if (!this.editing) return
      else return this.editing.productName !== this.product.productName
    }

  },

  methods: {

    ...mapActions(['createDocument', 'updateDocument', 'findDocuments', 'updateDocuments']),
    ...mapMutations(['showSnackbar']),

    removeCategory (index) {
      this.categories.splice(index, 1)
    },

    async preventDuplicity (form) {
      const { productName } = form
      const _id = this.editing ? this.editing._id : null

      const filter = { productName, _id: { "$ne": _id } }
      const res = await this.findDocuments({ collection: 'Product', filter })
      if (!res.length) return false
      else return this.showSnackbar({ error: 'Nombre del producto registrado anteriormente' }), true
    },

    async save (body) {
      this.loader = true
      const registeredBefore = await this.preventDuplicity(body)
      if (registeredBefore) return this.loader = false
      if (this.editing) this.update({ collection: 'Product', body })
      else this.create({ collection: 'Product', body })
    },

    update (document) {
      document.body._id = this.editing._id
      this.updateDocument(document)
        .then(() => { if (this.requiresMassiveUpdate) this.updateDependencies(document) })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    updateDependencies ({ body }) {
      const actions = []
      const query = { productName: this.originalItem.productName }
      const update = { productName: body.productName, productType: body.productType }
      const collections = this.dependencies(query, update)
      for (const collection of collections) actions.push(this.updateDocuments(collection))
      Promise.all(actions)
    },

    dependencies (query, update) {
      return [
        { collection: 'Active', query, update, options: {} },
        { collection: 'Closed', query, update, options: {} },
        {
          collection: 'Maintenance',
          query: { "inventory.productName": query.productName },
          update: {
            $set: {
              "inventory.$[product].productType": update.productType,
              "inventory.$[product].productName": update.productName
            }
          },
          options: { arrayFilters: [ { "product.productName": query.productName } ] }
        },
        { collection: 'Inventory', query, update, options: {} },
        {
          collection: 'Client',
          query: { "contracts.products.productName": query.productName },
          update: {
            $set: {
              "contracts.$[contract].products.$[product].productType": update.productType,
              "contracts.$[contract].products.$[product].productName": update.productName
            }
          },
          options: {
            arrayFilters: [
              { "contract.products.productName": query.productName },
              { "product.productName": query.productName }
            ]
          }
        },
        {
          collection: 'Office',
          query: { "inventory.productName": query.productName },
          update: {
            $set: {
              "inventory.$[product].productType": update.productType,
              "inventory.$[product].productName": update.productName
            }
          },
          options: { arrayFilters: [ { "product.productName": query.productName } ] }
        },
        { collection: 'Request', query, update, options: {} },
        { collection: 'Dispatch', query, update, options: {} },
        {
          collection: 'Piece',
          query: { asociatedProducts: query.productName },
          update: {
            $set: {
              "asociatedProducts.$[product]": update.productName,
              pieceCategory: update.productType
            }
          },
          options: { arrayFilters: [{ "product": query.productName }] }
        },
      ]
    },

    create (document) {
      this.createDocument(document)
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    }

  }
})
</script>
