<template>
  <v-container>
    <Header title="Usuarios" subtitle="Gestione la información básica" />
    <v-data-table :items="collections.User" :headers="headers" :loading="updatingState">
      <template v-slot:item.role="{ item }">
        {{ item.userRole | roles }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list color="primary" dark dense>
            <v-list-item-group>
              <v-list-item @click="editUser(item)">
                <v-list-item-icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    Editar
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="confirmDelete(item)">
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

    <MainButton @showForm="signInterface = true" :updatingState="updatingState" />

    <v-dialog :width="mobile ? '90%' : '60%'" persistent v-model="signInterface">
      <v-card>
        <SignForm
          v-if="signInterface"
          :mobile="mobile"
          :editing="editing"
          @hideInterface="hideInterface"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

import Header from '@/components/generals/Header'
import SignForm from '@/components/users/SignForm'
import { mapState, mapActions } from 'vuex'
import MainButton from '@/components/generals/MainButton'

export default {
  name: 'Users',
  components: { Header, MainButton, SignForm },
  data: () => ({
    signInterface: false,
    editing: null,
    headers: [
      { text: 'Nombre', value: 'firstName' },
      { text: 'Apellido', value: 'lastName' },
      { text: 'Departamento', value: 'department' },
      { text: 'Rol', value: 'role' },
      { text: 'Acciones', value: 'actions' }
    ]
  }),
  
  filters: {
    roles (num) {
      if (num == 0) return 'root'
      if (num == 1) return 'Administrador'
      if (num == 2) return 'Usuario'
      if (num == 3) return 'Invitado'
    }
  },

  computed: {

    ...mapState(['updatingState', 'collections']),

    mobile () {
      return this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm'
    }

  },

  methods: {

    ...mapActions(['deleteDocument']),

    editUser (user) {
      this.editing = Object.assign({}, user)
      this.signInterface = true
    },

    confirmDelete (user) {
      confirm('Esta acción es irreversible, por favor confirme') && this.deleteUser(user)
    },

    deleteUser (body) {
      this.deleteDocument({ collection: 'User', body })
        .then(() => { return })
        .catch(() => { return })
    },

    hideInterface () {
      this.signInterface = false
      this.editing = null
    }

  }
}
</script>
