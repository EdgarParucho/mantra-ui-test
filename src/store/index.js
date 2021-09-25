import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import moment from 'moment-timezone'

const unhandled = 'Error inesperado. Verifique la conexión, recargue la página e intente nuevamente'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    updatingState: false,
    collections: {
      Active: [],
      Client: [],
      Closed: [],
      Email: [],
      Maintenance: [],
      Office: [],
      Piece: [],
      Product: [],
      Request: [],
      User: []
    },
    session: { user: null, token: null },
    // App's alert: 
    snackbar: { activated: false, title: '', message: '', error: '' }
  },

  mutations: {

    logIn (state, session) {
      state.session = session
    },

    logOut (state) {
      state.session = {
        user: null,
        token: null
      }
    },

    toggleLoader (state) {
      state.updatingState = !state.updatingState
    },

    showSnackbar (state, { error, message }) {
      state.snackbar = {
        activated: true,
        title: error ? 'Acción denegada' : 'Acción realizada',
        message: error || message,
        error
      }
    },

    setCollection (state, collection) {
      state.collections[collection.name] = collection.data
    },

    addNewDocument (state, { collection, body }) {
      if (!state.collections[collection]) return
      state.collections[collection].push(body)
    },

    updateDocument (state, { collection, body }) {
      if (!state.collections[collection]) return
      const index = state.collections[collection].findIndex(item => item._id === body._id)
      if (index !== -1) state.collections[collection].splice(index, 1, body)
    },

    removeDocument (state, { collection, body }) {
      if (!state.collections[collection]) return
      const index = state.collections[collection].findIndex(item => item._id === body._id)
      if (index !== -1) state.collections[collection].splice(index, 1)
    },

    setRelatedDocuments (state, relatedDocuments) {
      const index = state.collections.Active.findIndex(document => document.serialCode === relatedDocuments.serialCode)
      const updated = Object.assign({}, state.collections.Active[index])
      updated.relatedDocuments = relatedDocuments.data
      state.collections.Active.splice(index, 1, updated)
    }

  },

  actions: {

    logIn ({ commit }, user) {
      return new Promise ((resolve, reject) => {
        axios.post('/login', user)
          .then(({ data }) => {
            if (data.error) return reject(commit('showSnackbar', { error: data.error }))
            else {
              commit('logIn', data),
              commit('showSnackbar', { message: `${data.user.firstName}, te damos la bienvenida` }),
              resolve(data)
            }
          })
          .catch((error) => {
            commit('showSnackbar', { error: unhandled })
            reject(error)
            console.error(error)
          })
      })
    },

    getcollections ({ state, dispatch, commit }) {
      commit('toggleLoader')
      const collections = Object.keys(state.collections)
      const actions = []

      for (const collection of collections) actions.push(dispatch('getCollection', collection))

      Promise.all(actions)
        .then(() => commit('toggleLoader'))
        .catch((error) => {
          commit('showSnackbar', { error: unhandled })
          console.error(error)
        })
    },

    getCollection ({ state, commit }, collection) {
      let filter = 'all'

      if (collection === 'Closed' || collection === 'Maintenance') {
        const thisYearFirst = `${moment(new Date()).format('yyyy')}-01-01`
        filter = thisYearFirst
      }

      return new Promise ((resolve, reject) => {
        axios.get(`/${collection}/${filter}`, { headers: { 'auth-token': state.session.token } })
          .then(({ data }) => {
            if (data.error) return reject(commit('showSnackbar', { error: data.error }))
            else resolve(commit('setCollection', { name: collection, data }))
          })
          .catch((error) => reject(
            commit('showSnackbar', { error: unhandled }),
            console.error(error)
          ))
      })

    },

    createDocument ({ state, commit }, { collection, body }) {
      commit('toggleLoader')
      return new Promise ((resolve, reject) => {
        axios.post(collection, body, { headers: { 'auth-token': state.session.token } })
          .then(({ data }) => {
            if (data.error) return reject(commit('showSnackbar', { error: data.error }))
            else resolve(
              commit('addNewDocument', { collection, body: data }),
              commit('showSnackbar', { message: 'Base de datos actualizada' })
            )
          })
          .catch((error) => reject(
            commit('showSnackbar', { error: unhandled }),
            console.error(error)
          ))
          .finally(() => commit('toggleLoader'))
      })
    },

    deleteDocument ({ state, commit }, { collection, body }) {
      commit('toggleLoader')
      return new Promise ((resolve, reject) => {
        axios.delete(`/${collection}/${body._id}`, { headers: { 'auth-token': state.session.token } })
          .then(({ data }) => {
            if (data.error) return reject(commit('showSnackbar', { error: data.error }))
            else resolve(
              commit('removeDocument', { collection, body: data }),
              commit('showSnackbar', { message: 'Base de datos actualizada' })
            )
          })
          .catch((error) => reject(
            commit('showSnackbar', { error: unhandled }),
            console.error(error)
          ))
          .finally(() => commit('toggleLoader'))
      })
    },

    updateDocument ({ state, commit }, { collection, body }) {
      return new Promise ((resolve, reject) => {
        axios.put(`/${collection}/${body._id}`, body, { headers: { 'auth-token': state.session.token } })
          .then(({ data }) => {
            if (data.error) return reject(commit('showSnackbar', { error: data.error }))
            else resolve(
              commit('updateDocument', { collection, body: data }),
              commit('showSnackbar', { message: 'Base de datos actualizada' })
            )
          })
          .catch((error) => reject(
            commit('showSnackbar', { error: unhandled }),
            console.error(error)
          ))
      })
    },

    updateDocuments ({ state, commit, dispatch }, { collection, query, update, options }) {
      return new Promise ((resolve, reject) => {
        axios.put(`/updateMany/${collection}`, { query, update, options }, { headers: { 'auth-token': state.session.token } })
          .then(({ data }) => {
            if (data.error) return reject(commit('showSnackbar', { error: data.error }))
            else if (state.collections[collection] && data.nModified) dispatch('getCollection', collection)
              .then(() => commit('showSnackbar', { message: 'Base de datos actualizada' }), resolve())
          })
          .catch((error) => reject(
            commit('showSnackbar', { error: unhandled }),
            console.error(error)
          ))
      })
    },

    findDocuments ({ state, commit }, request) {
      return new Promise ((resolve, reject) => {
        axios.post(`/find/${request.collection}`, { filter: request.filter }, { headers: { 'auth-token': state.session.token } })
          .then(({ data }) => {
            if (data.error) return reject(commit('showSnackbar', { error: data.error }))
            else resolve(data)
          })
          .catch((error) => reject(
            commit('showSnackbar', { error: unhandled }),
            console.error(error)
          ))
      })
    },

    sendEmail ({ state, commit }, emails) {
      return new Promise((resolve, reject) => {
        axios.post('/sendmail', { emails }, { headers: { 'auth-token': state.session.token } })
          .then(({ data }) => {
            console.log(data) 
            if (data.command) {
              console.log('Save this emails and try resend', emails)
              reject(commit('showSnackbar', { error: 'Ocurrió un error, el correo no pudo ser enviado' }))
            }
            else resolve(commit('showSnackbar', { message: 'Usuario notificado vía correo' }))
          })
          .catch((e) => reject(e))
      })
    }

  },

  getters: {

    formOptions ({ collections, session }) {
      const token = session.token
      const thisYearFirst = `${moment(new Date()).format('yyyy')}-01-01`
      const user = {
        fullName: session.user
          ? `${session.user.firstName} ${session.user.lastName}`
          : '',
        _id: session.user
          ? session.user._id
          : ''
      }
      const clients = []
      const clientNames = collections.Client.map(client => client.clientName).sort()
      for (const clientName of clientNames) clients.push(collections.Client.find(service => service.clientName === clientName))
      const clientsWithContract = collections.Client.filter(client => client.contracts.find(contract => contract.active))
      const pendingMaintenance = collections.Office.filter(office => !office.lastMaintenance || office.lastMaintenance < thisYearFirst)
      const productTypes = collections.Product.map(product => product.productType)
      const techniciansData = collections.User.filter(user => user.assignable).sort((a, b) => {
        if (a.firstName > b.firstName) return 1
        else return -1
      })
      const technicians = []
      if (techniciansData.length) for (let technician of techniciansData) {
        const fullName = `${technician.firstName} ${technician.lastName}`
        technicians.push({ text: fullName, value: { fullName, _id: technician._id } })
      }
      const emailAccounts = []
      if (collections.User.length) for (let user of collections.User) {
        const text = `${user.firstName} ${user.lastName}`
        const value = user.email
        emailAccounts.push({ text, value })
      }
      let categories = collections.Product.map(product => product.categories)
      function mergeArr(...arr) {
        return arr.reduce((acc, val) => {
          return [...acc, ...new Set(val)]
        }, [])
      }
      categories = mergeArr(categories)[0]

      return {
        categories,
        clients,
        clientNames,
        clientsWithContract,
        emailAccounts,
        pendingMaintenance,
        productTypes,
        technicians,
        token,
        user
      }
    }
    
  }
})
