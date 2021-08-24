<template>
  <v-container>
    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información de la oficina"
      @hideInterface="$emit('hideInterface')"
    />
    <v-stepper v-model="step" vertical>
      <v-stepper-step editable :complete="step > 1" step="1">
        Información básica
      </v-stepper-step>

      <v-stepper-content step="1">
        <v-form ref="step1Completed" v-model="step1Completed">
          <v-row>
            <v-col :cols="mobile ? 12 : 6">
              <v-select
                v-model="officeForm.clientName"
                :items="formOptions.clientNames"
                :rules="rules.required"
                :disabled="editing !== null"
                label="Cliente"
                solo
              />
            </v-col>
            <v-col :cols="mobile ? 6 : 3">
              <v-text-field
                v-model="officeForm.code"
                :rules="rules.officeCode"
                label="Código"
                maxlength="4"
              />
            </v-col>
          </v-row>
          <v-row class="my-0">
            <v-col :cols="mobile ? 12 : 9">
              <v-text-field
                class="mb-1"
                v-model.trim="officeForm.officeName"
                label="Nombre de oficina"
                :rules="rules.required"
              />
            </v-col>
          </v-row>
          <v-btn
            class="my-1"
            :disabled="!step1Completed"
            color="primary"
            block
            text
            @click="step++"
          >
            Continuar
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step
        :complete="step > 3"
        step="2"
        editable
      >
        Ubicación
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-form ref="step2Completed" v-model="step2Completed">
          <v-row>
            <v-col :cols="mobile ? 12 : 6">
              <v-autocomplete
                v-model="officeForm.officeState"
                :items="states"
                :rules="rules.required"
                label="Estado"
              />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-select
                v-model="officeForm.region"
                :items="regions"
                label="Región"
                :rules="rules.required"
                :disabled="!officeForm.clientName"
                solo
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="mobile ? 6 : 3">
              <v-text-field
                v-model="officeForm.postalCode"
                label="Código postal"
                :rules="rules.officeCode"
                :maxlength="4"
              />
            </v-col>
            <v-col :cols="mobile ? 6 : 3">
              <v-switch
                v-model="officeForm.isLocal"
                label="Local"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="officeForm.address"
                label="Dirección"
                outlined
                counter
              />
            </v-col>
          </v-row>
          <v-btn
            class="mb-1"
            :disabled="!step2Completed"
            color="primary"
            block
            text
            @click="step++"
          >
            Continuar
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step step="3" editable :complete="step > 3">
        Status
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-form ref="step3Completed" v-model="step3Completed">
          <v-row>
            <v-col :cols="6">
              <v-switch class="ml-3" v-model="officeForm.isActive" label="Activa" />
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col :cols="mobile ? 4 : 2">
              <v-menu
                ref="menu"
                v-model="timePicker"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="officeForm.openingHour"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="ma-1"
                    v-bind="attrs"
                    v-on="on"
                    small
                    :outlined="!officeForm.openingHour"
                    :color="officeForm.openingHour ? 'primary' : 'error'"
                  >
                    <v-icon>mdi-clock-time-four-outline</v-icon>
                  </v-btn>
                </template>
                <v-time-picker
                  v-if="timePicker"
                  v-model="officeForm.openingHour"
                  full-width
                  format="24hr"
                  @click:minute="$refs.menu.save(officeForm.openingHour)"
                />
              </v-menu>
            </v-col>

            <v-col :cols="mobile ? 8 : 3">
              <v-text-field v-model="officeForm.openingHour" readonly label="Apertura" />
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col :cols="mobile ? 4 : 2">
              <v-menu
                ref="menu2"
                v-model="timePicker2"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="officeForm.closingHour"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="ma-1"
                    v-bind="attrs"
                    v-on="on"
                    small
                    :outlined="!officeForm.closingHour"
                    :color="officeForm.closingHour ? 'primary' : 'error'"
                  >
                    <v-icon>mdi-clock-time-four-outline</v-icon>
                  </v-btn>
                </template>
                <v-time-picker
                  v-if="timePicker2"
                  v-model="officeForm.closingHour"
                  full-width
                  format="24hr"
                  @click:minute="$refs.menu2.save(officeForm.closingHour)"
                />
              </v-menu>
            </v-col>

            <v-col :cols="mobile ? 8 : 3">
              <v-text-field v-model="officeForm.closingHour" readonly label="Cierre" />
            </v-col>
          </v-row>
          <v-btn
            @click="save(officeForm)"
            color="success"
            block
            :disabled="!step2Completed || !step3Completed"
            :loading="loader"
          >
            Registrar
          </v-btn>
        </v-form>
      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script>

