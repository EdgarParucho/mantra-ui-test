<template>
  <v-app>
    <AppBar v-if="$session.get('session')" app />
    <v-main>
      <router-view />
      <v-snackbar v-model="snackbar.activated" vertical shaped>

        <span class="overline font-weight-bold">
          {{ snackbar.title }}
        </span>
        <v-divider />
        <p>{{ snackbar.message }}</p>

        <template v-slot:action="{ attrs }">
          <v-icon :color="snackbar.error ? 'error' : 'success'" v-bind="attrs">
            {{ snackbar.error ? 'mdi-alert-circle-outline' : 'mdi-check' }}
          </v-icon>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>

import AppBar from '@/layout/AppBar.vue'
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'App',
  components: { AppBar },
  computed: { ...mapState(['snackbar']) },
  methods: { ...mapMutations(['logIn']), ...mapActions(['getcollections']) },
  created () {
    const activeSession = this.$session.get('session')
    this.$store.state.session = activeSession
    this.$vuetify.theme.isDark = true
    if (activeSession) {
      this.getcollections()
    } else {
      if (this.$router.currentRoute.fullPath !== '/login') this.$router.push('/login')
    }
  }

}
</script>

<style>
.gradients {
  background: hsla(209, 100%, 45%, 1);
  background: linear-gradient(90deg, hsla(180, 100%, 45%, 1) 0%, hsla(140, 100%, 45%, 1) 100%);
  background: -moz-linear-gradient(90deg, hsla(180, 100%, 45%, 1) 0%, hsla(140, 100%, 45%, 1) 100%);
  background: -webkit-linear-gradient(90deg, hsla(170, 100%, 40%, 1) 0%, hsla(145, 85%, 45%, 1) 100%);
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr="#0075E6", endColorstr="#00EE6E", GradientType=1 );
}
</style>