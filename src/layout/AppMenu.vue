<template>
  <v-container>
    <v-list color="hsla(140, 45%, 55%, .3)" dark dense nav elevation="1">
      <v-list-item
        v-for="option in options"
        :key="option.title"
        link
        :to="option.redirect"
        v-show="
          myAccount.userRole <= option.requiredRole
          && (!option.restrictedTo || myAccount[option.restrictedTo.key] === option.restrictedTo.value)
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
import { mapState } from 'vuex'
export default {
  name: 'AppMenu',
  data () {
    return {}
  },

  computed: {
    ...mapState(['session']),
    myAccount () {
      return this.session.user
    },
    options () {
      return [
        {
          title: 'Dashboard',
          icon: 'mdi-monitor-dashboard',
          redirect: '/',
          requiredRole: 3
        },
        {
          title: 'Mi bandeja',
          icon: 'mdi-target-account',
          redirect: `/technician/${this.myAccount._id}`,
          requiredRole: 3,
          restrictedTo: {
            key: 'assignable',
            value: true
          }
        },
        {
          title: 'Correctivo',
          icon: 'mdi-tools',
          redirect: '/correctivo',
          requiredRole: 3,
          restrictedTo: {
            key: 'department',
            value: 'Operaciones'
          }
        },
        {
          title: 'Preventivo',
          icon: 'mdi-broom',
          redirect: '/preventivo',
          requiredRole: 3,
          restrictedTo: {
            key: 'department',
            value: 'Operaciones'
          }
        },
        {
          title: 'Técnicos',
          icon: 'mdi-badge-account',
          redirect: '/tecnicos',
          requiredRole: 3
        },
        {
          title: 'Consultas',
          icon: 'mdi-folder-search',
          redirect: '/consultas',
          requiredRole: 3,
          restrictedTo: {
            key: 'department',
            value: 'Operaciones'
          }
        },
        {
          title: 'Piezas',
          icon: 'mdi-cog',
          redirect: '/piezas',
          requiredRole: 1
        },
        {
          title: 'Solicitudes',
          icon: 'mdi-package-variant',
          redirect: '/solicitudes',
          requiredRole: 3
        },
        {
          title: 'Despachos',
          icon: 'mdi-truck',
          redirect: '/despachos',
          requiredRole: 3
        },
        {
          title: 'Clientes',
          icon: 'mdi-account-tie',
          redirect: '/clientes',
          requiredRole: 3
        },
        {
          title: 'Oficinas',
          icon: 'mdi-bank',
          redirect: '/oficinas',
          requiredRole: 3,
          restrictedTo: {
            key: 'department',
            value: 'Operaciones'
          }
        },
        {
          title: 'Productos',
          icon: 'mdi-printer',
          redirect: '/productos',
          requiredRole: 2
        },
        {
          title: 'Usuarios',
          icon: 'mdi-account',
          redirect: '/usuarios',
          requiredRole: 1
        }
      ]
    }
  }

}
</script>
