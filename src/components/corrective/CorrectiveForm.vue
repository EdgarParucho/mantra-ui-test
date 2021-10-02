<template>
  <v-container>
    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información del servicio"
      @hideInterface="$emit('hideInterface')"
    />
    <v-stepper v-model="activeStep" vertical>
      <v-stepper-step step="1" editable :complete="step1Completed">
        Origen del servicio
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-form @submit.prevent v-model="step1Completed" ref="step1Completed">
          <v-switch class="ml-4" v-model="serviceForm.itsSpecial" label="Servicio especial" />
          <v-row>
            <v-col :cols="mobile? 12 : 6">
              <v-switch class="ml-4" v-model="requiresCorrelate" label="Sin código" />
            </v-col>
            <v-col :cols="mobile? 12 : 6">
              <v-text-field
                v-model="serviceForm.reportCode"
                label="Código"
                :rules="requiresCorrelate ? [] : rules.noSpaces"
                :disabled="requiresCorrelate"
                :maxlength="20"
              />
            </v-col>
          </v-row>
          <v-btn
            class="mb-3"
            @click="activeStep++"
            :disabled="!step1Completed"
            color="primary"
            text block
          >
            Continuar
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step step="2" :editable="step1Completed" :complete="step2Completed">
        Información específica
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-form v-model="step2Completed" ref="step2Completed">
          <v-row>
            <v-col :cols="mobile ? 12 : 6">
              <v-switch class="ml-4" v-model="serialNotSubmitted" label="Sin serial" />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-text-field
                v-model="serviceForm.serialCode"
                :readonly="serialNotSubmitted"
                :rules="rules.required"
                :maxlength="30"
                label="#Serial"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="serviceForm.description"
                :rules="rules.required"
                :maxlength="150"
                label="Descripción"
                outlined
                counter
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="mobile ? 6 : 3">
              <DateMenu @setDate="(date) => dateSubmitted = date" />
            </v-col>
            <v-col :cols="mobile ? 6 : 3">
              <TimeMenu @setTime="(time) => timeSubmitted = time" />
            </v-col>
            <v-col :cols="mobile ? 12 : 6">
              <v-text-field
                v-model="friendlyDate"
                :error-messages="itIsWeekend(dateSubmitted)
                  ? 'Seleccione un día de la semana'
                  : ''
                "
                :rules="rules.required"
                label="Fecha de reporte"
                readonly
              />
              <v-text-field
                v-model="timeSubmitted"
                v-show="false"
                :rules="rules.required"
              />
            </v-col>
          </v-row>
          <v-btn
            class="mb-3"
            @click="activeStep++"
            :disabled="!step2Completed"
            color="primary"
            text block
          >
            Continuar
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step step="3" :editable="step2Completed">
        Información general
      </v-stepper-step>

      <v-stepper-content step="3">

        <v-chip-group multiple row>
          <span v-for="suggestion, index of suggestions" :key="index">
            <v-chip
              @click="acceptSuggestion(suggestion)"
              v-if="suggestion.value"
              :color="suggestion.value === serviceForm[suggestion.key]
                ? 'accent'
                : 'light'"
              :disabled="!formListings[suggestion.key].find(item => item === suggestion.value)"
              small
            >
              {{ suggestion.value }}
            </v-chip>
          </span>
        </v-chip-group>

        <v-form ref="step3Completed" v-model="step3Completed">
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="serviceForm.clientName"
                :items="formListings.clientName"
                :rules="rules.required"
                label="Cliente"
                @change.passive="serviceForm.productName = ''"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="serviceForm.officeName"
                :items="formListings.officeName"
                :disabled="!serviceForm.clientName"
                :rules="rules.required"
                label="Oficina"
              />
            </v-col>
          </v-row>
          <v-row align="center" justify="space-between">
            <v-col>
              <v-autocomplete
                v-model="serviceForm.productName"
                :items="formListings.productName"
                :disabled="!serviceForm.clientName"
                :rules="rules.required"
                label="Producto"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="serviceForm.category"
                :items="formListings.category"
                :disabled="!serviceForm.productName"
                :rules="rules.required"
                label="Categoria"
              />
            </v-col>
          </v-row>
          <v-btn
            class="mb-3"
            @click="save(serviceForm)"
            :disabled="!step1Completed || !step2Completed || !step3Completed"
            :loading="loader"
            color="primary"
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

import Vue from 'vue'
import axios from 'axios'
import moment from 'moment-timezone'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import { rules } from '@/helpers/form.js'
import Header from '@/components/generals/Header'
import DateMenu from '@/components/generals/DateMenu'
import TimeMenu from '@/components/generals/TimeMenu'

