<template>
  <v-container>
    <v-menu
      v-model="timePicker"
      ref="menu"
      :close-on-content-click="false"
      :nudge-right="40"
      :return-value.sync="timeSubmitted"
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ma-1"
          v-on="on"
          v-bind="attrs"
          :outlined="!timeSubmitted"
          :color="timeSubmitted ? 'primary' : 'error'"
          small
        >
          <v-icon>mdi-clock-time-four-outline</v-icon>
        </v-btn>
      </template>
      <v-time-picker
        v-if="timePicker"
        @click:minute="$refs.menu.save(timeSubmitted)"
        v-model="timeSubmitted"
        :allowed-hours="(v => v < 17 && v > 7)"
        full-width
        format="24hr"
      />
    </v-menu>
  </v-container>
</template>

<script>
export default {
  name: 'TimeMenu',
  props: [],
  data: () => ({
    timePicker: false,
    timeSubmitted: ''
  }),

  watch: {
    timeSubmitted: function () {
      this.$emit('setTime', this.timeSubmitted)
    }
  }
}
</script>