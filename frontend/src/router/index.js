import { createRouter, createWebHistory } from 'vue-router'

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
        }
    ]
})
  

export default router
