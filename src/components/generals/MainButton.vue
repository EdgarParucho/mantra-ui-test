<template>
  <v-container>
    <v-tooltip left color="primary">
      <template v-slot:activator="{ on }">
        <v-btn
          class="mb-15 mr-10"
          :disabled="disabled"
          :loading="loading"
          v-on="on"
          color="primary"
          absolute
          bottom
          fixed
          right
          fab
          @click="$emit('showForm')"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      Agregar
    </v-tooltip>
  </v-container>
</template>

<script>
export default {
  name: 'MainButton',
  props: ['loading', 'disabled']
}
</script>