import Header from '@/components/generals/Header'
import { rules, states } from '@/helpers/form'
import { mapMutations, mapActions, mapGetters } from 'vuex'

export default {

  name: 'OfficeForm',
  components: { Header },
  props: ['mobile', 'collections', 'editing'],

  data: () => ({
    step: 1,
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,
    officeForm: {
      code: '0000',
      openingHour: '',
      closingHour: '',
      isActive: true,
      isLocal: false
    },
    rules,
    states,
    timePicker: '',
    timePicker2: '',
    loader: false
  }),

  created () {
    if (this.editing) {
      this.officeForm = Object.assign({}, this.editing)
      if (this.officeForm.code < 1000) this.officeForm.code = `0${this.editing.code}`
    }
  },

  computed: {

    ...mapGetters(['formOptions']),

    regions () {
      const regions = this.officeForm.clientName
        ? this.collections.Client.find(client => client.clientName === this.officeForm.clientName).regions
        : []
      return regions
    },

    requiresMassiveUpdate () {
      if (!this.editing) return
      else return (
        this.editing.officeName !== this.officeForm.officeName
        || this.editing.officeState !== this.officeForm.officeState
        || this.editing.officeRegion !== this.officeForm.officeRegion
      )
    }

  },

  methods: {

    ...mapActions(['createDocument', 'updateDocument', 'updateDocuments', 'findDocuments']),
    ...mapMutations(['showSnackbar']),

    async preventDuplicity (form) {
      const { clientName, code } = form
      const _id = this.editing ? this.editing._id : null
      const filter = { clientName, code, _id: { "$ne": _id } }
      const res = await this.findDocuments({ collection: 'Office' , filter })
      if (res.length) return true, this.showSnackbar({ error: 'Código de la oficina registrado anteriormente' })
      else return false
    },

    async save (body) {
      this.loader = true
      const registeredBefore = await this.preventDuplicity(body)
      if (registeredBefore) return this.loader = false
      if (this.editing) this.update({ collection: 'Office', body })
      else this.create({ collection: 'Office', body })
    },

    create (document) {
      this.createDocument(document)
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    update (document) {
      this.updateDocument(document)
        .then(() => { if (this.requiresMassiveUpdate) this.updateDependencies(document)})
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    updateDependencies ({ body }) {
      const actions = []
      const query = { clientName: this.editing.clientName, officeName: this.editing.officeName }
      const update = { officeName: body.officeName, officeRegion: body.region, officeState: body.officeState }
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
          query,
          update: {
            $set: {
              officeName: update.officeName,
              officeRegion: update.officeRegion,
              officeState: update.officeState,
              "inventory.$[product].officeName": update.officeName,
              "inventory.$[product].officeRegion": update.officeRegion,
              "inventory.$[product].officeState": update.officeState
            }
          },
          options: { arrayFilters: [ { "product.clientName": query.clientName, "product.officeName": query.officeName } ] }
        },
        { collection: 'Inventory', query, update, options: {} },
        { collection: 'Request', query, update, options: {} },
        { collection: 'Dispatch', query, update, options: {} },
      ]
    }
  }
}
</script>
