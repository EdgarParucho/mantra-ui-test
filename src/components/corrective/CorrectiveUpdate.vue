<template>
  <v-container>

    <Header
      closable="1"
      :title="`Servicio ${selectedDocument.reportCode}`"
      :subtitle="`Serial ${selectedDocument.serialCode}, Oficina ${selectedDocument.officeName}`"
      @hideInterface="$emit('hideInterface')"
    />

    <v-stepper v-model="activeStep" vertical>

      <v-stepper-step step="1" editable :complete="step1Completed">
        Observaciones
      </v-stepper-step>

      <v-stepper-content step="1">

        <v-form ref="step1Completed" v-model="step1Completed">
          <v-row>
            <v-col cols="6">
              <v-radio-group class="ml-2" v-model="documentation.visit" row>
                <v-radio
                  v-for="(n, i) in ['Visita', 'Seguimiento']"
                  :key="i"
                  :label="n"
                  :value="n === 'Visita'"
                />
              </v-radio-group>
            </v-col>
            <v-col :cols="mobile ? 7 : 3">
              <v-text-field
                v-model="documentation.serviceOrder.number"
                :rules="this.documentation.visit || this.documentation.serviceOrder.number
                  ? rules.serviceOrder
                  : []"
                :maxlength="6"
                :hint="documentation.visit ? 'Requerido' : 'Opcional'"
                persistent-hint
                label="#Orden"
              />
            </v-col>
          </v-row>
          <v-textarea
            class="mt-1"
            v-model="documentation.observations"
            :rules="rules.required"
            :maxlength="400"
            outlined counter
            label="Observaciones"
          />
          <v-row>
            <v-col :cols="mobile ? 12 : 6">
              <v-autocomplete
                v-model="documentation.status"
                :items="statusOptions"
                :rules="rules.required"
                solo
                label="Status"
              />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-text-field
                v-if="documentation.status === 'Cerrado - Reemplazado'"
                v-model="documentation.newSerial"
                :rules="rules.required"
                label="#Serial (Equipo instalado)"
              />
            </v-col>
          </v-row>
        </v-form>
        <v-row class="pa-2">
          <v-col>
            <v-btn
              @click="activeStep++"
              color="primary"
              text block
              :disabled="!step1Completed"
            >
              Continuar
            </v-btn>
          </v-col>
        </v-row>
      </v-stepper-content>

      <v-stepper-step
        step="2"
        :editable="step1Completed"
        :complete="step2Completed"
      >
        Solicite el envío de piezas
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-form ref="step2Completed" v-model="step2Completed">
          <v-chip-group
            v-for="(suggestionKey, indx) in suggestions"
            :key="`${suggestionKey} (${indx})`"
            row
          >
            <v-chip
              v-for="(suggestionValue, keyValue) in suggestionKey.value"
              :key="keyValue"
              @click="acceptSuggestion(suggestionValue)"
              small
            >
              {{ suggestionValue }}
            </v-chip>
          </v-chip-group>
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="selectedPieces"
                :items="piecesNames"
                :disabled="!piecesNames.length"
                :menu-props="{ nudgeRight: 150 }"
                label="Piezas requeridas"
                :error-messages="requiresAssignement"
                hide-no-data
                multiple deletable-chips small-chips
                prepend-inner-icon="mdi-clipboard-list-outline"
              />
            </v-col>
          </v-row>
          <v-row v-for="(request, index) in assembledRequests" :key="index">
            <v-col :cols="mobile ? 9 : 10">
              <v-select
                v-model="replacementCauses[index]"
                :items="replacementOptions"
                :rules="rules.required"
                :hint="`Causa de reemplazo: ${request.pieceName}`"
                prepend-inner-icon="mdi-account-question-outline"
                label="Causa del reemplazo"
                persistent-hint
                solo
              />
            </v-col>
            <v-col :cols="mobile ? 3 : 2">
              <v-text-field
                v-model="request.quantity"
                type="number"
                value="1"
                min="1"
                solo
              />
            </v-col>
          </v-row>
          <v-row class="pa-2">
            <v-col>
              <v-btn
                v-if="documentation.visit"
                :disabled="!step1Completed || !step2Completed"
                color="primary" text block
                @click="activeStep++"
              >
                Continuar
              </v-btn>
              <v-btn
                v-else  
                :disabled="!step1Completed || !step2Completed"
                :loading="loader"
                color="primary"
                text
                block
                @click="save"
              >
                Actualizar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-stepper-content>

      <v-stepper-step
        v-if="documentation.visit"
        step="3"
        :editable="step2Completed"
        :complete="step3Completed"
      >
        Indique los datos de la visita
      </v-stepper-step>

      <v-stepper-content v-if="documentation.visit" step="3">
        <v-form ref="step3Completed" v-model="step3Completed">
          <v-row align="center">

            <v-col :cols="mobile ? 6 : 4">
              <DateMenu @setDate="(date) => dateSubmitted = date" />
            </v-col>
            <v-col :cols="mobile ? 6 : 4">
              <TimeMenu @setTime="(time) => timeSubmitted = time" />
            </v-col>
            <v-col :cols="mobile ? 12 : 4">
              <v-text-field
                v-model="friendlyDate"
                :rules="rules.required"
                :error-messages="itIsWeekend(dateSubmitted) ? 'Seleccione un día de la semana' : ''"
                readonly
                label="Fecha de visita"
              />
              <v-text-field v-model="timeSubmitted" :rules="rules.required" v-show="false" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="documentation.technician"
                :items="formOptions.technicians"
                hint="Requerido"
                :rules="rules.required"
                label="Personal asignado"
                persistent-hint solo
              />
            </v-col>
          </v-row>
          <v-row class="pa-2">
            <v-col>
              <v-btn
                color="success" @click="save"
                :disabled="!step1Completed || !step2Completed || !step3Completed || !documentation.technician._id"
                :loading="loader"
                block
              >
                Actualizar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>          
      </v-stepper-content>

    </v-stepper>
  </v-container>
