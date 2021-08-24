<template>
  <v-container>
    <v-list color="hsla(140, 45%, 55%, .3)" dark dense nav elevation="1">
      <v-list-item
        v-for="option in options"
        :key="option.title"
        link
        :to="option.redirect"
        v-show="
          option.minRole >= $store.state.session.user.userRole
          && (!option.onlyFor || option.onlyFor === $store.state.session.user.department)
        "
      >
        <v-list-item-icon>
          <v-icon>{{ option.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ option.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
export default {
  name: 'AppMenu',
  data () {
    return {
      options: [
        { title: 'Panel', icon: 'mdi-monitor-dashboard', redirect: '/', minRole: 3 },
        { title: 'Correctivo', icon: 'mdi-tools', redirect: '/correctivo', minRole: 3, onlyFor: 'Operaciones' },
        { title: 'Preventivo', icon: 'mdi-broom', redirect: '/preventivo', minRole: 3, onlyFor: 'Operaciones' },
        { title: 'Consultas', icon: 'mdi-folder-search', redirect: '/consultas', minRole: 3, onlyFor: 'Operaciones' },
        { title: 'Piezas', icon: 'mdi-cog', redirect: '/piezas', minRole: 1 },
        { title: 'Solicitudes', icon: 'mdi-package-variant', redirect: '/solicitudes', minRole: 3 },
        { title: 'Despachos', icon: 'mdi-truck', redirect: '/despachos', minRole: 3 },
        { title: 'Clientes', icon: 'mdi-account-tie', redirect: '/clientes', minRole: 3 },
        { title: 'Oficinas', icon: 'mdi-bank', redirect: '/oficinas', minRole: 3, onlyFor: 'Operaciones' },
        { title: 'Productos', icon: 'mdi-printer', redirect: '/productos', minRole: 2 },
        { title: 'Usuarios', icon: 'mdi-account', redirect: '/usuarios', minRole: 1 }
      ]
    }
  }
}
</script>
