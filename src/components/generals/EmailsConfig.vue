<template>
  <v-container>
    <Header
      closable="1"
      title="Correos electrónicos"
      subtitle="Configuración general"
      @hideInterface="$emit('hideInterface')"
    />
    <v-tabs :vertical="!mobile">
      <v-tab v-for="email of emails" :key="email._id">
        {{ email.subject }}
      </v-tab>
      <v-tab-item v-for="email of emails" :key="email._id">
        <v-card>
          <v-card-text>
            <v-form>
              <v-switch v-model="email.enabled" label="Habilitado" />
              <v-autocomplete
                v-model="email.to.email"
                :items="formOptions.emailAccounts"
                :disabled="!email.to.editable"
                prefix="Para"
                hide-no-data
                deletable-chips small-chips
              />
              <v-autocomplete
                v-model="email.cc.recipients"
                :items="formOptions.emailAccounts"
                :disabled="!email.cc.editable"
                prefix="CC"
                hide-no-data
                multiple deletable-chips small-chips
              />
              <v-card-actions>
                <v-btn
                  class="mx-auto"
                  @click="writeConfig(email)"
                  color="primary"
                  :loading="loader"
                  :disabled="hasNoChanges(email)"
                >
                  Actualizar
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import Header from '@/components/generals/Header'
import { mapState, mapActions, mapGetters } from 'vuex'
export default {
  name: 'EmailsConfig',
  components: { Header },
  data: () => ({
    emails: [],
    loader: false
  }),
  created () {
    this.copyItems()
  },
  computed: {
    ...mapState(['collections']),
    ...mapGetters(['formOptions']),
    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }
  },
  methods: {
    ...mapActions(['updateDocument']),
    copyItems () {
      this.emails = JSON.parse(JSON.stringify(this.collections.Email))
    },
    writeConfig (email) {
      this.loader = true
      if (email.to.editable && !email.to.email) email.enabled = false
      if (email.to.email) email.to.name = this.collections.User.find(user => user.email === email.to.email).firstName
      this.updateDocument({
        collection: 'Email',
        body: email
      })
        .then(() => this.loader = false)
        .catch((e) => console.error(e), this.loader = false)
    },
    hasNoChanges (email) {
      const copy = JSON.stringify(email)
      let original = this.collections.Email.find(item => item._id === email._id)
      original = JSON.stringify(original)
      return copy === original
    }
  }
}
</script>