moment.locale('es')

export default Vue.extend({

  name: 'CorrectiveForm',
  components: { Header, DateMenu, TimeMenu },
  props: ['collections', 'mobile', 'editing'],

  data: () => ({
    // Form data
    serviceForm: {
      clientName: '',
      productName: '',
      officeName: '',
      category: '',
      reportCode: '',
      description: '',
      itsSpecial: false
    },
    rules,
    friendlyDate: '',
    timeSubmitted: '',
    requiresCorrelate: false,
    serialNotSubmitted: false,
    dateSubmitted: new Date().toISOString().substr(0, 10),

    // Vuetify components
    activeStep: 1,
    datePicker: false,
    timePicker: false,
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,

    // Autocomplete
    suggestions: [
      { key: 'clientName', value: '' },
      { key: 'officeName', value: '' },
      { key: 'productName', value: '' },
      { key: 'category', value: '' }
    ],
    loader: false

  }),

  created () {
    if (this.editing) {
      this.serviceForm = Object.assign({}, this.editing)
      this.serialNotSubmitted = this.serviceForm.serialCode === 'SIN SERIAL'
      this.dateSubmitted = moment(this.editing.reportedAt).parseZone('America/Caracas').format('YYYY-MM-D')
      this.timeSubmitted = moment(this.editing.reportedAt).parseZone('America/Caracas').format('HH:mm')
    }
  },

  computed: {

    ...mapGetters(['formOptions']),

    formListings () {
      // alias
      const _ = this.collections
      const form = this.serviceForm

      const clientName = form.itsSpecial
        ? this.formOptions.clientNames
        : this.formOptions.clientsWithContract.map(client => client.clientName)

      const officeName = form.clientName
        ? _.Office.filter(office => office.clientName === form.clientName).map(office => office.officeName)
        : []

      let productName = []

      if (form.itsSpecial) productName = _.Product.map(product => product.productName)
      else if (this.clientContract) productName = this.clientContract.products.map(product => product.productName)

      const category = form.productName
        ? _.Product.find(product => product.productName === form.productName).categories
        : this.formOptions.categories

      return { category, clientName, officeName, productName }
    },

    clientContract () {
      const client = this.collections.Client.find(client => client.clientName === this.serviceForm.clientName)
      return (client) ? client.contracts.find(contract => contract.active) : undefined
    },

    officeInfo () {
      return this.serviceForm.officeName
        ? this.collections.Office.find(office => office.officeName === this.serviceForm.officeName)
        : {}
    }

  },

  methods: {

    ...mapActions(['createDocument', 'updateDocument', 'findDocuments']),
    ...mapMutations(['showSnackbar']),

    itIsWeekend (date) {
      return moment(date).format('dddd') === 'sábado' || moment(date).format('dddd') === 'domingo'
    },

    findSuggestions (form) {
      this.findSuggestion(
        'reportCode',
        form.reportCode,
        'clientName',
        [...this.collections.Active, ...this.collections.Closed]
      )
      this.findSuggestion(
        'serialCode',
        form.serialCode,
        'productName',
        [...this.collections.Active, ...this.collections.Closed]
      )
      this.findFromLongString(form.description, 'category', this.formListings.category)
    },

    findOffice (serialCode) {
      let suggestedOffice = this.suggestions.find(item => item.key === 'officeName')

      const findOnServices = product => product.serialCode === serialCode
      const findOnInventory = office => office.inventory.find(product => product.serialCode === serialCode)

      const matchOnInventory = this.collections.Office.find(findOnInventory)
      if (matchOnInventory) return suggestedOffice.value = matchOnInventory.officeName

      const matchOnService = this.collections.Closed.find(findOnServices)
      if (matchOnService) return suggestedOffice.value = matchOnService.officeName

      else suggestedOffice.value = ''
    },

    findSpecificSerial (serialCode) {
      let suggestedProduct = this.suggestions.find(item => item.key === 'productName')

      const findOnServices = product => product.serialCode === serialCode
      const findOffice = office => office.inventory.find(product => product.serialCode === serialCode)

      const matchOnInventory = this.collections.Office.find(findOffice)
      if (matchOnInventory) {
        suggestedProduct.value = matchOnInventory.inventory.find(product => product.serialCode === serialCode).productName
        return
      }

      const matchOnService = this.collections.Closed.find(findOnServices)
      if (matchOnService) return suggestedProduct.value = matchOnService.productName
      else suggestedProduct.value = ''
    },

    findSuggestion (submittedKey, submittedValue, requiredKey, searchIn) {
      if (!submittedValue) return
      if (submittedValue.length < 3) return
      if (submittedKey === 'reportCode' && this.requiresCorrelate) return
      if (submittedKey === 'serialCode' && this.serialNotSubmitted) return
      let setIn = this.suggestions.find(item => item.key === requiredKey)

      const suggestion = searchIn.find(item => item[submittedKey].substr(0, 3) === submittedValue.substr(0, 3)) 

      if (suggestion) setIn.value = suggestion[requiredKey]
      else setIn.value = ''

      if (submittedKey === 'serialCode') this.findOffice(this.serviceForm.serialCode)
      const suggestedProduct = this.suggestions.find(item => item.key === 'productName').value
      if (submittedKey === 'serialCode' && suggestedProduct === '') this.findSpecificSerial(this.serviceForm.serialCode)
    },

    findFromLongString (submittedValue, requiredKey, searchIn) {
      if (!submittedValue) return
      if (submittedValue.length < 3) return

      let keyWords = submittedValue.split(' ')
      keyWords = keyWords.filter(a => a.length > 3)
      let setIn = this.suggestions.find(item => item.key === requiredKey)

      for (const option of searchIn) {
        for (const keyWord of keyWords) {
          const match = option.toLowerCase().match(keyWord.toLowerCase())
          if (match) return setIn.value = option
          else setIn.value = ''
        }
      }
      
    },

    acceptSuggestion (suggestion) {
      this.serviceForm[suggestion.key] = suggestion.value
    },

    getExpireDate () {
      const slaInfo = this.getSLAInfo()
      let expireDate

      while (expireDate === undefined) {
        if (slaInfo.openingDayMinutes >= slaInfo.hoursPerSLA * 60) {
          expireDate = moment(slaInfo.startingDate).add(slaInfo.hoursPerSLA, 'hour').format()
        } else {
          if (slaInfo.minutesCount <= 540) {
            expireDate = moment(slaInfo.nextDayworking).add(slaInfo.minutesCount, 'minutes').format()
          } else {
            slaInfo.minutesCount = slaInfo.minutesCount - 540
            slaInfo.nextDayworking = this.getNextDayworking(slaInfo.nextDayworking)
          }
        }
      }
      return moment(expireDate).format('YYYY-MM-DD[T]HH:mm[:00.000+00:00]')
    },

    getSLAInfo () {
      const clientContract = this.clientContract
      const hoursPerSLA = this.officeInfo.isLocal
        ? clientContract.sla.local
        : clientContract.sla.foreign
      const officeOpeningTime = this.officeInfo.openingHour

      const submittedDate = `${this.dateSubmitted} ${this.timeSubmitted}`
      const isBefore2pm = moment(submittedDate).diff(`${this.dateSubmitted} 14:30`, 'minutes') < 0
      let startingDay = isBefore2pm ? this.dateSubmitted : this.getNextDayworking(moment(this.dateSubmitted))

      startingDay = moment(startingDay).format('yyyy-MM-DD')
      let startingTime = isBefore2pm ? this.timeSubmitted : officeOpeningTime

      const startingDate = moment(`${startingDay} ${startingTime}`).format()
      startingTime = officeOpeningTime === '08:30' ? '8:00' : officeOpeningTime
      const limitTime = moment(`${startingDay} 17:00`).format()

      let nextDayworking = moment(`${startingDay} ${startingTime}`).format()
      nextDayworking = this.getNextDayworking(nextDayworking)

      const openingDayMinutes = moment(limitTime).diff(startingDate, 'minutes')

      let minutesCount = hoursPerSLA * 60 - openingDayMinutes
      return {
        minutesCount,
        openingDayMinutes,
        hoursPerSLA,
        nextDayworking,
        startingDate
      }
    },

    getNextDayworking (date) {
      let nexWorkingday

      nexWorkingday = moment(date)
        .add(1, 'days')
        .format()

      if (moment(nexWorkingday).format('dddd') === 'sábado') {
        nexWorkingday = moment
          .utc(date)
          .add(3, 'days')
          .format()
      }
      // const matchFormat = moment(nexWorkingday).format('yyyy-MM-DD')
      // const holidays = ['2021-02-15', '2021-02-16']
      // const itsHoliday = holidays.find(d => d === matchFormat)
      // console.log(itsHoliday)
      // if (itsHoliday) {
      //   nexWorkingday = moment(date)
      //     .add(1, 'days')
      //     .format()
      // }
      return nexWorkingday
    },

    preventDuplicity (form) {
      return new Promise ((resolve, reject) => {
        const { clientName } = form
        const reportCode = this.requiresCorrelate ? null : form.reportCode
        const serialCode = this.serialNotSubmitted ? null : form.serialCode
        const _id = this.editing ? form._id : null

        const activesFilter = {
          "$or": [
            { "$and": [{ reportCode }, { clientName }] },
            { serialCode }
          ],
          _id: { "$ne": _id }
        }

        const closedsFilter = {
          "$and": [{ reportCode }, { clientName }],
          _id: { "$ne": _id }
        }
        Promise.all([
          this.findDocuments({ collection: 'Active', filter: activesFilter }),
          this.findDocuments({ collection: 'Closed', filter: closedsFilter })
        ])
          .then((res) => {
            const result = [...res[0], ...res[1]]
            if (result.length) {
              this.showSnackbar({ error: 'Registrado anteriormente, verique el código de reporte y serial' })
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(() => reject(false))
      })
    },

    async save (newService) {
      this.loader = true
      const existOnDB = (!this.requiresCorrelate || !this.serialNotSubmitted)
        ? await this.preventDuplicity(newService)
        : false
      if (existOnDB) return this.loader = false
      const body = await this.completeBody(newService)
      if (body.throwsError) return this.showSnackbar({ error: body.throwsError }), this.loader = false
      if (this.editing) return this.update({ collection: 'Active', body })
      else this.create({ collection: 'Active', body })
    },

    update (document) {
      this.updateDocument(document)
        .then(() => this.finish())
        .catch(() => this.loader = false)
    },

    create (document) {
      this.createDocument(document)
        .then(() => this.finish())
        .catch(() => this.loader = false)
    },

    finish () {
      if (!this.serialNotSubmitted) this.$emit('searchRelated', Object.assign({}, this.serviceForm))
      this.$emit('hideInterface')
    },

    getCorrelative () {
      return new Promise ((resolve, reject) => {
        axios.put('/Correlative', null, { headers: { 'auth-token': this.formOptions.token } })
          .then(({ data }) => {
            if (data.error) return resolve({ throwsError: data.error, val: null })
            else resolve({ throwsError: false, val: data.val })
          })
          .catch(() => reject(this.showSnackbar({
            error: 'Error inesperado. Verifique la conexión, recargue la página e intente nuevamente'
          })))
      })
    },

    async completeBody (form) {
      if (this.requiresCorrelate) {
        const correlative = await this.getCorrelative()
        if (correlative.throwsError) return { throwsError: correlative.throwsError }
        else form.reportCode = correlative.val
      }
      const observations = this.setDocumentation('')
      if (this.editing) form.documentation.push(observations)
      else form.documentation = this.setDocumentation('')
      if (!this.serviceForm.itsSpecial) {
        form.expireDate = this.getExpireDate()
        const minutesLeft = moment(form.expireDate).diff(new Date(), 'minutes')
        form.expired = minutesLeft < 0
      } else {
        form.expireDate = new Date()
        form.expired = false
      }

      return form
    },

    setDocumentation (observations) {
      return {
        type: this.editing
          ? 'Editado'
          : 'Registrado',
        observations,
        status: this.editing
          ? this.editing.status
          : 'En programación',
        date: this.serviceForm.reportedAt,
        author: this.formOptions.user,
        updatedAt: moment(Date.now()).format()
      }
    }
  },

  watch: {

    serialNotSubmitted: function () {
      if (this.serialNotSubmitted) this.serviceForm.serialCode = 'SIN SERIAL'
      else this.serviceForm.serialCode = ''
    },

    activeStep: function () {
      if (this.activeStep === 3) this.findSuggestions(this.serviceForm)
    },

    timeSubmitted: function () {
      this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM,')} ${this.timeSubmitted}`
      this.serviceForm.reportedAt = moment(`${this.dateSubmitted} ${this.timeSubmitted}`)
        .format('YYYY-MM-DD[T]HH:mm[:00.000+00:00]')
    },

    dateSubmitted: function () {
      this.friendlyDate = `${moment(this.dateSubmitted).format('DD [de] MMMM,')} ${this.timeSubmitted}`
      this.serviceForm.reportedAt = moment(`${this.dateSubmitted} ${this.timeSubmitted}`)
        .format('YYYY-MM-DD[T]HH:mm[:00.000+00:00]')
    },

    "serviceForm.productName": function () {
      this.serviceForm.productType = this.serviceForm.productName
        ? this.collections.Product.find(item => item.productName === this.serviceForm.productName).productType
        : ''
    },

    "serviceForm.officeName": function () {
      this.serviceForm.officeRegion = this.officeInfo.region
      this.serviceForm.officeState = this.officeInfo.officeState
      this.serviceForm.isLocal = this.officeInfo.isLocal
    }

  }

})
</script>
