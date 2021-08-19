<template>
  <v-container>
    <Header title="Clientes" subtitle="Administre la información de los clientes" />
    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-skeleton-loader v-if="loading" type="image" width="100%" />
				<v-skeleton-loader v-if="loading" type="image" width="100%" />
        <ClientPanels
          v-else
          :mobile="mobile"
          :collections="collections"
        />
      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <ClientsCards :mobile="mobile" />
      </v-col>
    </v-row>
    <MainButton
      @showForm="dialog = true"
      :disabled="$store.state.session.user.userRole > 1"
      :loading="loading"
    />
    <v-dialog v-model="dialog" :width="mobile ? '90%' : '60%'" persistent>
      <v-card>
        <ClientForm
          v-if="dialog"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="dialog = false"
        />
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
// @ is an alias to /src

import { mapState } from 'vuex'
import Header from '@/components/generals/Header'
import MainButton from '@/components/generals/MainButton'
import ClientForm from '@/components/clients/ClientForm'
import ClientPanels from '@/components/clients/ClientPanels'
import ClientsCards from '@/components/clients/ClientsCards'


export default {
  name: 'Clients',
  components: {
    Header,
    ClientPanels,
    ClientsCards,
    ClientForm,
    MainButton
  },

  data: () => {
    return {
      dialog: false
    }
  },

  computed: {
    ...mapState(['collections', 'loading']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    orderedServices () {
      const clientNames = this.collections.Client.map(x => x.clientName).sort()
      const services = []
      for (const n in this.collections.Client) {
        services.push(
          {
            client: clientNames[n],
            services: this.collections.Active.filter(f => f.clientName === clientNames[n])
          }
        )
      }
      return services
    }
  }
}
</script>
