<template>
  <v-container>
    <Header
      closable="1"
      title="Formulario de validación"
      subtitle="Mantenimiento preventivo"
      @hideInterface="$emit('hideInterface')"
    />
    <v-card>
      <v-card-text>
        <v-card-title>
          <v-icon left>mdi-account-tie</v-icon>
          {{ updating.clientName }}
        </v-card-title>
        <v-card-subtitle>
          {{ updating.officeName }}
        </v-card-subtitle>
        <section>
          <v-card-subtitle>
            <v-icon>mdi-card-text-outline</v-icon>
            Órdenes de servicio
          </v-card-subtitle>
          <v-tabs v-model="tab">
            <v-tabs-slider color="accent" />
            <v-tab v-for="(order, index) in serviceOrders" :key="index">
              {{ order.orderNumber }}
            </v-tab>
          </v-tabs>
        </section>
        <v-tabs-items v-model="tab">
          <v-tab-item v-for="(order, indx) in serviceOrders" :key="indx">
            <v-chip-group>
              <v-card-subtitle>
                <v-icon left>mdi-barcode</v-icon>
                Seriales
              </v-card-subtitle>
              <v-chip
                v-for="(product, index) in order.inventory"
                :key="index"
                class="mt-3"
                @click="selectProduct(product)"
                @click:close="removeProduct(product)"
                small
                close
                :color="product.serialCode ? 'secondary' : 'error lighten-1'"
              >
                {{ product.serialCode ? product.serialCode : 'Por validar' }}
              </v-chip>
              <v-chip
                class="mt-3"
                @click="addProduct(order)"
                small
                color="secondary lighten-1"
                outlined
              >
                <v-icon left>mdi-plus</v-icon>
                Agregar
              </v-chip>
            </v-chip-group>
          </v-tab-item>
        </v-tabs-items>

        <!-- Form -->

        <v-stepper v-model="step" vertical>
          <v-stepper-step step="1" :editable="step > 1">
            Información general
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-form ref="step1Form" v-model="step1Form">
              <v-row align="center" justify="space-between">
                <v-col :cols="mobile ? 7 : 3">
                  <v-text-field
                    v-model="selectedProduct.serviceOrder"
                    :rules="rules.serviceOrder"
                    label="#Orden"
                    :maxlength="6"
                  />
                </v-col>
                <v-col :cols="mobile ? 5 : 6" align="end">
                  <DateMenu @setDate="(date) => dateSubmitted = date" />
                </v-col>
              </v-row>
              <v-row justify="space-between" align="center">
                <v-col :cols="mobile ? 12 : 6">
                  <v-autocomplete
                    v-model="serviceForm.schedule.technician"
                    :items="formOptions.technicians"
                    :rules="rules.required"
                    label="Personal asignado"
                    solo
                  />
                </v-col>
                <v-col :cols="mobile ? 12 : 6">
                  <v-select
                    v-model="selectedProduct.productType"
                    :items="formLists.productTypes"
                    :rules="rules.required"
                    label="Producto"
                    solo
                  />
                </v-col>
              </v-row>
              <v-btn @click="step++" :disabled="!step1Form" color="primary" small text block>
                Siguiente
              </v-btn>
            </v-form>
          </v-stepper-content>

          <v-stepper-step step="2">
            Información específica
          </v-stepper-step>
          <v-stepper-content step="2">
            <v-form ref="step2Form" v-model="step2Form">
              <v-row align="center">
                <v-col :cols="mobile ? 12 : 6">
                  <v-text-field
                    v-model.trim="selectedProduct.serialCode"
                    :readonly="serialNotSubmitted"
                    :rules="rules.required"
                    label="Serial"
                  />
                </v-col>
                <v-col :cols="mobile ? 12 : 6">
                  <v-switch v-model="serialNotSubmitted" label="Sin serial" />
                </v-col>
                <v-col :cols="mobile ? 12 : 6">
                  <v-autocomplete
                    v-model="selectedProduct.productName"
                    :items="formLists.specificProducts"
                    :rules="rules.required"
                    auto-select-first
                    label="Modelo"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col :cols="mobile ? 7 : 3">
                  <v-select
                    v-model="selectedProduct.location"
                    :rules="rules.required" :items="productLocations"
                    label="Ubicación"
                  />
                </v-col>
                <v-col :cols="mobile ? 5 : 3">
                  <v-select
                    v-model="selectedProduct.locationNumber"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                    label="#"
                  />
                </v-col>
                <v-col :cols="mobile ? 12 : 6">
                  <v-select
                    v-model="selectedProduct.status"
                    :items="['Operativo', 'Inoperativo']"
                    label="Status"
                    :rules="rules.required"
                  />
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col>
                  <v-textarea
                    v-model="selectedProduct.observations"
                    label="Observaciones (opcional)"
                    outlined
                  ></v-textarea>
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col>
                  <v-btn
                    @click="productValidation(selectedIndex, selectedProduct)"
                    color="success"
                    :disabled="!step1Form || !step2Form"
                    :loading="loader"
                  >
                    Guardar
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-content>

        </v-stepper>
      </v-card-text>
      <v-card-actions>
        <v-btn
          @click="finishValidation"
          color="success"
          small
          block
          :disabled="invalidStatus"
        >
          Archivar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>

import Vue from 'vue'

