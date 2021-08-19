import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import axios from 'axios'
import excel from 'vue-excel-export'
import vueSession from 'vue-session'

axios.defaults.baseURL = 'http://localhost:3000/api'
// axios.defaults.baseURL = 'https://edea-v2.herokuapp.com/api'

Vue.config.productionTip = false
Vue.use(vueSession)
Vue.use(excel)

new Vue({
  router,
  store,
  vueSession,
  vuetify,
  render: h => h(App)
}).$mount('#app')
