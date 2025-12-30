import { createRouter, createWebHistory } from 'vue-router'
import SignIn from './pages/SignIn.vue'
import SignUp from './pages/SignUp.vue'

const routes = [
  { path: '/', redirect: '/signin' },
  { path: '/signin', component: SignIn },
  { path: '/signup', component: SignUp }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})


