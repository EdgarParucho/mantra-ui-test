<template>
  <v-container>
    <v-app-bar class="px-3" color="primary" dark app>
      <v-menu
        :value="drawer"
        nudge-bottom="70"
      >
        <template v-slot:activator="{ on }">
          <v-app-bar-nav-icon v-on="on" />
        </template>
        <v-card
          class="gradients"
          width="256"
        >
          <AppMenu />
        </v-card>
      </v-menu>
      <v-spacer />
      <v-avatar color="secondary">
        <v-avatar size="90%" color="white">
          <v-img src="@/assets/logo.png" />
        </v-avatar>
      </v-avatar>
      <v-spacer></v-spacer>
      <v-menu nudge-left="155" nudge-bottom="35">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-card class="gradients pa-5" dark>
          <v-list-item>
            <v-row align="center">
              <v-col cols="4">
                <v-avatar>
                  <v-avatar size="90%" max-with="50" max-height="50">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </v-avatar>
              </v-col>
              <v-col>
                <small class="caption font-weight-bold">
                  {{this.$session.get('session').user.firstName}}
                  {{this.$session.get('session').user.lastName}}
                </small>
              </v-col>
            </v-row>
          </v-list-item>
          <v-divider class="my-2" />
          <v-list color="hsla(140, 45%, 55%, .2)" dense nav elevation="1">
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-key</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Cambiar contraseña</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="$session.get('session').user.userRole <= 1" @click="showEmailConfig = true">
              <v-list-item-icon>
                <v-icon>mdi-email</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Correos del sistema</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="killSession">
              <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Cerrar esta sesión</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
      <v-dialog v-model="showEmailConfig" persistent :width="mobile ? '90%' : '60%'">
        <v-card>
          <EmailsConfig v-if="showEmailConfig" @hideInterface="showEmailConfig = false" />
        </v-card>
      </v-dialog>
    </v-app-bar>
  </v-container>
</template>

<script>
import { mapMutations } from 'vuex'
import EmailsConfig from '../components/generals/EmailsConfig.vue'
import AppMenu from './AppMenu.vue'
export default {
  components: { AppMenu, EmailsConfig },
  name: 'AppBar',
  data: () => {
    return {
      drawer: false,
      showEmailConfig: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
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
