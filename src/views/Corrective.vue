<template>
  <v-container>

    <Header title="Mantenimiento correctivo" subtitle="Bandeja de servicios activos" />

    <v-row>
      <v-col :cols="mobile ? 12 : 6">
        <v-skeleton-loader v-if="loading" type="image" width="100%" />
				<v-skeleton-loader v-if="loading" type="image" width="100%" />

        <CorrectivePanels
          v-else
          :mobile="mobile"
          :collections="collections"
          :orderedServices="orderedServices"
          @searchRelated="(service) => searchRelated(service, notifyAnyway = true)"
        />

      </v-col>
      <v-col :cols="mobile ? 12 : 6">
        <v-row v-for="card, index in cards" :key="index">
          <v-col>
            <DashboardCard :cardInfo="card" :mobile="mobile" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <MainButton @showForm="dialog = true" :loading="loading" />

    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="dialog">
      <v-card>

        <CorrectiveForm
          v-if="dialog"
          :mobile="mobile"
          :collections="collections"
          @hideInterface="dialog = false"
          @searchRelated="searchRelated"
        />

      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" dark outlined :timeout="2000" rounded="pill" centered transition="fab-transition">
      <v-row align="center">
        <v-col>
          <span class="white--text">
            {{ snackbarMessage }}
          </span>
        </v-col>
        <v-col cols="2">
          <v-btn :color="snackbarIconColor" fab outlined small @click.native="snackbar = false">
            <v-icon>
              {{ snackbarIcon }}
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-snackbar>

  </v-container>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/generals/Header'
import MainButton from '@/components/generals/MainButton'
import CorrectiveForm from '@/components/corrective/CorrectiveForm'
import CorrectivePanels from '@/components/corrective/CorrectivePanels'
import DashboardCard from '@/components/generals/DashboardCard'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'Corrective',
  components: {
    CorrectivePanels,
    DashboardCard,
    Header,
    MainButton,
    CorrectiveForm
  },

  data: () => {
    return {
      dialog: false,
      snackbar: false,
      snackbarMessage: '',
      snackbarIcon: '',
      snackbarIconColor: ''
    }
  },

  computed: {

    ...mapState(['collections', 'loading']),

    ...mapGetters(['formOptions']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    },

    orderedServices () {
      const services = []
      for (const clientName of this.formOptions.clientNames) {
        services.push(
          {
            clientName,
            services: this.collections.Active.filter(service => service.clientName === clientName)
          }
        )
      }
      return services
    },

    cards () {
      return [
        { data: this.collections.Active, title: 'Activos', icon: require('@/assets/svg/dashboard.svg') },
        { data: this.pendingXSpareParts, title: 'Por repuestos', icon: require('@/assets/svg/gear.svg') }
      ]
    },

    pendingXSpareParts () {
      return this.collections.Active.filter(service => service.status === 'Pendiente - Por repuestos')
    }

  },

  methods: {

    ...mapMutations(['setRelatedDocuments']),

    ...mapActions(['findDocuments']),

    searchRelated (service, notifyAnyway) {
      const closedsFilter = { "$or": [{ serialCode: service.serialCode }, { "documentation.newSerial": service.serialCode }] }
      const findOn = [
        this.findDocuments({ collection: 'Closed', filter: closedsFilter }),
        this.findDocuments({ collection: 'Inventory', filter: { serialCode: service.serialCode } })
      ]
      Promise.all(findOn)
        .then((res) => {
          const data = [...res[0], ...res[1]]
          if (data.length) {
            this.setRelatedDocuments({ serialCode: service.serialCode, data })
            this.snackbarMessage = 'Encontramos servicios relacionados'
            this.snackbarIcon = 'mdi-check'
            this.snackbarIconColor = 'accent lighten-1'
            this.snackbar = true
          } else if (notifyAnyway) {
            this.snackbarMessage = 'La búsqueda no arrojó resultados'
            this.snackbarIcon = 'mdi-alert'
            this.snackbarIconColor = 'error lighten-1'
            this.snackbar = true
          }
        })
    }
  }
}
</script>
