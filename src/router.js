import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import SignIn from './pages/SignIn.vue'
import SignUp from './pages/SignUp.vue'
import NewQuiz from './pages/NewQuiz.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/new-quiz', component: NewQuiz },
  { path: '/signin', component: SignIn },
  { path: '/signup', component: SignUp }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

