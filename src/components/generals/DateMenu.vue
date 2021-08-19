<template>
  <v-container>
    <v-menu
      v-model="datePicker"
      ref="datemenu"
      :close-on-content-click="false"
      :return-value.sync="dateSubmitted"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ma-1"
          :color="itIsWeekend(dateSubmitted) ? 'error' : 'primary'"
          v-bind="attrs"
          v-on="on"
          small
        >
          <v-icon>mdi-calendar</v-icon>
        </v-btn>
      </template>

      <v-date-picker
        v-model="dateSubmitted"
        :color="itIsWeekend(dateSubmitted) ? 'error' : 'primary'"
        no-title
        scrollable
      >
        <v-spacer />
        <v-btn
          @click="datePicker = false"
          color="primary"
          text
        >
          Cancelar
        </v-btn>
        <v-btn
          @click="$refs.datemenu.save(dateSubmitted)"
          :disabled="itIsWeekend(dateSubmitted)"
          color="primary"
          text
        >
          OK
        </v-btn>
        <v-tooltip v-if="itIsWeekend(dateSubmitted)" right color="error">
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" color="error">mdi-alert-circle-outline</v-icon>
          </template>
          Por favor seleccione un día válido
        </v-tooltip>
      </v-date-picker>
    </v-menu>
  </v-container>
</template>

<script>
import moment from 'moment-timezone'
moment.locale('es')

export default {
  name: 'DateMenu',
  props: [],
  data: () => ({
    datePicker: false,
    dateSubmitted: new Date().toISOString().substr(0, 10)
  }),

  methods: {
    itIsWeekend (date) {
      return moment(date).format('dddd') === 'sábado' || moment(date).format('dddd') === 'domingo'
    }
  },

  watch: {
    dateSubmitted: function () {
      this.$emit('setDate', this.dateSubmitted)
    }
  }
}
</script>