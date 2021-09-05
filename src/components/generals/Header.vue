<template>
  <div>
    <v-row>
      <v-col>
        <v-skeleton-loader v-if="loading" type="card" height="40" />
        <v-alert
          v-else
          color="primary"
          border="left"
          :icon="closable ? null : 'mdi-map-marker'"
          dense
          dark
          :outlined="!closable"
        >
          <v-row>
            <v-col>
              <v-toolbar-title>{{ title }}</v-toolbar-title>
            </v-col>
            <v-col v-if="closable" :cols="2" align="end">
              <v-btn @click="$emit('hideInterface')" icon small>
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <small>{{ subtitle }}</small>
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Header',
  props: ['title', 'subtitle', 'closable'],
  computed: { ...mapState(['loading']) }

}
</script>