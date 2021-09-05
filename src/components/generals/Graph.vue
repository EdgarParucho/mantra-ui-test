<template>
  <v-container>
    <v-card class="mx-auto">
      <v-row>
        <canvas class="pa-3" :id="id" />
      </v-row>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-subtitle>{{ subtitle }}</v-card-subtitle>
    </v-card>
  </v-container>
</template>

<script>
import Chart from 'chart.js/auto'
export default {
  name: 'Graph',
  props: ['loading', 'id', 'title', 'subtitle', 'chartData'],
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }
  },
  methods: {
    createChart (chartId, chartData) {
      const ctx = document.getElementById(chartId)
      // const myChart = new Chart(ctx, {
      //   type: typeGr,
      //   data: chartData.data,
      //   options: chartData.options
      // })
      const myChart = new Chart(ctx, chartData)
      return myChart
    }
  },
  watch: {
    loading: function () {
      if (this.loading) return
      this.createChart(this.id, this.chartData)
    }
  },
  mounted () {
    if (this.loading) return
      this.createChart(this.id, this.chartData)
  }
}
</script>
