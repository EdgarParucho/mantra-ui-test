<template>
  <v-container>
    <v-row align="center">
      <v-col md="3">
        <v-text-field v-model="tableFilter" prepend-inner-icon="mdi-magnify" label="Filtrar" />
      </v-col>
      <v-col align="end">
        <export-excel v-if="excelFormat" :data="excelFormat">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-on="on"
                v-bind="attrs"
                dark
                :disabled="!result.length"
                color="#2a5"
              >
                <v-icon large>mdi-microsoft-excel</v-icon>
              </v-btn>
            </template>
            Exportar
          </v-tooltip>
        </export-excel>
      </v-col>
    </v-row>
    <v-data-table
      class="elevation-2"
      dense
      :items-per-page="5"
      :headers="headers"
      :items="result"
      :search="tableFilter"
    >
      <template v-slot:item.reportedAt="{ item }">
        {{ item.reportedAt | friendlyDate }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import moment from 'moment-timezone'
export default {
  props: ['result', 'excelFormat'],
  name: 'QueryResult',
  data: () => {
    return {
      tableFilter: '',
      headers: [
        { text: 'Despachado', value: 'dispatch.date' },
        { text: 'Técnico', value: 'technician.fullName' },
        { text: 'Pieza', value: 'pieceName' },
        { text: 'Cliente', value: 'clientName' },
        { text: 'Oficina', value: 'officeName' },
        { text: '#Reporte', value: 'reportCode' },
        { text: 'Referencia', value: 'dispatch.reference' }
      ],
      dialog: false
    }
  },
  filters: {
    friendlyDate (dateSubmitted) {
      return moment(dateSubmitted).parseZone('America/Caracas').format('DD [de] MMMM, HH:mm')
    }
  }
}
</script>
