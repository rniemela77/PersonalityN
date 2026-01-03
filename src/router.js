import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import SignIn from './pages/SignIn.vue'
import SignUp from './pages/SignUp.vue'
import NewQuiz from './pages/NewQuiz.vue'
import Quiz from './pages/Quiz.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/new-quiz', component: NewQuiz },
  { path: '/quiz/local/:slug', component: Quiz },
  { path: '/quiz/:id', component: Quiz },
  { path: '/signin', component: SignIn },
  { path: '/signup', component: SignUp }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

