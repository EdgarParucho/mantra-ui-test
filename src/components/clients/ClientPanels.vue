<template>
  <div>
    <v-expansion-panels v-model="panel" multiple>
      <v-expansion-panel v-for="(client, index) in formOptions.clients" :key="index">
        <v-expansion-panel-header>{{ client.clientName }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-sheet>
            <v-card-subtitle class="font-weight-bold">Contactos</v-card-subtitle>
            <section
              v-for="contact, contactI in client.contacts" :key="contactI"
              class="px-1 my-1"
            >
              <v-card-title class="caption font-weight-bold">
                <v-list-item-avatar v-show="!mobile">
                  <v-icon class="grey lighten-1" dark>mdi-account</v-icon>
                </v-list-item-avatar>
                {{ contact.fullName }}
              </v-card-title>
              <v-card-subtitle class="caption">{{ contact.position }}</v-card-subtitle>
              <v-chip-group>
                <v-chip v-for="telephone, indx in contact.phoneNumbers" :key="indx" small>
                  {{ telephone }}
                </v-chip>
              </v-chip-group>
            </section>
            <v-divider class="my-4"></v-divider>

            <section v-if="activeContract(client)">
              <v-alert class="mt-2" type="success" text dense>
                Contrato activo
              </v-alert>
              <v-row>
                <v-col>
                  <v-card-subtitle class="font-weight-bold">
                    Fecha de inicio
                  </v-card-subtitle>
                </v-col>
                <v-col>
                  <v-text-field :value="activeContract(client).startingDate" />
                </v-col>
              </v-row>
              <v-row class="mt-0">
                <v-col>
                  <v-card-subtitle class="font-weight-bold">
                    S. L. A.
                  </v-card-subtitle>
                </v-col>
                <v-col>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-chip class="mr-1" v-on="on" color="primary">
                        {{ activeContract(client).sla.local }}
                      </v-chip>
                    </template>
                    local
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-chip v-on="on" color="accent">
                        {{ activeContract(client).sla.foreign }}
                      </v-chip>
                    </template>
                    foráneo
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card-subtitle class="font-weight-bold">
                    Productos contratados
                  </v-card-subtitle>
                  <v-chip-group>
                    <v-chip
                      v-for="product, i in productTypes(activeContract(client))"
                      :key="i" small
                    >
                      {{ product }}
                    </v-chip>
                  </v-chip-group>
                </v-col>
              </v-row>
            </section>
            <v-alert v-else type="error" dense text>
              Sin contrato activo
            </v-alert>
            <v-row>
              <v-col cols="6">
                <v-btn
                  @click="editClient(client)"
                  :disabled="$store.state.session.user.userRole > 1"
                  small block
                >
                  Editar
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  :disabled="$store.state.session.user.userRole > 1"
                  small block
                  @click="showContracts(client)"
                >
                  Contratos
                </v-btn>
              </v-col>
            </v-row>
          </v-sheet>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="editInterface">
      <v-card>
        <EditClientForm
          v-if="editInterface"
          :collections="collections"
          :mobile="mobile"
          :editing="selectedDocument"
          @hideInterface="editInterface = false"
        />
      </v-card>
    </v-dialog>
    <v-bottom-sheet v-model="bottomSheet" scrollable>
      <v-card>

        <Header
          closable="1"
          title="Contratos registrados"
          :subtitle="selectedClient.clientName"
          @hideInterface="bottomSheet = false"
        />

        <v-card-text>
          <v-btn
            class="ma-1"
            @click="addContract(selectedClient)"
            :disabled="$store.state.session.user.userRole > 1"
            color="secondary"
            small
          >
            Agregar
          </v-btn>
          <v-data-table
            class="elevation-2"
            dense
            :items-per-page="5"
            :headers="headers"
            :items="selectedClient.contracts"
          >
            <template v-slot:item.startingDate="{ item }">
              {{ item.startingDate | friendlyDate }}
            </template>
            <template v-slot:item.active="{ item }">
              {{ item.active ? 'Activo' : 'Inactivo' }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                @click="editContract(item)"
                class="mx-1"
                :disabled="$store.state.session.user.userRole > 1"
                icon small color="secondary lighten-1"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                class="mx-1"
                icon
                small
                color="error lighten-1"
                :disabled="selectedClient.contracts.length < 2 || $store.state.session.user.userRole > 1"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
          <v-dialog v-model="contractInterface" :width="mobile ? '90%' : '60%'">
            <v-card>
              <ContractForm
                v-if="contractInterface"
                :collections="collections"
                :mobile="mobile"
                :editingContract="editingContract"
                :editingClient="selectedDocument"
                :contractIndex="contractIndex"
                @hideInterface="contractInterface = false"
              />
            </v-card>
          </v-dialog>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import EditClientForm from '@/components/clients/EditClientForm'
import ContractForm from '@/components/clients/ContractForm'
import moment from 'moment-timezone'
import Header from '@/components/generals/Header'
export default {

  name: 'ClientPanels',
  components: { EditClientForm, ContractForm, Header },
  props: ['collections', 'mobile'],

  data: () => {
    return {
      bottomSheet: false,
      editInterface: false,
      contractInterface: false,
      contractIndex: 0,
      selectedClient: {},
      editingContract: {},
      selectedDocument: {},
      panel: [],
      headers: [
        { text: 'Status', value: 'active' },
        { text: 'Inicio', value: 'startingDate'},
        { text: 'Acciones', value: 'actions'}
      ]
    }
  },

  filters: {

    friendlyDate (dateSubmitted) {
      return moment(dateSubmitted).parseZone('America/Caracas').format('DD [de] MMMM [de] YYYY')
    }

  },

  computed: {

    ...mapGetters(['formOptions']),

    clientsCopy () {
      return [...new Set(this.collections.Client)]
    }

  },

  methods: {

    ...mapActions(['updateDocument', 'findDocuments']),
    ...mapMutations(['showSnackbar']),

    activeContract (client) {
      return client.contracts.find(contract => contract.active)
    },

    productTypes (contract) {
      let labels = contract.products.map(c => c.productType)
      labels = [...new Set(labels)]
      return labels
    },

    editClient (client) {
      this.selectedDocument = Object.assign({}, client)
      this.editInterface = true
    },

    async showContracts (client) {
      const activeQry = { filter: { clientName: client.clientName }, collection: 'Active' }
      const maintenanceQry = {
        filter: { clientName: client.clientName, $or: [{ status: 'Por culminar' }, { status: 'Asignado' }] },
        collection: 'Maintenance'
      }
      const hasActiveServices = [...await this.findDocuments(activeQry), ...await this.findDocuments(maintenanceQry)].length
      console.log(hasActiveServices)
      if (hasActiveServices) return this.showSnackbar({ error: 'La información de contratos no puede ser editada mientras existan servicios activos para el cliente' })
      this.selectedClient = client
      this.bottomSheet = true
    },

    editContract (contract) {
      this.editingContract = Object.assign({}, contract) 
      this.selectedDocument = Object.assign({}, this.selectedClient)
      this.contractIndex = this.selectedClient.contracts.findIndex(i => i === contract)
      this.contractInterface = true
    },

    addContract (client) {
      this.selectedDocument = Object.assign({}, client)
      this.editingContract = null 
      this.contractInterface = true
    },

    confirmDelete (contract) {
      this.contractIndex = this.selectedClient.contracts.findIndex(i => i === contract)
      confirm('Por favor confirme, esta acción es irreversible') && this.deleteContract()
    },

    deleteContract () {
      const body = JSON.parse(JSON.stringify(this.selectedClient))
      body.contracts.splice(this.contractIndex, 1)
      this.updateDocument({ body, collection: 'Client' })
        .then(() => this.bottomSheet = false)
        .catch(() => this.bottomSheet = false)
    }
  }
}
</script>
