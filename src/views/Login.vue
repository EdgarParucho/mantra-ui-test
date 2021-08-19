<template>
  <v-container>
    <v-img
      style="position: fixed;
        top: 0;
        left: 0;
        min-width: 100%;
        min-height: 100%;
      "
      src="@/assets/background/bg.jpg"
    >
      <v-row class="mt-10" justify="center">
        <v-col :cols="mobile ? 11 : 6">
          <v-card class="mt-15" style="opacity:80%;" dark>
            <v-form>
              <v-card-text>
                <v-card-title>Inicie sesión</v-card-title>
                <v-row justify="center">
                  <v-col :cols="mobile ? 10 : 8">
                    <v-text-field
                      v-model="loginForm.idDocument"
                      prepend-inner-icon="mdi-account-circle"
                      label="Usuario"
                    />
                  </v-col>
                </v-row>
                <v-row justify="center">
                  <v-col :cols="mobile ? 10 : 8">
                    <v-text-field
                      v-model="loginForm.userPassword"
                      prepend-inner-icon="mdi-key"
                      type="password"
                      label="Contraseña"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  class="mx-auto"
                  @click="tryLog(loginForm)"
                  text
                  color="primary"
                  :loading="loader"
                >
                  Iniciar
                </v-btn>
              </v-card-actions>
              <v-row justify="end">
                <v-tooltip dark right>
                  <template v-slot:activator="{ on }">
                    <v-btn class="mr-5" v-on="on" target="_blank" icon href="https://wa.me/+584142861620">
                      <v-icon>mdi-whatsapp</v-icon>
                    </v-btn>
                  </template>
                  Encontraste errores?
                  <br>
                  Tienes sugerencias?
                  <v-divider class="my-1"></v-divider>
                  Escríbeme
                </v-tooltip>
              </v-row>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-img>

  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'Login',
  data: () => ({
    loader: false,
    loginForm: {
      idDocument: '',
      userPassword: ''
    }
  }),
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }
  },
  methods: {
    ...mapActions(['logIn', 'getcollections']),
    tryLog () {
      this.loader = true
      this.logIn(this.loginForm)
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
