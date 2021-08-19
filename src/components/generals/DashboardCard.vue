<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="text-no-wrap my-2 px-2" :disabled="!cardInfo.data.length">
          <v-row align="center">
            <v-col cols="4">
              <v-img :src="cardInfo.icon" width="70" />
            </v-col>
            <v-col>
              <v-card-title>
                {{ cardInfo.data.length }}
                <v-btn
                  v-if="cardInfo.data.length"
                  @click="showBottomSheet"
                  icon
                  small
                >
                  <v-icon small color="accent">
                    mdi-eye-settings-outline
                  </v-icon>
                </v-btn>
              </v-card-title>
              <v-card-subtitle>
                {{ cardInfo.title }}
              </v-card-subtitle>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-bottom-sheet v-model="bottomSheet" scrollable>
      <v-card>
        <Header
          closable="1"
          :title="cardInfo.title"
          subtitle=""
          @hideInterface="bottomSheet = false"
        />
        <v-card-text>
          <QueryResult :result="cardInfo.data" :mobile="mobile" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import QueryResult from '@/components/corrective/QueryResult'
import Header from '@/components/generals/Header'

export default {

  name: 'DashboardCard',
  components: { QueryResult, Header },
  props: ['cardInfo', 'mobile'],
  
  data: () => {
    return {
      bottomSheet: false
    }
  },
  
  methods: {
    showBottomSheet () {
      this.bottomSheet = true
    }
  }

}
</script>
