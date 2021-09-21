import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Corrective from '../views/Corrective.vue'
import Preventive from '../views/Preventive.vue'
import Consultation from '../views/Consultation.vue'
import Pieces from '../views/Pieces.vue'
import Requests from '../views/Requests.vue'
import Dispatches from '../views/Dispatches.vue'
import Clients from '../views/Clients.vue'
import Products from '../views/Products.vue'
import Offices from '../views/Offices.vue'
import Users from '../views/Users.vue'
import Login from '../views/Login.vue'
import Test from '../views/Test.vue'

// import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/test',
    name: 'Test',
    component: Test
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/correctivo',
    name: 'Corrective',
    component: Corrective
  },
  {
    path: '/consultas',
    name: 'Consultation',
    component: Consultation
  },
  // Storehouse
  {
    path: '/piezas',
    name: 'Pieces',
    component: Pieces,
    meta: { adminOnly: true }
  },
  {
    path: '/solicitudes',
    name: 'Requests',
    component: Requests
  },
  {
    path: '/despachos',
    name: 'Dispatches',
    component: Dispatches
  },
  {
    path: '/clientes',
    name: 'Clients',
    component: Clients
  },
  {
    path: '/productos',
    name: 'Products',
    component: Products,
    meta: { adminOnly: true }
  },
  {
    path: '/preventivo',
    name: 'Preventive',
    component: Preventive
  },
  {
    path: '/oficinas',
    name: 'Offices',
    component: Offices
  },
  {
    path: '/usuarios',
    name: 'Users',
    component: Users,
    meta: { adminOnly: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// router.beforeEach((to, from, next) => {
//   const routeIsPrivate = to.matched.some(item => item.meta.adminOnly)
//   if (routeIsPrivate && !store.state.session.user.userRole > 1) {
//     console.log(store.state)
//     store.commit('showSnackbar', { error: 'Ha intentado acceder a una ruta privada' })
//     next('/')
//   } else {
//     console.log(routeIsPrivate, store.state.session.user.userRole)
//     next()
//   }
// })

export default router
