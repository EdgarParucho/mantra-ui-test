<template>
  <v-container>
    <v-btn @click="sendEmail(htmlBody(request))" color="#e55" small absolute right>
      <v-icon color="white">mdi-gmail</v-icon>
    </v-btn>
    <div v-html="htmlBody(request)"></div>
  </v-container>
</template>

<script>
import { htmlBody } from '../helpers/emails'
import { mapActions } from 'vuex'
export default {
  name: 'Test',
  data: () => ({
    htmlBody,
    request: {
      pieceName: 'Tarjeta lógica',
      quantity: 1,
      clientName: 'Mercantil',
      productName: 'Impresora financiera Olivetti PR2 Plus',
      technician: 'Luis Romero',
      officeName: '9217 Principal',
      reportCode: '300-3257891',
      adressee: 'Samuel',
      requestedBy: 'Daniel Salas'
    }
  }),
  methods: {
    ...mapActions(['sendNotification'])
  }
}
</script>
