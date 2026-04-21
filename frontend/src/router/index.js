import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RequestAccessView from '../views/RequestAccessView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
          path: '/',
          redirect: '/login',
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/request-access',
            name: 'request-access',
            component: RequestAccessView,
        }
    ]
})
  

export default router
