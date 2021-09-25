<template>
  <v-container>
    <v-card class="mx-auto">
      <v-row>
        <canvas class="pa-3" :id="id" />
      </v-row>
      <v-card-title class="text-no-wrap">{{ title }}</v-card-title>
      <v-card-subtitle>{{ subtitle }}</v-card-subtitle>
    </v-card>
  </v-container>
</template>

<script>
import Chart from 'chart.js/auto'
export default {
  name: 'Graph',
  props: ['updatingState', 'id', 'title', 'subtitle', 'chartData'],
  data: () => ({
    myChart: null
  }),
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }
  },
  methods: {
    createChart (chartId, chartData) {
      const ctx = document.getElementById(chartId)
      this.myChart = new Chart(ctx, chartData)
    }
  },
  watch: {
    updatingState: function () {
      if (this.updatingState) return
      this.createChart(this.id, this.chartData)
    }
  },
  mounted () {
    if (this.updatingState) return
      this.createChart(this.id, this.chartData)
  }
}
</script>
