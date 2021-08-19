<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="text-no-wrap my-2 px-2">
          <v-row align="center">
            <v-col cols="4">
              <v-img src="@/assets/svg/office-building.svg" width="70" />
            </v-col>
            <v-col>
              <v-card-title>
                {{ collections.Office.length }}
              </v-card-title>
              <v-card-subtitle>
                Oficinas registradas
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
  name: 'OfficesCards',
  props: ['mobile'],
  computed: {
    ...mapState(['collections'])
  }
}
</script>
