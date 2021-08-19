<template>
  <v-container>

    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información de usuario"
      @hideInterface="$emit('hideInterface')"
    />

    <v-stepper v-model="step" vertical>
      <v-stepper-step editable :complete="step > 1" step="1">
        Datos personales
      </v-stepper-step>

      <v-stepper-content step="1">
        <v-form ref="step1Form" v-model="step1Form">
          <v-row justify="center">
            <v-col :cols="mobile ? 12 : 6">
              <v-text-field
                v-model="userForm.firstName"
                maxlength="20"
                counter="20"
                label="Primer nombre"
                :rules="rules.noSpaces"
              />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-text-field
                v-model="userForm.lastName"
                maxlength="20"
                counter="20"
                label="Primer apellido"
                :rules="rules.required"
              />
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col :cols="mobile ? 12 : 6">
              <v-text-field
                v-model="userForm.idDocument"
                label="Documento de identidad"
                :rules="rules.idRules"
                :maxlength="8"
              />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-menu
                v-model="menu2"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="userForm.birthday"
                    label="F. Nacimiento"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>
                <v-date-picker v-model="userForm.birthday" @input="menu2 = false" />
              </v-menu>
            </v-col>
          </v-row>
        </v-form>
        <v-btn
          @click="step++"
          color="primary"
          :disabled="!step1Form"
          text
          block
        >
          Continuar
        </v-btn>
      </v-stepper-content>
      <v-stepper-step editable :complete="step2Form" step="2">
        Información corporativa
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-form ref="step2Form" v-model="step2Form">
          <v-row justify="center">
            <v-col :cols="mobile ? 12 : 6">
              <v-select
                v-model="userForm.department"
                :items="departments"
                label="Departamento"
                :rules="rules.required"
              />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-text-field
                v-model="userForm.companyPosition"
                label="Cargo"
                :rules="rules.required"
              />
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col :cols="mobile ? 12 : 6">
              <v-select v-model="userForm.userRole" label="Rol" :items="roles"
            />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-text-field
                v-model="userForm.email"
                maxlength="50"
                counter="50"
                label="E-mail"
                :rules="rules.corpEmail"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-switch v-model="userForm.assignable" label="Asignable a servicios" />
            </v-col>
          </v-row>
        </v-form>
        <v-btn
          @click="step++"
          color="primary"
          :disabled="!step2Form"
          text
          block
        >
          Continuar
        </v-btn>
      </v-stepper-content>
      <v-stepper-step editable :complete="step3Form" step="3">
        Contraseña
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-form ref="step3Form" v-model="step3Form">
          <v-switch v-if="editing" v-model="updatePassword" label="Modificar contraseña" />
          <v-row v-if="!editing || updatePassword" justify="center">
            <v-col>
              <v-text-field
                v-model="userForm.userPassword"
                type="password"
                maxlength="8" counter="8"
                label="Contraseña"
                :rules="rules.passwordRules"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="confirmPassword"
                type="password"
                :rules="rules.passwordRules"
                maxlength="8" counter="8"
                label="Confirmar"
                :error="!passwordComparison.match"
                :error-messages="confirmPassword ? passwordComparison.message : ''"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-switch v-model="userForm.allowLogin" label="Permitir acceso" />
            </v-col>
          </v-row>
          <v-btn
            @click="save(userForm)"
            class="mt-2"
            :disabled="!step1Form || !step2Form || !step3Form"
            :loading="loader"
            color="success"
            block
          >
            Registrar
          </v-btn>

        </v-form>
      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script>

