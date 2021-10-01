<template>
  <v-container>
    <Header
      closable="1"
      title="Formulario de registro"
      subtitle="Complete la información del formulario"
      @hideInterface="$emit('hideInterface')"
    />
    <v-card-text>
      <v-form v-model="form" ref="form">
        <v-row>
          <v-text-field
            class="mx-1"
            v-model="pieceForm.code"
            :rules="rules.required"
            maxlength="30"
            counter="30"
            label="Código"
          />
        </v-row>
        <v-row>
          <v-text-field
            class="mx-1"
            v-model="pieceForm.pieceName"
            :rules="rules.required"
            label="Nombre"
            counter="140"
            maxlength="140"
            hint="Nombre para mostrar al usuario"
          />
        </v-row>
        <v-row>
          <v-textarea
            class="mx-1"
            v-model="pieceForm.description"
            label="Descripción"
            counter="140"
            maxlength="140"
            rows="1"
            auto-grow
            :rules="rules.required"
          />
        </v-row>
        <v-row>
          <v-col cols="3">
            <v-text-field
              v-model="pieceForm.stock"
              label="Stock"
              type="number"
            />
          </v-col>
          <v-col cols="9">
            <v-select
              v-model="pieceForm.pieceCategory"
              label="Categoria"
              :items="collections.Product.map((i) => i.productType)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              v-model="pieceForm.asociatedProducts"
              allow-overflow
              deletable-chips
              multiple
              small-chips
              :items="filteredItems.map((i) => i.productName)"
              label="Productos asociados"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-row v-if="requiresMassiveUpdate" align="center">
      <v-col>
        <UpdateWarning triggeringProp="Nombre de pieza" :modifies="DependenciesNames" />
      </v-col>
    </v-row>
    <v-card-actions>
      <v-btn
        class="mx-auto"
        :disabled="!form"
        :loading="loader"
        color="primary"
        block
        @click="save(pieceForm)"
      >
        Guardar
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script>

import { mapMutations, mapActions } from 'vuex'
import { rules } from '@/helpers/form'
import Header from '@/components/generals/Header'
import UpdateWarning from '@/components/generals/UpdateWarning.vue'

export default {
  name: 'PieceForm',
  components: { Header, UpdateWarning },
  props: ['collections', 'mobile', 'editing'],

  data: () => {
    return {
      form: false,
      loader: false,
      pieceForm: {
        asociatedProducts: [],
        pieceName: '',
        stock: '',
        pieceCategory: '',
        code: '',
        description: ''
      },
      defaultItem: {
        asociatedProducts: [],
        pieceName: '',
        stock: 99,
        pieceCategory: '',
        code: '',
        description: ''
      },
      rules,
      DependenciesNames: [
      'Reportes activos', 'Reportes cerrados',
      'Solicitudes', 'Despachos'
    ],

    }
  },

  created () {
    if (this.editing) return this.pieceForm = Object.assign({}, this.editing)
    else this.pieceForm = Object.assign({}, this.defaultItem)
  },

  computed: {

    filteredItems () {
      const filteredPieces = this.collections.Product.filter(n => n.productType === this.pieceForm.pieceCategory)
      return filteredPieces
    },

    requiresMassiveUpdate () {
      if (!this.editing) return
      else return (this.editing.pieceName !== this.pieceForm.pieceName)
    }

  },

  methods: {

    ...mapMutations(['showSnackbar']),
    ...mapActions(['createDocument', 'updateDocument', 'updateDocuments', 'findDocuments']),

    async preventDuplicity (form) {
      const { code, _id } = form
      const filter = { code, _id: { "$ne": _id || null } }
      const res = await this.findDocuments({ collection: 'Piece' , filter })
      if (res.length) return this.showSnackbar({ message: 'Registrado anteriormente, verifique el código' }), true
      else return false
    },

    async save (body) {
      this.loader = true
      const registeredBefore = await this.preventDuplicity(body)
      if (registeredBefore) return this.loader = false
      if (this.editing) return this.update({ collection: 'Piece', body })
      else this.create({ collection: 'Piece', body })
    },

    update (document) {
      this.updateDocument(document)
        .then(() => { if (this.requiresMassiveUpdate) this.updateDependencies(document) })
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    },

    updateDependencies ({ body }) {
      const actions = []
      const query = { pieceName: this.editing.pieceName }
      const update = { pieceName: body.pieceName }
      const collections = this.dependencies(query, update)
      for (const collection of collections) actions.push(this.updateDocuments(collection))
      Promise.all(actions)
    },

    dependencies (query, update) {
      return [
        {
          collection: 'Active',
          query: { "pieces.pieceName": query.pieceName },
          update: { $set: {"pieces.$[piece].pieceName": update.pieceName } },
          options: {
            arrayFilters: [{ "piece.pieceName": query.pieceName }]
          }
        },
        {
          collection: 'Closed',
          query: { "pieces.pieceName": query.pieceName },
          update: { $set: {"pieces.$[piece].pieceName": update.pieceName } },
          options: {
            arrayFilters: [{ "piece.pieceName": query.pieceName }]
          }
        },
        { collection: 'Request', query, update, options: {} },
        { collection: 'Dispatch', query, update, options: {} },
      ]
    },

    create (document) {
      this.createDocument(document)
        .then(() => this.$emit('hideInterface'))
        .catch(() => this.loader = false)
    }
  }
}
</script>