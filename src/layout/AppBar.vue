<template>
  <v-container>
    <v-app-bar color="primary" dark app>
      <v-menu
        :value="drawer"
        nudge-bottom="70"
      >
        <template v-slot:activator="{ on }">
          <v-app-bar-nav-icon v-on="on" />
        </template>
        <v-card
          color="primary"
          width="256"
        >
          <AppMenu />
        </v-card>
      </v-menu>

      <v-spacer></v-spacer>
      <v-menu nudge-left="55" nudge-bottom="35">
        <template v-slot:activator="{ on }">
          <v-btn small outlined v-on="on">
            {{ $store.state.session.user.firstName }}
          </v-btn>
        </template>
        <v-card color="primary" dark>
          <v-btn @click="killSession" small text block>
            <v-icon left>mdi-logout</v-icon>
            <v-spacer></v-spacer>
            Cerrar sesión
          </v-btn>
        </v-card>
      </v-menu>
      
    </v-app-bar>
  </v-container>
</template>

<script>
import { mapMutations } from 'vuex'
import AppMenu from './AppMenu.vue'
export default {
  components: { AppMenu },
  name: 'AppBar',
  data: () => {
    return {
      drawer: false
    }
  },
  methods: {
    ...mapMutations(['logOut']),
    killSession () {
      this.logOut()
      this.$session.destroy()
      this.$router.push('/login')
    }
  }
}
</script>
