<template>
  <v-container>
    <v-img
      class="pb-5"
      app
      style="position: fixed;
        top: 0;
        left: 0;
        min-height: 100%;
        min-width: 100%;
      "
      src="@/assets/background/bg12.jpg"
    >
      <v-alert
        type="info"
        color="dark"
        icon="mdi-information-outline"
        tile
      >
        Elige un perfil de prueba para iniciar
      </v-alert>
      <v-row justify="center">
        <v-col :cols="mobile ? 11 : 5">
          <v-card style="opacity:80%;">
            <v-card-title>Bienvenido a Mantra</v-card-title>
            <v-card-subtitle>Inicia sesión para continuar</v-card-subtitle>
            <v-row>
              <v-col :cols="4">
                <v-row>
                  <v-col align="center">
                    <v-img src="@/assets/logo.png" width="70" />
                    <v-spacer />
                    <v-btn href="https://instagram.com/microfilmscenter" target="blank" color="primary" icon>
                      <v-icon>mdi-instagram</v-icon>
                    </v-btn>
                    <v-btn href="https://microfilmscenter.com" target="blank" color="primary" icon>
                      <v-icon>mdi-web</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider vertical />
              <v-col :cols="8">
                <v-form autocomplete="off">
                  <v-row justify="start">
                    <v-col :cols="11" align="start">
                      <v-select
                        v-model="selectedUser"
                        solo
                        :items="users"
                        :prepend-inner-icon="mobile ? '' : 'mdi-account-circle'"
                        placeholder="Usuario"
                        dense
                        autofocus
                      />
                      <v-text-field
                        readonly
                        :prepend-inner-icon="mobile ? '' : 'mdi-key'"
                        type="password"
                        placeholder="Contraseña"
                      />
                      <v-btn
                        @click="tryLog(selectedUser)"
                        :loading="loader"
                        color="primary"
                        block
                        small
                      >
                        Iniciar
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <template>
        <v-footer
          class="mt-15"
          fixed
          bottom
          dark
          padless
        >
          <v-card
            min-width="100%"
            flat
            tile
            class="text-center"
          >
            <v-card-text>
              <v-btn
                v-for="link, index in links"
                :key="index"
                class="mx-4"
                :href="link.url"
                target="blank"
                icon
              >
                <v-icon size="24px">
                  {{ link.icon }}
                </v-icon>
              </v-btn>
            </v-card-text>

            <v-card-text
              class="pt-0">
              Mantra es una herramienta gestión de operaciones desarrollada para Microfilms Center.
              Eres libre de escribir datos en esta versión de pruebas.
            </v-card-text>

            <v-divider></v-divider>

            <v-card-text>
              {{ new Date().getFullYear() }} — Desarrollado por <strong>Edgar Parucho</strong>
            </v-card-text>
          </v-card>
        </v-footer>
      </template>
    </v-img>

  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'Login',
  data: () => ({
    loader: false,
    selectedUser: '',
    users: [
      { text: 'Edgar Parucho (Admin)', value: { idDocument: '20926619', userPassword: '20926619' } },
      { text: 'Samuel Vivas (Usuario - Almacén)', value: { idDocument: '15367598', userPassword: '15367598' } },
      { text: 'Bryan Sanz (Usuario - Help Desk)', value: { idDocument: '20491189', userPassword: '20491189' } }
    ],
    links: [
      { icon: 'mdi-whatsapp', url: 'https://wa.me/+584142861620' },
      { icon: 'mdi-linkedin', url: 'https://www.linkedin.com/in/edgar-parucho-045769211/?lipi=urn%3Ali%3Apage%3Aprofile_view_index_index%3BHCUWI1GSTqe%2F%2Fbiw922TzQ%3D%3D' },
      { icon: 'mdi-email', url: 'mailto:parucho.edgar@outlook.es' }
    ]
  }),
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }
  },
  methods: {
    ...mapActions(['logIn', 'getcollections']),
    tryLog (user) {
      this.loader = true
      this.logIn(user)
        .then((session) => {
          this.$session.start()
          this.$session.set('session', session)
          this.loader = false
          this.getcollections()
          this.$router.push('/')
        })
        .catch(() => this.loader = false)
    }
  }
}
</script>
