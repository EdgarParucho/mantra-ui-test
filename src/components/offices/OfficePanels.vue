<template>
  <div>
    <v-data-table :items="formOptions.clients" :headers="table1Headers">
      <template v-slot:item.actions="{ item }">
        <v-btn @click="showBottomSheet(item.clientName)" icon small color="primary">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <v-bottom-sheet v-model="bottomSheet" scrollable>
      <v-card v-if="clientOffices">
        <Header
          closable="1"
          title="Red de oficinas"
          @hideInterface="bottomSheet = false"
        />
        <v-card-text>
          <v-row>
            <v-col :cols="mobile ? 6 : 2">
              <v-text-field v-model="tableFilter" prepend-inner-icon="mdi-magnify" />
            </v-col>
          </v-row>
          <v-data-table dense :items="clientOffices" :search="tableFilter" :headers="table2Headers">
            <template v-slot:item.lastMaintenance="{ item }">
              {{ item.lastMaintenance | friendlyDate }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-menu>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" icon color="primary">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list color="primary" dark dense>
                  <v-list-item-group>
                    <v-list-item @click="editOffice(item)">
                      <v-list-item-icon>
                        <v-icon>mdi-pencil</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>
                          Editar
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item
                      @click="confirmDelete(item)"
                      :disabled="$store.state.session.user.userRole > 1"
                    >
                      <v-list-item-icon>
                        <v-icon>mdi-delete</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>
                          Eliminar
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>

import moment from 'moment-timezone'
import { mapState, mapGetters, mapActions } from 'vuex'
import Header from '@/components/generals/Header'

export default {

  name: 'OfficePanels',
  components: { Header },
  props: ['collections', 'mobile'],

  data: () => {
    return {
      panel: [],
      bottomSheet: false,
      tableFilter: '',
      serviceMenu: [
        { action: 'edit', title: 'Editar', icon: 'mdi-pencil' },
        { action: 'delete', title: 'Eliminar', icon: 'mdi-delete' },
      ],
      table1Headers: [
        { text: 'Cliente', value: 'clientName' },
        { text: 'Oficinas', value: 'actions' }
      ],
      table2Headers: [
        { text: 'Oficina', value: 'officeName' },
        { text: 'Estado', value: 'officeState'},
        { text: 'Región', value: 'region'},
        { text: 'Acciones', value: 'actions'}
      ],
      clientOffices: [],
      dialog: false,
      selectedInventory: []
    }
  },

  filters: {
    friendlyDate (dateSubmitted) {
      return moment(dateSubmitted).parseZone('America/Caracas').format('DD [de] MMMM [de] YYYY')
    }
  },

  computed: {
    ...mapState(['selectedDocument']),
    ...mapGetters(['formOptions'])
  },

  methods: {

    ...mapActions(['updateDocument', 'deleteDocument']),

    activeContract (client) {
      return client.contracts.find(contract => contract.active)
    },

    showBottomSheet (client) {
      this.clientOffices = this.collections.Office.filter(office => office.clientName === client)
      this.bottomSheet = true
    },

    editOffice (office) {
      this.bottomSheet = false
      this.$emit('editOffice', office)
    },

    confirmDelete (office) {
      confirm('Esta acción es irreversible, por favor confirme') && this.deleteOffice(office)
    },

    deleteOffice (body) {
      this.deleteDocument({ collection: 'Office', body })
        .then(() => this.bottomSheet = false)
        .catch(() => this.bottomSheet = false)
      this.tableFilter = ''
    }

  }
}
</script>
