<template>
  <v-container>

    <Header
      closable="1"
      title="Actualización"
      :subtitle="`${updating.officeName} - Mantenimiento`"
      @hideInterface="$emit('hideInterface')"
    />

    <v-card>
      <v-card-text>
        <v-form ref="maintenanceForm" v-model="maintenanceForm">
          <v-row>
            <v-col :cols="mobile ? 7 : 3">
              <v-text-field
                v-model="inventorySlot.serviceOrder"
                :rules="inventorySlot.serviceOrder ? rules.serviceOrder : []"
                label="#Orden"
                :maxlength="6"
              />
            </v-col>
            <v-col :cols="mobile ? 5 : 2">
              <v-text-field
                v-model="inventorySlot.quantity"
                label="Cantidad"
                type="number"
              />
            </v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col :cols="mobile ? 10 : 9">
              <v-select
                v-model="inventorySlot.productType"
                :items="formLists.clientProducts"
                label="Producto(s)"
              />
            </v-col>
            <v-col :cols="mobile ? 12 : 3">
              <v-btn
                @click="attachOrder(inventorySlot)"
                :block="mobile"
                small
                color="secondary"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-chip-group>
                <v-tooltip
                  v-for="(order, index) in serviceOrders"
                  :key="index"
                  bottom
                >
                  <template v-slot:activator="{ on }">
                    <v-chip
                      close
                      @click:close="removeOrder(order)"
                      v-on="on"
                      color="accent"
                      small
                    >
                      {{ order }}
                    </v-chip>
                  </template>
                  {{ orderInfo(order).productType }} ({{ orderInfo(order).quantity }})
                </v-tooltip>
              </v-chip-group>
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
            <v-col :cols="mobile ? 2 : 2">
              <DateMenu @setDate="(date) => dateSubmitted = date" />
            </v-col>
            <v-col :cols="mobile ? 8 : 4">
              <v-text-field
                v-model="friendlyDate"
                label="Fecha de atención"
                :rules="rules.required"
                readonly
                :error-messages="
                  itIsWeekend(dateSubmitted)
                    ? 'Seleccione un día de la semana'
                    : ''
                "
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="serviceForm.status"
                :items="maintenanceStatus"
                label="Status"
                :rules="rules.required"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                @click="save(serviceForm)"
                color="success"
                :disabled="!maintenanceForm"
                :loading="loader"
                block
              >
                Registrar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import Header from '@/components/generals/Header'
import DateMenu from '@/components/generals/DateMenu'
import { rules, maintenanceStatus } from '@/helpers/form'

moment.locale('es')

export default Vue.extend({

  name: 'MaintenanceUpdate',
  components: { Header, DateMenu },
  props: ['collections', 'mobile', 'updating'],

  data: () => ({
    maintenanceForm: false,
    datePicker: false,
    serviceForm: {},
    inventorySlot: {
      serviceOrder: '',
      quantity: 0,
      productType: '',
      status: ''
    },
    maintenanceStatus,
    technician: {},
    dateSubmitted: new Date().toISOString().substr(0, 10),
    loader: false,
    friendlyDate: '',
    rules

  }),

  created () {
    this.serviceForm = Object.assign({}, this.updating)
    this.serviceForm.status = ''
    this.dateSubmitted = this.serviceForm.schedule.scheduledDate
    this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM')}`
  },

  computed: {

    ...mapGetters(['formOptions']),

    formLists () {
      const clientInfo = this.serviceForm.clientName
        ? this.collections.Client.find(client => client.clientName === this.serviceForm.clientName)
        : {}
      const clientProducts = clientInfo.contracts.find(contract => contract.active).products.map(product => product.productType)
      return { clientInfo, clientProducts }
    },

    serviceOrders () {
      let orderNumbers = this.serviceForm.inventory.map(order => order.serviceOrder)
      orderNumbers = new Set([...orderNumbers])
      return orderNumbers
    }

  },

  methods: {

    ...mapActions(['createDocument', 'updateDocument']),

    attachOrder (inventorySlot) {
      const { productType, serviceOrder, quantity } = inventorySlot
      const { clientName, officeName, officeRegion, officeState, schedule } = this.serviceForm
      let index = 0
      while (index < quantity) {
        this.serviceForm.inventory.push({
          clientName,
          officeName,
          officeState,
          officeRegion,
          location: '',
          observations: '',
          productType,
          productName: '',
          serialCode: '',
          schedule,
          serviceOrder,
          status: ''
        })
        index++
      }
      this.inventorySlot = {}
    },

    itIsWeekend (date) {
      return moment(date).format('dddd') === 'sábado' || moment(date).format('dddd') === 'domingo'
    },

    removeOrder (orderNumber) {
      let filteredInventory = this.serviceForm.inventory.filter(order => order.serviceOrder !== orderNumber)
      this.serviceForm.inventory = filteredInventory
    },

    orderInfo (order) {
      const orderData = this.serviceForm.inventory.filter(product => product.serviceOrder === order)
      const productType = orderData[0].productType
      const quantity = orderData.length
      return { productType, quantity }
    },

    async save (body) {
      this.loader = true
      body.schedule.scheduledDate = this.dateSubmitted
      body.finished = body.status === 'Culminado'
      this.updateDocument({ collection: 'Maintenance', body })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    }

  },
  watch: {
    dateSubmitted: function () {
      this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM')}`
    }
  }
})
</script>
