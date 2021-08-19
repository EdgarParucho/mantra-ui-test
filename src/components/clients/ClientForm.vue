<template>
  <v-container>
    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información del cliente"
      @hideInterface="$emit('hideInterface')"
    />
    <v-stepper v-model="activeStep" vertical>
      <v-stepper-step editable :complete="activeStep > 1" step="1">
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
                :maxlength="50"
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
        :editable="contactForm"
        :complete="activeStep > 2"
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
                  small icon color="accent" :disabled="!contactForm || !phoneNumber"
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
          class="mb-1"
          color="primary"
          text
          block
          @click="activeStep++"
        >
          Continuar
        </v-btn>
      </v-stepper-content>
      <v-stepper-step
        :complete="activeStep > 3"
        step="2"
        :editable="step2Completed"
      >
        Contrato activo o más reciente
      </v-stepper-step>

      <v-stepper-content step="3">
        <v-form ref="step2Completed" v-model="step2Completed">
          <v-row>
            <v-col>
              <v-radio-group row v-model="contract.active">
                <v-radio
                  class="ml-3"
                  v-for="(inactive, i) in [true, false]"
                  :key="i"
                  :label="inactive ? 'Activo' : 'Inactivo'"
                  :value="inactive"
                />
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
                  Status de contrato (Información referencial)
                </v-tooltip>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-text-field
                v-model="contract.startingDate"
                label="Inicio de contrato"
                hint="Valor referencial"
                :rules="rules.required"
                readonly
              />
            </v-col>
            <v-col>
              <v-menu
                ref="datemenu"
                v-model="datePicker"
                :close-on-content-click="false"
                :return-value.sync="contract.startingDate"
                transition="scale-transition"
                nudge-left="150"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrss }">
                  <v-btn
                    v-bind="attrss"
                    v-on="on"
                    small
                  >
                    <v-icon>mdi-calendar</v-icon>
                  </v-btn>
                </template>
                <v-date-picker
                  v-model="contract.startingDate"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    @click="datePicker = false"
                  >
                    Cancelar
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.datemenu.save(contract.startingDate)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-card-subtitle>
              Tiempos de solución acordados
            </v-card-subtitle>
            <v-col :cols="mobile ? 6 : 2">
              <v-select
                v-model="contract.sla.local"
                label="Local"
                :items="[8, 16, 24, 48]"
                :rules="rules.required"
              />
            </v-col>
            <v-col :cols="mobile ? 6 : 2">
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
            color="primary"
            text
            block
            @click="activeStep++"
            :disabled="!step2Completed"
          >
            Continuar
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step
        step="4"
        :editable="step3Completed"
      >
        Productos contratados
      </v-stepper-step>
      <v-stepper-content step="4">
        <v-form ref="step3Completed" v-model="step3Completed">
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
            @click="createClient(client)"
            class="mt-2"
            color="success"
            block
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

import Vue from 'vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import { rules } from '@/helpers/form.js'
import moment from 'moment-timezone'
import Header from '@/components/generals/Header'

moment.locale('es')

export default Vue.extend({

  name: 'ClientForm',
  components: { Header },
  props: ['mobile'],

  data: () => ({
    // Form data
    client: { clientName: '', regions: [], contacts: [], contracts: [] },
    contract: {
      active: true,
      sla: { local: 0, foreign: 0 },
      products: [],
      startingDate: '',
      finishDate: ''
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

    // Vuetify components
    rules,
    activeStep: 1,
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,
    contactForm: false,
    datePicker: false,
    tableFilter: '',
    headers: [
      { text: 'Tipo', value: 'productType' },
      { text: 'Marca', value: 'brand' },
      { text: 'Modelo', value: 'model' }
    ],
    loader: false
  }),

  computed: { ...mapState(['collections']) },

  methods: {

    ...mapActions(['createDocument', 'findDocuments']),
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

    async preventDuplicity (clientName) {
      const filter = { clientName }
      const res = await this.findDocuments({ collection: 'Client', filter })
      return { throwsMatch: res.length }
    },

    async createClient (client) {
      this.loader = true
      client.contracts.push(this.contract)

      const searchByName = await this.preventDuplicity(client.clientName)
      if (searchByName.throwsMatch) return (this.showSnackbar({ error: 'El nombre se ha registrado antes' }), this.loader = false)

      this.createDocument({ collection: 'Client', body: client })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    }
  }
})
</script>
