<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="text-no-wrap my-2 px-2">
          <v-row align="center">
            <v-col cols="4">
              <v-img src="@/assets/svg/typewriter.svg" width="70" />
            </v-col>
            <v-col>
              <v-card-title>
                {{ collections.Product.length }}
              </v-card-title>
              <v-card-subtitle>
                Productos registrados
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
  name: 'ProductsCards',
  props: ['mobile'],
  computed: {
    ...mapState(['collections'])
  }
}
</script>
