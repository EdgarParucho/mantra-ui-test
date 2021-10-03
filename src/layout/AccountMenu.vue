<template>
  <div>
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
              {{ $session.get('session').user.firstName }}
              {{ $session.get('session').user.lastName }}
            </small>
          </v-col>
        </v-row>
      </v-list-item>
      <v-list color="hsla(140, 45%, 55%, .1)" dense nav elevation="1">
        <v-list-item v-for="option, index of menu" :key="index"
          v-show="option.requiredRole >= $session.get('session').user.userRole"
          @click="menuActions(option.action)"
        >
          <v-list-item-icon>
            <v-icon>{{ option.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ option.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-switch v-model="darkMode" @click.passive="setPreferedTheme" color="white" label="Modo oscuro" prepend-icon="mdi-weather-night" />
      </v-card-actions>
    </v-card>
    <v-dialog v-model="dialog" :persistent="showEmailsConfig" :width="mobile ? '90%' : '60%'">
      <v-card>
        <EmailsConfig v-if="showEmailsConfig" @hideInterface="closeInterfaces" />
        <v-form v-if="showPassForm">
          <v-container>
            <v-row>
              <v-col>
                <v-text-field v-model="userPassword" label="Nueva contraseña"
                  type="password" :rules="rules.passwordRules" :maxLength="8" />
              </v-col>
              <v-col>
                <v-text-field v-model="confirmation" label="Confirmar"
                  type="password" :rules="rules.passwordRules"  :maxLength="8" 
                  :error="!passwordComparison.match" :error-messages="confirmation ? passwordComparison.message : ''"
                />
              </v-col>
              <v-card-actions>
                <v-btn class="mx-auto" color="primary" @click="updateAccount({ userPassword })">
                  Confirmar
                </v-btn>
              </v-card-actions>
            </v-row>
          </v-container>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState, mapMutations } from 'vuex'
import EmailsConfig from './EmailsConfig.vue'
import { rules } from '@/helpers/form'
export default {
  name: 'AccountMenu',
  components: { EmailsConfig },
  props: ['mobile'],
  data: () => ({
    darkMode: false,
    rules,
    dialog: false,
    showPassForm: false,
    showEmailsConfig: false,
    userPassword: '',
    confirmation: '',
    menu: [
      { icon: 'mdi-key', title: 'Cambiar contraseña', requiredRole: 3, action: 'showPassForm' },
      { icon: 'mdi-email-edit', title: 'Correos del sistema', requiredRole: 1, action: 'showEmailsConfig' },
      { icon: 'mdi-logout', title: 'Cerrar esta sesión', requiredRole: 3, action: 'killSession' }
    ]
  }),
  created () {
    this.darkMode = this.$vuetify.theme.isDark
  },
  computed: {
    ...mapState(['session']),
    passwordComparison () {
      let match = this.confirmation === this.userPassword
      match = this.userPassword ? match : true
      const message = match ? '' : 'No coinciden'
      return { match, message }
    }
  },
  methods: {
    ...mapMutations(['logOut', 'showSnackbar']),
    killSession () {
      this.logOut()
      this.$session.destroy()
      this.$router.push('/login')
    },
    menuActions (action) {
      if (action === 'killSession') this.killSession()
      this.dialog = true
      this[action] = true
    },
    updateAccount (body) {
      axios.put(`/Account/${this.session.user._id}`, body, { headers: { 'auth-token': this.session.token } })
        .then(() => this.showSnackbar({ message: 'Actualizamos tus preferencias' }), this.showPassForm = false)
        .catch(() => this.showSnackbar({ error: 'Ocurrió un error desconocido' }))
    },
    closeInterfaces () {
      this.showEmailsConfig = false
      this.dialog = false
    },
    setPreferedTheme () {
      this.$vuetify.theme.isDark = this.darkMode
      let preferences = this.session.user.preferences
      preferences.darkTheme = this.darkMode
      this.updateAccount({ preferences })
      this.$session.set('session', this.session)
    }
  }
}
</script>
