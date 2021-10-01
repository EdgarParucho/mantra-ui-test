<template>
  <v-container>
    <v-alert type="error" text>
      Has modificado una propiedad relacionada a varios datos ({{ triggeringProp }}),
      será necesario hacer cambios en múltiples colecciones de datos. Asegurate de conocer los cambios,
      contar con una conexión estable e indicar a tu equipo que reingrese a la app al finalizar.
      De esta forma, podemos mantener la consistencia de la información.
    </v-alert>
    <v-card-subtitle>Propiedades a modificar</v-card-subtitle>
    <v-list>
      <v-list-item v-for="item, index of modifies" :key="index">
        <v-list-item-icon>
          <v-icon small left>mdi-alert-circle-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-title>
          {{ item }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
export default {
  name: 'UpdateWarning',
  props: ['triggeringProp', 'modifies']
}
</script>
