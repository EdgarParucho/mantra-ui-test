<template>
  <v-container>
    <v-expansion-panels>
      <v-expansion-panel
        v-for="client, index in orderedServices" :key="index"
        :disabled="!client.services.length"
      >
        <v-expansion-panel-header>
          {{ client.clientName }}
        </v-expansion-panel-header>
        <v-expansion-panel-content
          v-for="(service, indx) in client.services"
          :key="indx"
          class="mt-2"
        >
          <CorrectivePanel
            :service="service"
            :mobile="mobile"
            @searchRelated="$emit('searchRelated', service)"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
import CorrectivePanel from './CorrectivePanel'
export default {
  name: 'CorrectivesPanels',
  props: ['collections', 'orderedServices', 'mobile'],
  components: { CorrectivePanel }
}
</script>
