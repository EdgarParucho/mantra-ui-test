<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="text-no-wrap my-2 px-2" :disabled="!collections.Client.length">
          <v-row align="center">
            <v-col cols="4">
              <v-img src="@/assets/svg/target.svg" width="70" />
            </v-col>
            <v-col>
              <v-card-title>
                {{ collections.Client.length }}
              </v-card-title>
              <v-card-subtitle>
                Clientes registrados
              </v-card-subtitle>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="text-no-wrap my-2 px-2" :disabled="!collections.Client.length">
          <v-row align="center">
            <v-col cols="4">
              <v-img src="@/assets/svg/handshake.svg" width="70" />
            </v-col>
            <v-col>
              <v-card-title>
                {{ activeClients.length }}
              </v-card-title>
              <v-card-subtitle>
                Clientes activos
              </v-card-subtitle>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'ClientsCards',
  props: ['mobile'],
  data: () => {
    return {
      bottomSheet: false,
      result: [],
      sheetTilte: ''
    }
  },
  computed: {
    ...mapState(['collections']),
    activeClients () {
      return this.collections.Client.filter(client => 
        client.contracts.filter(contract => contract.active).length
      )
    }
  },
  methods: {
    showBottomSheet (data, sheetTilte) {
      this.result = data
      this.sheetTilte = sheetTilte
      this.bottomSheet = true
    }
  }
}
</script>
