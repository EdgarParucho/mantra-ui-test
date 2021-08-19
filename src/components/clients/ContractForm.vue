<template>
  <v-container>
    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información del contrato"
      @hideInterface="$emit('hideInterface')"
    />
    <v-stepper v-model="activeStep" vertical>
      <v-stepper-step
        :complete="activeStep > 1"
        step="1"
        :editable="step1Completed"
      >
        Acuerdos generales
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-form ref="step1Completed" v-model="step1Completed">
          <v-row align="center">
            <v-col :cols="mobile ? 12 : 4">
              <v-card-subtitle>
                Status
              </v-card-subtitle>
            </v-col>
            <v-col :cols="mobile ? 12 : 4">
              <v-radio-group row v-model="contract.active">
                <v-radio
                  v-for="(inactive, i) in [true, false]"
                  :key="i"
                  :label="inactive ? 'Activo' : 'Inactivo'"
                  :value="inactive"
                />
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col :cols="mobile ? 12 : 4">
              <v-card-subtitle>
                Periodo contratado
              </v-card-subtitle>
            </v-col>
            <v-col :cols="mobile ? 12 : 5">
              <v-text-field
                v-model="dateRange"
                label="Rango"
                :rules="rules.required"
                readonly
              />
            </v-col>
            <v-col :cols="mobile ? 12 : 3">
              <v-menu
                ref="startingDateMenu"
                v-model="startingDatePicker"
                :close-on-content-click="false"
                :return-value.sync="contract.startingDate"
                transition="scale-transition"
                nudge-left="150"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    small
                    color="primary"
                    class="ma-1"
                  >
                    <v-icon>mdi-calendar-check</v-icon>
                  </v-btn>
                </template>
                <v-date-picker
                  v-model="contract.startingDate"
                  @input.passive="setRange"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    @click="startingDatePicker = false"
                  >
                    Cancelar
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.startingDateMenu.save(contract.startingDate)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
              <v-menu
                ref="finishDateMenu"
                v-model="finishDatePicker"
                :close-on-content-click="false"
                :return-value.sync="contract.finishDate"
                transition="scale-transition"
                nudge-left="150"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    small
                    color="primary"
                    class="ma-1"
                  >
                    <v-icon>mdi-calendar-remove</v-icon>
                  </v-btn>
                </template>
                <v-date-picker
                  v-model="contract.finishDate"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    @click="finishDatePicker = false"
                  >
                    Cancelar
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.finishDateMenu.save(contract.finishDate)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col :cols="mobile ? 12 : 4">
              <v-card-subtitle>
                S. L. A.
              </v-card-subtitle>
            </v-col>
            <v-col :cols="mobile ? 6 : 3">
              <v-select
                v-model="contract.sla.local"
                label="Local"
                :items="[8, 16, 24, 48]"
                :rules="rules.required"
              />
            </v-col>
            <v-col :cols="mobile ? 6 : 3">
              <v-select
                v-model="contract.sla.foreign"
                label="Foráneo"
                :items="[8, 16, 24, 48]"
                :rules="rules.required"
              />
            </v-col>
          </v-row>
          <v-btn
            class="mb-1"
            :disabled="!step1Completed"
            color="primary"
            text
            block
            @click="activeStep++"
          >
            Continuar
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step
        :complete="activeStep > 1"
        step="2"
        :editable="step1Completed"
      >
        Productos contratados
      </v-stepper-step>
      <v-stepper-content step="2">
      <v-form ref="step2Completed" v-model="step2Completed">
        <v-data-table
          v-model="contract.products"
          :headers="headers"
          :items="collections.Product"
          item-key="_id"
          show-select
          :search="tableFilter"
        >
          <template v-slot:top>
            <v-row class="ml-1">
              <v-col :cols="mobile ? 8 : 4">
                <v-text-field v-model="tableFilter" label="Filtro" prepend-inner-icon="mdi-filter-outline" />
              </v-col>
            </v-row>
          </template>
        </v-data-table>
        <v-btn
          @click="update(client)"
          class="mt-2"
          :loading="loader"
          color="success"
          block
        >
          Guardar
        </v-btn>
        </v-form>
      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script>

import Vue from 'vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import { rules } from '@/helpers/form.js'
import moment from 'moment-timezone'
import Header from '@/components/generals/Header'

moment.locale('es')

export default Vue.extend({

  name: 'ContractForm',
  components: { Header },
  props: ['mobile', 'editingClient', 'editingContract', 'contractIndex'],

  created () {

    this.client = JSON.parse(JSON.stringify(this.editingClient))
    if (this.editingContract) this.contract = JSON.parse(JSON.stringify(this.editingContract))
    this.setRange()

  },

  data: () => ({
    // Form data
    client: { clientName: '', regions: [], contacts: [], contracts: [] },
    contract: {
      active: true,
      sla: { local: 0, foreign: 0 },
      products: [],
      startingDate: `${moment(new Date()).format('yyyy')}-01-01`,
      finishDate: `${moment(new Date()).format('yyyy')}-12-31`,
    },

    // Vuetify components
    tableFilter: '',
    headers: [
      { text: 'Tipo', value: 'productType' },
      { text: 'Marca', value: 'brand' },
      { text: 'Modelo', value: 'model' }
    ],
    activeStep: 1,
    step1Completed: false,
    step2Completed: false,
    startingDatePicker: false,
    finishDatePicker: false,

    // Data binding
    rules,
    dateRange: [],
    loader: false
  }),

  computed: {

    ...mapState(['collections'])
  },

  methods: {

    ...mapActions(['updateDocument', 'findDocuments']),
    ...mapMutations(['showSnackbar']),

    setRange () {
      const dates = [this.contract.startingDate, this.contract.finishDate]
      this.dateRange = dates.join(' ~ ')
    },

    deactivateCurrentContract (client) {
      const activeContract = client.contracts.find(contract => contract.active)
      if (activeContract) activeContract.active = false
      return client
    },

    async update (client) {
      const activeQry = { filter: { clientName: client.clientName }, collection: 'Active' }
      const maintenanceQry = {
        filter: { clientName: client.clientName, $or: [{ status: 'Por culminar' }, { status: 'Asignado' }] },
        collection: 'Maintenance'
      }
      const hasActiveServices = [...await this.findDocuments(activeQry), ...await this.findDocuments(maintenanceQry)].length
      if (hasActiveServices) return this.showSnackbar({ error: 'La información de contratos no puede ser editada mientras existan servicios activos para el cliente' })
      this.loader = true
      if (this.contract.active) client = this.deactivateCurrentContract(client)
      if (this.editingContract) client.contracts.splice(this.contractIndex, 1, this.contract)
      else client.contracts.push(this.contract)

      this.updateDocument({ collection: 'Client', body: client })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    }
  },

  watch: {
    "contract.startingDate": function () {
      this.setRange()
    },
    "contract.finishDate": function () {
      this.setRange()
    }
  }
})
</script>
