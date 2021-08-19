<template>
  <v-container>
    <v-chip-group color="secondary">
      <v-icon>mdi-filter</v-icon>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-chip v-on="on" small>#Guía</v-chip>
        </template>
        <v-card class="px-7" height="95">
          <v-row align="center">
            <v-col cols="10">
              <v-text-field
                v-model="reference"
                label="#Guía"
                @keyup.enter="$emit('submitQuery', { 'dispatch.reference': reference })"
                maxlength="20"
                counter="20"
              />
            </v-col>
            <v-col cols="2">
              <v-btn
                @click="$emit('submitQuery', { 'dispatch.reference': reference })"
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
          <v-chip v-on="on" small>#Reporte</v-chip>
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
    </v-chip-group>
  </v-container>
</template>

<script>
export default {
  name: 'QueryChips',
  data: () => {
    return {
      reference: '',
      reportCode: '',
      loader: false
    }
  }
}
</script>