import { mapMutations, mapActions } from 'vuex'
import Header from '@/components/generals/Header'
import { rules, departments, roles } from '@/helpers/form'
export default {

  name: 'SignForm',
  components: { Header },
  props: ['mobile', 'editing'],

  data: () => ({
    step: 1,
    userForm: {
      assignable: false,
      allowLogin: false
    },
    menu2: false,
    loader: false,
    step1Form: false,
    step2Form: false,
    step3Form: false,
    confirmPassword: '',
    updatePassword: false,

    // Data imported from helpers/form.js
    rules,
    departments,
    roles
  }),

  created () {
    if (this.editing) this.userForm = Object.assign({}, this.editing)
  },

  computed: {

    passwordComparison () {
      let match = this.confirmPassword === this.userForm.userPassword
      match = this.userForm.userPassword ? match : true
      const message = match ? '' : 'No coinciden'
      return { match, message }
    },

    requiresMassiveUpdate () {
      if (!this.editing) return
      else return (
        this.userForm.firstName !== this.editing.firstName
        || this.userForm.lastName !== this.editing.lastName
      )
    }
 
  },

  methods: {

    ...mapActions(['createDocument', 'updateDocument', 'updateDocuments','findDocuments']), 
    ...mapMutations(['showSnackbar']),

    preventDuplicity (idDocument) {
      return new Promise ((resolve, reject) => {
        const _id = this.editing ? this.editing._id : null

        const filter = {
          idDocument,
          _id: { "$ne": _id }
        }
        this.findDocuments({ collection: 'User', filter })
          .then((res) => {
            if (res.length) {
              this.showSnackbar({ message: 'Documento de identidad registrado anteriormente' })
              this.loader = false
              resolve(false)
            } else {
              resolve(true)
            }
        })
        .catch(() => reject(false))
      })
    },

    async save (body) {
      this.loader = true
      const idAvalaible = await this.preventDuplicity(body.idDocument)
      if (!idAvalaible) return

      if (this.editing) this.update({ collection: 'User', body })
      else this.create({ collection: 'User', body })
    },

    create (document) {
      this.createDocument(document)
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    update (document) {
      this.updateDocument(document)
        .then(() => { if (this.requiresMassiveUpdate) this.updateDependencies(document) })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    updateDependencies ({ body }) {
      const actions = []
      const query = { _id: body._id }
      const update = { fullName: `${body.firstName} ${body.lastName}` }
      const collections = this.dependencies(query, update)
      for (const collection of collections) actions.push(this.updateDocuments(collection))
      Promise.all(actions)
    },

    dependencies (query, update) {
      return [
        {
          collection: 'Active',
          query: { "schedule.technician._id": query._id },
          update: { $set: { "schedule.technician.fullName": update.fullName } },
          options: {}
        },
        {
          collection: 'Active',
          query: { $or: [
            { "documentation.author._id": query._id },
            { "documentation.technician._id": query._id }
          ] },
          update: {
            $set: {
              "documentation.$[specificAuthor].author.fullName": update.fullName,
              "documentation.$[specificTechnician].technician.fullName": update.fullName
            }
          },
          options: {
            arrayFilters: [
              { "specificAuthor.author._id": query._id },
              { "specificTechnician.technician._id": query._id }
            ]
          }
        },
        {
          collection: 'Closed',
          query: { $or: [
            { "documentation.author._id": query._id },
            { "documentation.technician._id": query._id }
          ] },
          update: {
            $set: {
              "documentation.$[specificAuthor].author.fullName": update.fullName,
              "documentation.$[specificTechnician].technician.fullName": update.fullName
            }
          },
          options: {
            arrayFilters: [
              { "specificAuthor.author._id": query._id },
              { "specificTechnician.technician._id": query._id }
            ]
          }
        },
        {
          collection: 'Maintenance',
          query: { "schedule.technician._id": query._id },
          update: { $set: { "schedule.technician.fullName": update.fullName } },
          options: {}
        },
        {
          collection: 'Maintenance',
          query: { "inventory.technician._id": query._id },
          update: {
            $set: { "inventory.$[specific].technician.fullName": update.fullName }
          },
          options: { arrayFilters: [{ "specific.technician._id": query._id }] }
        },
        {
          collection: 'Inventory',
          query: { "technician._id": query._id },
          update: { $set: { "technician.fullName": update.fullName } },
          options: {}
        },
        {
          collection: 'Request',
          query: { "technician._id": query._id },
          update: { $set: { "technician.fullName": update.fullName } },
          options: {}
        },
        {
          collection: 'Request',
          query: { "requestedBy._id": query._id },
          update: { $set: { "requestedBy.fullName": update.fullName } },
          options: {}
        },
        {
          collection: 'Dispatch',
          query: { "requestedBy._id": query._id },
          update: { $set: { "requestedBy.fullName": update.fullName } },
          options: {}
        },
        {
          collection: 'Dispatch',
          query: { "technician._id": query._id },
          update: { $set: { "technician.fullName": update.fullName } },
          options: {}
        }
      ]
    }

  }
}
</script>