<template>
  <v-container>
    <Header
      closable="1"
      title="Asignación"
      subtitle="Registre la fecha y el personal asignado"
      @hideInterface="$emit('hideInterface')"
    />
    <v-form ref="form" v-model="assignForm">
      <v-row justify="end">
        <v-col :cols="mobile ? 12 : 9">
          <v-autocomplete
            v-model="schedule.technician"
            label="Técnico asignado"
            :items="formOptions.technicians"
            :rules="rules.required"
          />
        </v-col>
      </v-row>
      <v-row align="center">
        <v-col align="center" cols="3">
          <DateMenu @setDate="(date) => dateSubmitted = date" />
        </v-col>
        <v-col cols="9">
          <v-text-field
            v-model="friendlyDate"
            :error-messages="itIsWeekend(dateSubmitted) ? 'Seleccione un día de la semana' : ''"
            :rules="rules.required"
            label="Fecha estimada de atención"
            readonly
          />
        </v-col>
      </v-row>
      <v-row class="pb-2" align="center">
        <v-col align="center">
          <v-btn
            :disabled="!assignForm"
            :loading="loader"
            color="primary"
            @click="save"
          >
            Registrar
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>

import email from '../../helpers/emails/email'
import Vue from 'vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import Header from '@/components/generals/Header'
import DateMenu from '@/components/generals/DateMenu'
import moment from 'moment-timezone'
import { rules } from '@/helpers/form.js'

moment.locale('es')

export default Vue.extend({
  name: 'CorrectiveSchedule',
  components: { Header, DateMenu },
  props: ['mobile', 'selectedDocument'],

  created () {
    this.friendlyDate = `${moment(this.dateSubmitted).format('dddd, DD [de] MMMM')}`
    this.schedule.technician = this.selectedDocument.schedule.technician
  },

  data: () => ({
    assignForm: false,
    schedule: {
      scheduledDate: new Date().toISOString().substr(0, 10),
      technician: {}
    },
    dateSubmitted: new Date().toISOString().substr(0, 10),
    loader: false,
    friendlyDate: '',
    rules
  }),

  computed: {

    ...mapGetters(['formOptions']),
    ...mapState(['collections']),

    formattedDate () {
      return moment(`${this.dateSubmitted} 08:00`).format('YYYY-MM-DD[T]HH:mm[:00.000+00:00]')
    },

    emailNotification () {
      return this.collections.Email.find(email => email.subject === 'Asignación (correctivo)')
    }

  },

  methods: {

    ...mapActions(['updateDocument', 'sendEmail']),

    itIsWeekend (date) {
      return moment(date).format('dddd') === 'sábado' || moment(date).format('dddd') === 'domingo'
    },

    save () {
      this.loader = true
      let documentation = this.selectedDocument.documentation
      documentation.push(
        this.setDocumentation(
          `Servicio asignado a ${this.schedule.technician.fullName}, fecha estimada de atención: ${this.friendlyDate}.`
        )
      )
      const document = {
        collection: 'Active',
        body: {
          _id: this.selectedDocument._id,
          documentation,
          schedule: {
            technician: this.schedule.technician,
            scheduledDate: this.formattedDate
          },
          status: 'Atención programada'
        }
      }
      this.updateDocument(document)
        .then(() => {
          if (!this.emailNotification.enabled) return
          const addressee = this.collections.User.find(user => user._id === this.schedule.technician._id)
          const notification = email({
            email: this.emailNotification,
            data: { ...this.selectedDocument, schedule: {...this.schedule} },
            author: this.formOptions.user.fullName, addressee
          })
          this.sendEmail([notification])
            .then(() => { return })
            .catch(() => this.loader = false)
        })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    setDocumentation (observations) {
      return {
        type: 'Asignado',
        observations,
        status: this.selectedDocument.status === 'En programación' ? 'Atención programada' : this.selectedDocument.status,
        date: '',
        author: this.formOptions.user,
        technician: this.schedule.technician,
        updatedAt: moment(Date.now()).format()
      }
    }

  },

  watch: {
    dateSubmitted: function () {
      this.friendlyDate = `${moment(this.dateSubmitted).format('dddd, DD [de] MMMM')}`
      this.schedule.scheduledDate = this.formattedDate
    }
  }

})
</script>
