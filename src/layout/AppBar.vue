<template>
  <v-container>
    <v-app-bar class="px-3" color="primary" dark app>
      <v-menu :value="drawer" nudge-bottom="70">
        <template v-slot:activator="{ on }">
          <v-app-bar-nav-icon v-on="on" />
        </template>
        <AppMenu />
      </v-menu>

      <v-spacer />

      <v-avatar>
        <v-img src="@/assets/logo.svg" />
      </v-avatar>

      <v-spacer />

      <v-bottom-sheet v-model="showEmails" :width="mobile ? '90%' : '60%'">
        <template v-slot:activator="{ on }">
          <v-btn v-show="failedEmails.length" icon v-on="on">
            <v-icon>mdi-email-alert</v-icon>
          </v-btn>
        </template>
        <EmailsLog @closeSheet="showEmails = false" :failedEmails="failedEmails" :mobile="mobile" />
      </v-bottom-sheet>

      <v-menu nudge-left="155" :closeOnContentClick="false" nudge-bottom="35">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <AccountMenu :mobile="mobile" />
      </v-menu>
    </v-app-bar>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import EmailsLog from './EmailsLog.vue'
import AppMenu from './AppMenu.vue'
import AccountMenu from './AccountMenu.vue'
export default {
  components: { AccountMenu, AppMenu, EmailsLog },
  name: 'AppBar',
  data: () => {
    return {
      showEmails: false,
      drawer: false
    }
  },
  computed: {
    ...mapState(['failedEmails']),
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }
  }
}
</script>
