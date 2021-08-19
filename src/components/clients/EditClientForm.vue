<template>
  <v-container>
    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información del cliente"
      @hideInterface="$emit('hideInterface')"
    />
    <v-stepper v-model="activeStep" vertical>
      <v-stepper-step editable :complete="step1Completed" step="1">
        Información general
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-form ref="step1Completed" v-model="step1Completed">
          <v-row>
            <v-col :cols="mobile ? '12' : '6'">
              <v-text-field
                v-model="client.clientName"
                label="Nombre del cliente"
                :rules="rules.required"
              />
            </v-col>
          </v-row>
          Regiones
          <v-tooltip color="accent" right>
            <template v-slot:activator="{ on }">
              <v-icon
                class="ml-2 mb-1"
                color="accent"
                v-on="on"
              >
                mdi-information-outline
              </v-icon>
            </template>
            Distribución geográfica de oficinas
          </v-tooltip>
          <v-row align="center">
            <v-col>
              <v-text-field v-model="region" label="Región" />
            </v-col>
            <v-col>
              <v-btn
                @click="addItem('client', 'region', region)"
                color="accent" small text
                :disabled="!region"
              >
                Agregar
              </v-btn>
            </v-col>
          </v-row>
          <v-chip-group>
            <v-chip
              v-for="region, index in client.regions" :key="index"
              @click:close="removeProperty('regions', index)"
              close
              disabled
            >
              {{ region }}
            </v-chip>
          </v-chip-group>
        </v-form>
        <v-btn
          @click="activeStep++"
          color="primary"
          :disabled="!step1Completed"
          text
          block
        >
          Continuar
        </v-btn>
      </v-stepper-content>

      <v-stepper-step
        step="2"
        :editable="step1Completed"
        :complete="contactForm"
      >
        Contactos
      </v-stepper-step>
      <v-stepper-content step="2">
        <v-card class="pa-2" outlined flat>
          <v-form ref="contactForm" v-model="contactForm">
            <v-row>
              <v-col :cols="mobile ? 12 : 4">
                <v-text-field
                  v-model="contact.fullName"
                  label="Nombre y apellido"
                  :rules="rules.required"
                />
              </v-col>
              <v-col :cols="mobile ? 12 : 5">
                <v-text-field
                  v-model="contact.position"
                  label="Cargo"
                />
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col :cols="mobile ? 12 : 4">
                <v-text-field
                  v-model="contact.email"
                  label="Dirección de correo"
                  :rules="rules.emailRules"
                />
              </v-col>
              <v-col align="center" :cols="mobile ? 6 : 5">
                <v-switch v-model="contact.includeForAccessEmail" label="Accesos" />
              </v-col>
              <v-col align="center" :cols="mobile ? 6 : 3">
                <v-tooltip color="accent" top>
                  <template v-slot:activator="{ on }">
                    <v-icon
                      class="ml-2 mb-1"
                      color="accent"
                      v-on="on"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                  Incluir en solicitudes de acceso
                </v-tooltip>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col :cols="mobile ? 8 : 3">
                <v-text-field
                  v-model="phoneNumber"
                  :rules="phoneNumber ? rules.phoneRules : []"
                  label="Teléfono"
                  maxlength="11"
                />
              </v-col>
              <v-col>
                <v-btn
                  @click="addItem('contact', 'phoneNumber', phoneNumber)"
                  :disabled="!contactForm || !phoneNumber"
                  small
                  icon
                  color="accent"
                >
                  <v-icon>mdi-phone-plus</v-icon>
                </v-btn>
              </v-col>
              <v-col>
                <v-chip-group>
                  <v-chip
                    v-for="phone, index in contact.phoneNumbers" :key="index"
                    @click:close="removeProperty('phoneNumbers', index)"
                    close
                  >
                    {{ phone }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>
            <v-btn
              @click="addItem('client', 'contact', contact)"
              :disabled="!contactForm"
              block small
              outlined color="accent"
            >
              <v-icon>mdi-account-plus</v-icon>
            </v-btn>
          </v-form>
        </v-card>
        <v-row>
          <v-col>
            <v-chip-group>
              <v-chip
                v-for="contact, i in client.contacts" :key="i"
                close
                @click="editContact(contact)"
                @click:close="removeProperty('contacts', i)"
              >
                {{ contact.fullName }}
              </v-chip>
          </v-chip-group>
          </v-col>
        </v-row>
        <v-btn
          class="mt-2" @click="save(client)"
          color="success"
          block
          :loading="loader"
        >
          Guardar cambios
        </v-btn>
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

  name: 'EditClientForm',
  components: { Header },
  props: ['mobile', 'editing'],

  created () { if (this.editing) this.client = JSON.parse(JSON.stringify(this.editing)) },

  data: () => ({
    // Form data
    client: {
      clientName: '',
      regions: [],
      contacts: [],
      contracts: [],
    },
    contact: {
      email: '',
      fullName: '',
      phoneNumbers: [],
      position: '',
      includeForAccessEmail: false
    },
    region: '',
    phoneNumber: '',
    rules,

    // Vuetify components
    activeStep: 1,
    step1Completed: false,
    contactForm: false,
    datePicker: false,
    loader: false
  }),

  computed: {
    ...mapState(['collections'])
  },

  methods: {

    ...mapActions(['updateDocuments', 'updateDocument', 'findDocuments']),
    ...mapMutations(['showSnackbar']),

    addItem (data, type, item) {
      this[data][`${type}s`].push(item)
      this[type] = ''
      if (type === 'contact') {
        this.contact = {
          email: '',
          fullName: '',
          phoneNumbers: [],
          position: '',
          includeForAccessEmail: false
        }
        this.$refs[`${type}Form`].resetValidation()
      }
    },

    editContact (contact) {
      this.contact = Object.assign({}, contact)
    },

    removeProperty (prop, index) {
      if (prop === 'phoneNumbers') this.contact.phoneNumbers.splice(index, 1)
      else this.client[prop].splice(index, 1)
    },

    async preventDuplicity ({ clientName, _id }) {
      const filter = { clientName, _id: { "$ne": _id } }
      const res = await this.findDocuments({ collection: 'Client', filter })
      return { throwsMatch: res.length }
    },

    async save (body) {
      this.loader = true
      const registeredBefore = await this.preventDuplicity(body)
      if (registeredBefore.throwsMatch) return (this.showSnackbar({ error: 'El nombre se ha registrado antes' }), this.loader = false)
      this.update({ collection: 'Client', body })
    },

    update (document) {
      document.body._id = this.editing._id
      this.updateDocument(document)
        .then(() => { if (this.editing.clientName !== document.body.clientName) this.updateDependencies(document) })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    updateDependencies ({ body }) {
      const actions = []
      const query = { clientName: this.editing.clientName }
      const update = { clientName: body.clientName }
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
              clientName: update.clientName,
              "inventory.$[product].clientName": update.clientName
            }
          },
          options: { arrayFilters: [ { "product.clientName": query.clientName } ] }
        },
        { collection: 'Inventory', query, update, options: {} },
        { collection: 'Office', query, update },
        { collection: 'Request', query, update, options: {} },
        { collection: 'Dispatch', query, update, options: {} },
      ]
    }

  }
})
</script>
