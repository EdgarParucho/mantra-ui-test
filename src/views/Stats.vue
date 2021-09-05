<template>
  <v-container>
    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <Graph id="dashboardGraph1" :chartData="servicesXTechnician" title="Servicios por técnico" :subtitle="thisMonth" />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <Graph id="dashboardGraph2" :chartData="servicesXClient" title="Servicios por cliente" :subtitle="thisMonth" />
      </v-col>
      <v-row>
        <v-col>
          <v-alert type="info" color="#15b" text>
            Los indicadores de mantenimiento <b>correctivo</b> se contabilizan por reporte o servicio especial.
          </v-alert>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-alert type="info" color="#b15" text>
            Los indicadores de mantenimiento <b>preventivo</b> se contabilizan por oficina y orden validada.
          </v-alert>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment-timezone'
import Graph from '@/components/generals/Graph'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'Stats',
  components: { Graph },
  data: () => ({
    //
  }),
  computed: {
    ...mapState(['collections']),
    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    thisMonth () {
      return moment(new Date()).format('MMMM')
    },

    corrective () {
      return [...this.collections.Active, ...this.collections.Closed]
    },

    servicesXClient () {
      const type = 'bar'
      const options = {}
      const data = {
        labels: this.formOptions.clients.map(client => client.clientName),
        datasets: [
          { label: 'Correctivo', data: [], backgroundColor: '#15b'},
          { label: 'Preventivo', data: [], backgroundColor: '#b15' }
        ]
      }
      for (const client of this.formOptions.clients) {
        const clientServices = service => service.clientName === client.clientName
        data.datasets[0].data.push(this.corrective.filter(clientServices).length)
      }
      for (const client of this.formOptions.clients) {
        const clientServices = office => office.clientName === client.clientName
        data.datasets[1].data.push(this.finishedMaint.filter(clientServices).length)
      }
      return { type, data, options }
    },

    servicesXTechnician () {
      const type = 'line'
      const options = {}
      const data = {
        labels: this.formOptions.technicians.map(tech => tech.text),
        datasets: [
          { label: 'Correctivo', data: [], backgroundColor: '#15b'},
          { label: 'Preventivo', data: [], backgroundColor: '#b15' }
        ]
      }
      for (const technician of this.formOptions.technicians) {
        const technicianServices = service => service.schedule.technician.fullName === technician.text
        data.datasets[0].data.push(this.corrective.filter(technicianServices).length)
      }
      for (const technician of this.formOptions.technicians) {
        const technicianServices = office => office.inventory.filter(product => product.schedule.technician.fullName === technician.text).length
        data.datasets[1].data.push(this.finishedMaint.filter(technicianServices).length)
      }
      return { type, data, options }
    },

    finishedMaint () {
      const lastMonthFirst = new Date(new Date().getFullYear(), new Date().getMonth() -1, 1)
      const thisMonthFirst = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const afterLastMonth = (office) => moment(office.lastMaintenance).parseZone('America/Caracas').isAfter(lastMonthFirst)
      const beforeThisMonth = (office) => moment(office.lastMaintenance).parseZone('America/Caracas').isBefore(thisMonthFirst)
      const main = this.collections.Office.filter(office => afterLastMonth(office) && beforeThisMonth(office))
      console.log(main)
      return main
    }
  },
  // methods: {
  //   createChart (typeGr, chartId, chartData) {
  //     const ctx = document.getElementById(chartId)
  //     const myChart = new Chart(ctx, {
  //       type: typeGr,
  //       data: chartData.data,
  //       options: chartData.options
  //     })
  //     return myChart
  //   }
  // },
  // watch: {
  //   loading: function () {
  //     if (this.loading) return
  //     this.createChart('bar', 'myChart', this.servicesXClient)
  //     this.createChart('line', 'myChart2', this.servicesXTechnician)
  //   }
  // },
  // mounted () {
  //   if (this.loading) return
  //   this.createChart('bar', 'myChart', this.servicesXClient)
  //   this.createChart('line', 'myChart2', this.servicesXTechnician)
  // }
}
</script>
