<template>
  <div>
    <v-card class="pa-5">
      <v-alert type="error" text rounded="pill">
        Los siguientes correos no pudieron ser entregados.
        Puedes copiarlos, tratar de reenviar o descartarlos.
      </v-alert>
      <v-card-title>Correos fallidos</v-card-title>
      <v-list subheader two-line>
        <v-list-item v-for="email, index in failedEmails" :key="index">
          <v-list-item-avatar>
            <v-icon class="error lighten-1" dark>
              mdi-email-remove
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-text="email.subject" />
            <v-list-item-subtitle v-text="email.to" />
          </v-list-item-content>
          <v-dialog v-model="emailDetails" fullscreen>
            <template v-slot:activator="{ on }">
              <v-list-item-action>
                <v-btn v-on="on" icon>
                  <v-icon left>mdi-magnify</v-icon>
                </v-btn>
              </v-list-item-action>
            </template>
            <v-card>
              <v-container>
                <v-text-field v-model="email.to" prefix="Para:" solo dense readonly />
                <v-text-field v-model="email.cc" prefix="CC:" solo dense readonly />
                <v-sheet v-html="email.html" />
                <v-card-actions class="justify-end">
                  <v-btn @click="resend(email, index)" color="success" :loading="loader">
                    <v-icon left>mdi-send</v-icon>
                    Reenviar
                  </v-btn>
                  <v-btn @click="deleteEmail(index)" color="error">
                    <v-icon left>mdi-delete</v-icon>Descartar
                  </v-btn>
                  <v-btn @click="emailDetails = false">
                    <v-icon left>mdi-keyboard-return</v-icon>Volver
                  </v-btn>
                </v-card-actions>
              </v-container>
            </v-card>
          </v-dialog>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
export default {
  name: 'EmailsLog',
  props: ['mobile', 'failedEmails'],
  data: () => ({
    emailDetails: false,
    loader: false
  }),
  methods: {
    ...mapActions(['sendEmail']),
    ...mapMutations(['removeEmail']),
    resend (email, index) {
      this.loader = true
      this.sendEmail([email])
        .then(() => {
          this.emailDetails = false
          this.removeEmail(index)
          if (!this.failedEmails.length) this.$emit('closeSheet')
        })
        .catch((error) => console.log(error))
        .finally(() => this.loader = false)
    },
    deleteEmail (index) {
      this.emailDetails = false
      this.removeEmail(index)
      if (!this.failedEmails.length) this.$emit('closeSheet')
    }
  }
}
</script>
