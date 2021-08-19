<template>
  <v-container>

    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información del servicio"
      @hideInterface="$emit('hideInterface')"
    />

    <v-card>
      <v-card-text>
        <v-form ref="maintenanceForm" v-model="maintenanceForm">
          <v-row>
            <v-col :cols="mobile ? 12 : 6">
              <v-switch
                v-model="hideInactiveClients"
                :disabled="editing !== undefined"
                label="Ocultar clientes inactivos"
              />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-autocomplete
                v-model="serviceForm.clientName"
                :disabled="editing !== undefined"
                :items="formLists.clientNames"
                :rules="rules.required"
                label="Cliente"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="mobile ? 12 : 6">
              <v-switch v-model="hideVisitedOffices" label="Ocultar oficinas atendidas" />
            </v-col>
            <v-col>
              <v-autocomplete
                v-model="serviceForm.officeName"
                :items="formLists.clientOfficeNames"
                :rules="rules.required"
                :disabled="!serviceForm.clientName"
                label="Oficina"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="mobile ? 12 : 5">
              <v-autocomplete
                v-model="technician"
                :items="formOptions.technicians"
                :rules="rules.required"
                label="Personal asignado"
              />
            </v-col>
            <v-col :cols="mobile ? 3 : 2">
              <DateMenu @setDate="(date) => dateSubmitted = date" />
            </v-col>
            <v-col :cols="mobile ? 9 : 5">
              <v-text-field
                v-model="friendlyDate"
                label="Fecha estimada de atención"
                readonly
                :rules="rules.required"
                :error-messages="itIsWeekend(dateSubmitted) ? 'Seleccione un día de la semana' : ''"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                color="success"
                block
                :disabled="!maintenanceForm"
                :loading="loader"
                @click="save(serviceForm)"
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
import { mapMutations, mapGetters, mapActions } from 'vuex'
import { rules } from '@/helpers/form.js'
import Header from '@/components/generals/Header'
import DateMenu from '@/components/generals/DateMenu'
import moment from 'moment-timezone'

moment.locale('es')

export default Vue.extend({
  name: 'MaintenanceForm',
  components: { Header, DateMenu },
  props: ['pendingMaintenance', 'collections', 'mobile', 'editing', 'startTemplate'],
  data: () => ({
    maintenanceForm: false,
    datePicker: false,
    hideVisitedOffices: true,
    hideInactiveClients: true,

    serviceForm: {
      clientName: '',
      officeName: ''
    },
    technician: null,

    dateSubmitted: new Date().toISOString().substr(0, 10),
    loader: false,
    friendlyDate: '',
    rules

  }),

  created () {
    if (this.startTemplate) this.serviceForm = Object.assign({}, this.startTemplate)
    if (this.editing) {
      this.serviceForm = Object.assign({}, this.editing)
      this.technician = this.editing.schedule.technician
      this.dateSubmitted = moment(this.editing.serviceDate).parseZone('America/Caracas').format('YYYY-MM-D')
    }
    this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM')}`
  },

  computed: {

    ...mapGetters(['formOptions']),

    formLists () {
      const clientNames = this.hideInactiveClients
        ? this.formOptions.clientsWithContract.map(client => client.clientName)
        : this.collections.Client.map(client => client.clientName)
      const clientInfo = this.serviceForm.clientName
        ? this.collections.Client.find(client => client.clientName === this.serviceForm.clientName)
        : {}
      const officesToFilter = this.hideVisitedOffices
        ? this.formOptions.pendingMaintenance
        : this.collections.Office
      const clientOffices = this.serviceForm.clientName
        ? officesToFilter.filter(office => office.clientName === this.serviceForm.clientName)
        : []
      const clientOfficeNames = clientOffices !== []
        ? clientOffices.map(x => x.officeName)
        : []
      let clientProducts = []
      if (this.serviceForm.clientName) {
        clientProducts = clientInfo.contracts.find(contract => contract.active).products.map(product => product.productName)
      } else {
        clientProducts = []
      }
      const officeInfo = this.serviceForm.officeName
        ? this.collections.Office.find((office) => office.officeName === this.serviceForm.officeName)
        : {}
      console.log(officeInfo)
      return { clientNames, clientInfo, clientOfficeNames, clientProducts, officeInfo }
    }
  },
  methods: {
    ...mapActions(['createDocument', 'updateDocument', 'findDocuments']),
    ...mapMutations(['showSnackbar']),

    itIsWeekend (date) {
      return moment(date).format('dddd') === 'sábado' || moment(date).format('dddd') === 'domingo'
    },

    async preventDuplicity (form) {
      const { clientName, officeName } = form
      const _id = this.editing ? this.editing._id : null

      const filter = {
        clientName,
        officeName,
        "$or": [
          { status: 'Asignado' },
          { status: 'Culminado' },
          { status: 'Por culminar' }
        ],
        _id: { "$ne": _id }
      }
      const res = await this.findDocuments({ collection: 'Maintenance' , filter })
      console.log(res)
      if (!res.length) return false
      else return this.showSnackbar({ error: 'Registrado anteriormente, verifique por cliente y oficina' }), true
    },

    async save (newService) {
      this.loader = true

      const registeredBefore = await this.preventDuplicity(newService)
      if (registeredBefore) return this.loader = false
      console.log(registeredBefore)
      const body = this.completeFields(newService)

      if (this.editing) return this.update({ collection: 'Maintenance', body })
      else this.create({ collection: 'Maintenance', body })

    },

    completeFields (body) {
      body.schedule = { scheduledDate: this.dateSubmitted, technician: this.technician }
      body.officeRegion = this.formLists.officeInfo.region
      body.officeState = this.formLists.officeInfo.officeState
      return body
    },
    
    update (document) {
      this.updateDocument(document)
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },
    
    create (document) {
      this.createDocument(document)
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