</template>

<script>

import email from '../../helpers/emails/email'
import Vue from 'vue'
import { mapState, mapActions, mapGetters } from 'vuex'
import moment from 'moment-timezone'
import DateMenu from '@/components/generals/DateMenu'
import TimeMenu from '@/components/generals/TimeMenu'
import Header from '@/components/generals/Header'
import { rules, statusOptions, replacementOptions } from '@/helpers/form'

moment.locale('es')

export default Vue.extend({

  name: 'CorrectiveUpdate',
  components: { Header, DateMenu, TimeMenu },
  props: ['mobile', 'selectedDocument'],
  
  data: () => ({
    // Helpers
    replacementOptions,
    statusOptions,
    rules,

    // Vuetify components
    activeStep: 1,
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,

    // Form data
    documentation: {
      author: '',
      date: '',
      observations: '',
      newSerial: '',
      serviceOrder: { number: '', validated: false },
      status: '',
      technician: {
        fullName: '',
        id: ''
      },
      type: 'Actualizado',
      updatedAt: moment(Date.now()).format(),
      visit: true
    },
    replacementCauses: [],
    selectedPieces: [],
    pieces: [],
    dateSubmitted: new Date().toISOString().substr(0, 10),
    timeSubmitted: '',
    loader: false,
    friendlyDate: '',

    suggestions: [ { key: 'pieceNames', value: [] } ]
  }),

  created () {
    this.documentation.technician = this.selectedDocument.schedule.technician
  },

  computed: {

    ...mapState(['collections']),
    ...mapGetters(['formOptions']),

    piecesNames () {
      const findPieces = piece => piece.asociatedProducts.includes(this.selectedDocument.productName)
      let productPieces = this.collections.Piece.filter(piece => piece.asociatedProducts.length)
      productPieces = this.collections.Piece.filter(findPieces)
      const piecesNames = productPieces.map(piece => piece.pieceName).sort()
      return piecesNames
    },

    requiresAssignement () {
      const hasRequests = this.selectedPieces.length
      const itsAssigned = this.documentation.technician._id
      const itsAVisit = this.documentation.visit
      if (!hasRequests) return ''
      else if (itsAVisit) return ''
      else if (hasRequests && !itsAssigned && !itsAVisit) return 'Asigne un responsable para realizar solicitudes'
      else return ''
    },

    assembledRequests () {
      const requests = []
      for (const n in this.selectedPieces) {
        const {
          clientName,
          officeName,
          productName,
          productType,
          reportCode,
          serialCode
        } = this.selectedDocument
        requests[n] = {
          clientName, officeName, productName, productType, reportCode, serialCode,
          pieceName: this.selectedPieces[n],
          replacementCause: 'Indefinida',
          requestDate: moment(Date.now()).format(),
          requestedBy: this.formOptions.user,
          requestStatus: 'Enviada a Almacén',
          technician: this.documentation.technician,
          quantity: 1 // quantity is not saved on MongoDB but required to create multiple requests on same piece
        }
      }
      return requests
    },

    emailNotification () {
      return this.collections.Email.find(email => email.subject === 'Solicitud de piezas')
    }

  },

  methods: {

    ...mapActions(['createDocument', 'updateDocument', 'deleteDocument', 'sendEmail']),

    itIsWeekend (date) {
      const submittedDay = moment(date).format('dddd')
      return submittedDay === 'sábado' || submittedDay === 'domingo'
    },

    acceptSuggestion (suggestion) {
      this.selectedPieces.push(suggestion)
    },

    findSuggestions (submittedValue, requiredKey, searchIn) {
      if (!submittedValue) return
      if (submittedValue.length < 3) return

      let keyWords = submittedValue.split(' ')
      keyWords = keyWords.filter(a => a.length > 3)
      let setIn = this.suggestions.find(item => item.key === requiredKey)
      for (const option of searchIn) {
        for (const keyWord of keyWords) {
          const match = option.toLowerCase().match(keyWord.toLowerCase())
          const repeated = setIn.value.find(item => item === option)
          if (match && !repeated) setIn.value.push(option)
        }
      }
    },

    save () {
      this.loader = true
      if (this.assembledRequests.length) this.requestPieces()
      const body = this.consolidateBody()
      if (this.documentation.status.includes('Cerrado')) this.closeService(body)
      else this.update(body)
    },

    closeService (body) {
      this.createDocument({ collection: 'Closed', body })
        .then(() => this.deleteDocument({ collection: 'Active', body }))
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    update (body) {
      this.updateDocument({ collection: 'Active', body })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    consolidateBody () {
      let body = Object.assign({}, this.selectedDocument)
      
      this.documentation.date = moment(`${this.dateSubmitted} ${this.timeSubmitted}`)
        .format('YYYY-MM-DD[T]HH:mm[:00.000+00:00]')
      const minutesToExpire = moment(this.selectedDocument.expireDate).diff(new Date(), 'minutes')
      const expired = minutesToExpire < 0

      body.documentation.push(this.documentation)
      body.status = this.documentation.status
      body.expired = expired
      if (this.documentation.visit) body.schedule.technician = this.documentation.technician
      if (this.documentation.visit) body.schedule.scheduledDate = this.documentation.date

      if (this.assembledRequests.length) {
        for (const piece of this.assembledRequests) body.pieces.push({ pieceName: piece.pieceName, quantity: piece.quantity })
      }
      this.documentation.author = this.formOptions.user
      return body
    },

    requestPieces () {
      const actions = []
      const emails = []
      for (const body of this.assembledRequests) {
        let counter = 0
        do {
          counter++
          actions.push(this.createDocument({ collection: 'Request', body }))
        } while (counter < body.quantity)
        if (!this.emailNotification.enabled) return
        const addressee = this.collections.User.find(user => user._id === body.technician._id)
        emails.push(
          email({ email: this.emailNotification, data: body, author: this.formOptions.user.fullName, addressee })
        )
      }
      this.sendEmail(emails)
    }
  },

  watch: {
    activeStep: function () {
      if (this.activeStep === 2) {
        this.findSuggestions(this.documentation.observations, 'pieceNames', this.piecesNames)
      }
    },
    timeSubmitted: function () {
      this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM,')} ${this.timeSubmitted}`
    },
    dateSubmitted: function () {
      this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM,')} ${this.timeSubmitted}`
    }
  }
})
</script>
