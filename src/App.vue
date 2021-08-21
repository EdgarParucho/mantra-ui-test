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
    if (activeSession) {
      this.getcollections()
    } else {
      this.$router.push('/login')
    }
  }

}
</script>
