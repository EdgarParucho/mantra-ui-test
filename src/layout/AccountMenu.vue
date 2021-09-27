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
      <v-divider class="my-2" />
      <v-list color="hsla(140, 45%, 55%, .2)" dense nav elevation="1">
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
    </v-card>
    <v-dialog v-model="showEmailsConfig" persistent :width="mobile ? '90%' : '60%'">
      <v-card>
        <EmailsConfig v-if="showEmailsConfig" @hideInterface="showEmailsConfig = false" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import EmailsConfig from './EmailsConfig.vue'
export default {
  name: 'AccountMenu',
  components: { EmailsConfig },
  props: ['mobile'],
  data: () => ({
    showEmailsConfig: false,
    menu: [
      { icon: 'mdi-key', title: 'Cambiar contraseña', requiredRole: 3, action: '' },
      { icon: 'mdi-email-edit', title: 'Correos del sistema', requiredRole: 1, action: 'showEmailsConfig' },
      { icon: 'mdi-logout', title: 'Cerrar esta sesión', requiredRole: 3, action: 'killSession' }
    ]
  }),
  methods: {
    ...mapMutations(['logOut']),
    killSession () {
      this.logOut()
      this.$session.destroy()
      this.$router.push('/login')
    },
    menuActions (action) {
      this[action] = true
    }
  }
}
</script>