import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'
import { maintenanceStatus, productLocations, rules } from '@/helpers/form'
import Header from '@/components/generals/Header'
import DateMenu from '@/components/generals/DateMenu'

moment.locale('es')

export default Vue.extend({
  name: 'MaintenanceValidation',
  components: { Header, DateMenu },
  props: ['collections', 'mobile', 'updating'],
  data: () => ({
    tab: 0,
    step: 0,
    step1Form: false,
    step2Form: false,
    datePicker: false,
    serviceForm: {},
    selectedProduct: {
      serviceOrder: '',
      quantity: 0,
      productType: '',
      status: ''
    },
    serialNotSubmitted: false,
    productLocations,
    selectedIndex: 0,
    status: maintenanceStatus,
    dateSubmitted: new Date().toISOString().substr(0, 10),
    loader: false,
    friendlyDate: '',
    rules
  }),

  created () {
    this.serviceForm = Object.assign({}, this.updating)
    this.dateSubmitted = this.serviceForm.schedule.scheduledDate
    this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM')}`
  },

  computed: {
    ...mapGetters(['formOptions']),

    formLists () {
      const clientInfo = this.serviceForm.clientName
        ? this.collections.Client.find(client => client.clientName === this.serviceForm.clientName)
        : {}
      const activeContract = clientInfo.contracts.find(contract => contract.active)
      const productTypes = activeContract.products.map(product => product.productType)
      let specificProducts = activeContract.products.filter(product => product.productType === this.selectedProduct.productType)
      specificProducts = specificProducts.map(product => product.productName)
      return { clientInfo, productTypes, specificProducts }
    },

    serviceOrders () {
      let orderNumbers = this.serviceForm.inventory.map(order => order.serviceOrder)
      orderNumbers = new Set([...orderNumbers])
      const orders = []
      for (let orderNumber of orderNumbers) {
        orders.push({
          orderNumber,
          inventory: this.serviceForm.inventory.filter(product => product.serviceOrder === orderNumber)
        })
      }
      return orders
    },

    invalidStatus () {
      const serviceUnfinished = this.serviceForm.status !== 'Culminado'
      const validationIncomplete = this.serviceForm.inventory.find(product => product.serialCode === '') !== undefined
      return serviceUnfinished || validationIncomplete
    }

  },

  methods: {

    ...mapActions(['createDocument', 'updateDocument']),

    itIsWeekend (date) {
      return moment(date).format('dddd') === 'sábado' || moment(date).format('dddd') === 'domingo'
    },

    removeOrder (index) {
      this.serviceOrders.splice(index, 1)
    },

    finishValidation () {
      this.createInventory(this.serviceForm.inventory)
        .then(this.updateOfficeInventory())
        .then(this.serviceForm.fullValidated = true)
      this.serviceForm.status = 'Validado'
      this.saveChanges(true)
    },

    createInventory (inventory) {
      const actions = []
      for (const document of inventory) {
        actions.push(this.createDocument({ collection: 'Inventory', body: document }))
      }
      return Promise.all(actions)
    },

    updateOfficeInventory () {
      const lastMaintenance = this.serviceForm.schedule.scheduledDate
      const { inventory } = this.serviceForm
      const { _id } = this.collections.Office.find(office =>
        office.officeName === this.updating.officeName && office.clientName === this.updating.clientName
      )
      return this.updateDocument({
        collection: 'Office',
        body: { lastMaintenance, inventory, _id }
      })
    },

    selectProduct (product) {
      this.selectedIndex = this.serviceForm.inventory.findIndex(originalProduct => originalProduct === product)
      this.selectedProduct = Object.assign({}, product)
      if (this.formLists.specificProducts.length === 1) {
        this.selectedProduct.productName = this.formLists.specificProducts[0]
      }
      this.step = 1
    },

    removeProduct (product) {
      this.selectedIndex = this.serviceForm.inventory.findIndex(originalProduct => originalProduct === product)
      this.serviceForm.inventory.splice(this.selectedIndex, 1)
      this.selectedIndex = -1
    },

    addProduct (order) {
      let newProduct = Object.assign({}, order.inventory[0])
      newProduct.serialCode = ''
      newProduct.location = ''
      this.serviceForm.inventory.push(newProduct)
    },

    productValidation (index, product) {
      product.serialCode = product.serialCode.toUpperCase()
      product.location = product.location + product.locationNumber
      product.clientName = this.updating.clientName
      product.officeName = this.updating.officeName
      this.serviceForm.inventory.splice(index, 1, product)
      this.step = 0
      this.selectedIndex = -1
      this.selectedProduct = Object.assign({}, {})
      this.saveChanges()
    },

    saveChanges (fullyValidated) {
      this.loader = true
      this.updateDocument({ collection: 'Maintenance', body: this.serviceForm })
        .then(() => { if (fullyValidated) this.$emit('hideInterface') })
        .catch((e) => console.error(e))
        .finally(() => this.loader = false)
    }

  },

  watch: {
    dateSubmitted: function () {
      this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM')}`
      this.serviceForm.schedule.scheduledDate = this.dateSubmitted
    },
    tab: function () {
      this.step = 0
    },
    serialNotSubmitted: function () {
      if (this.serialNotSubmitted) this.selectedProduct.serialCode = 'SIN SERIAL'
      else this.selectedProduct.serialCode = ''
    }
  }
})
</script>
