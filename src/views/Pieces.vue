<template>
  <v-container>
    <Header title="Artículos" subtitle="Administre las piezas registradas" />
    <v-row align="center">
      <v-col md="3">
        <v-text-field v-model="tableFilter" prepend-inner-icon="mdi-magnify" label="Filtrar" />
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="collections.Piece"
      :search="tableFilter"
    >
      <template v-slot:top>
        <v-btn
          class="ma-1"
          @click="showPieceForm(null)"
          small
          color="secondary"
        >
          <v-icon left>mdi-plus</v-icon>
          Agregar
        </v-btn>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="showPieceForm(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
    <v-dialog
      v-model="dialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <PieceForm
          v-if="dialog"
          :editing="selectedDocument"
          :collections="collections"
          :mobile="mobile"
          @hideInterface="hideInterface"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

import Header from '@/components/generals/Header'
import PieceForm from '@/components/storehouse/PieceForm'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Pieces',
  components: { Header, PieceForm },

  data: () => {
    return {
      tableFilter: '',
      headers: [
        {
          text: 'Descripción',
          align: 'start',
          value: 'description'
        },
        { text: 'Código', value: 'code' },
        { text: 'Categoria', value: 'pieceCategory' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ],
      dialog: false,
      selectedDocument: {}
    }
  },

  computed: {

    ...mapState(['collections']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }

  },

  methods: {

    ...mapActions(['deleteDocument']),

    showPieceForm (edit) {
      if (edit) this.selectedDocument = Object.assign({}, edit)
      else this.selectedDocument = null
      this.dialog = true
    },

    hideInterface () {
      this.dialog = false
      this.selectedDocument = Object.assign({}, {})
    },

    deleteItem (body) {
      confirm('Por favor confirme que desea eliminar este artículo') && this.deleteDocument({ collection: 'Piece', body })
    }

  }
}
</script>
