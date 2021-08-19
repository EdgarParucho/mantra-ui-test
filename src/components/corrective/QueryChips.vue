<template>
  <v-container>
    <v-chip-group color="secondary">
      <v-icon>mdi-filter</v-icon>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-chip v-on="on" small>Serial</v-chip>
        </template>
        <v-card class="px-7" height="95">
          <v-row align="center">
            <v-col cols="10">
              <v-text-field
                v-model="serialCode"
                label="Serial"
                @keyup.enter="$emit('submitQuery', { serialCode })"
                maxlength="20"
                counter="20"
              />
            </v-col>
            <v-col cols="2">
              <v-btn
                @click="$emit('submitQuery', { serialCode })"
                fab
                x-small
                color="primary"
              >
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-menu>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-chip v-on="on" small>Código</v-chip>
        </template>
        <v-card class="px-7" height="95">
          <v-row align="center">
            <v-col cols="10">
              <v-text-field
                v-model="reportCode"
                label="Código"
                @keyup.enter="$emit('submitQuery', { reportCode })"
                maxlength="20"
                counter="20"
              />
            </v-col>
            <v-col cols="2">
              <v-btn
                @click="$emit('submitQuery', { reportCode })"
                fab
                x-small
                color="primary"
              >
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-menu>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-chip v-on="on" small>#Orden</v-chip>
        </template>
        <v-card class="px-7" height="95">
          <v-row align="center">
            <v-col cols="10">
              <v-text-field
                v-model="serviceOrder"
                label="#Orden"
                @keyup.enter="$emit('submitQuery', { 'documentation.serviceOrder': serviceOrder })"
                maxlength="20"
                counter="20"
              />
            </v-col>
            <v-col cols="2">
              <v-btn
                @click="$emit('submitQuery', { 'documentation.serviceOrder.number': serviceOrder })"
                fab
                x-small
                color="primary"
              >
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-menu>
      <v-chip @click="$emit('submitQuery', { 'documentation.serviceOrder.validated': false })" small>
        Por validar
      </v-chip>
    </v-chip-group>
  </v-container>
</template>

<script>
export default {
  name: 'QueryChips',
  data: () => {
    return {
      serviceOrder: '',
      serialCode: '',
      reportCode: '',
      loader: false
    }
  }
}
</script>
