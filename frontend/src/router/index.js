import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RequestAccessView from '../views/RequestAccessView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import StudentDashboard from '../views/student/Dashboard.vue'
import ProfessorDashboard from '../views/professor/Dashboard.vue'
import ProfessionalDashboard from '../views/professional/Dashboard.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

import { useAuthStore } from '../stores/auth'

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
        },
        {
            path: '/verify-email',
            name: 'verify-email',
            component: VerifyEmailView,
        },
        {
  path: '/admin',
  component: DashboardLayout,
  meta: { requiresAuth: true, roles: ['ADMINISTRATOR'] },
  children: [
    {
      path: '',
      name: 'admin-dashboard',
      component: AdminDashboard,
    },
    {
      path: 'users',
      name: 'admin-users',
      component: () => import('../views/admin/Users.vue'),
    },
    {
      path: 'validations',
      name: 'admin-validations',
      component: () => import('../views/admin/Validations.vue'),
    },
    {
      path: 'notifications',
      name: 'admin-notifications',
      component: () => import('../views/Notifications.vue'),
    },
    {
      path: 'profile',
      name: 'admin-profile',
      component: () => import('../views/Profile.vue'),
    },
  ],
},
        {
            path: '/student',
            component: StudentDashboard,
            meta: { requiresAuth: true, roles: ['STUDENT'] },
        },
        {
            path: '/professor',
            component: ProfessorDashboard,
            meta: { requiresAuth: true, roles: ['PROFESSOR'] },
        },
        {
            path: '/professional',
            component: ProfessionalDashboard,
            meta: { requiresAuth: true, roles: ['PROFESSIONAL'] },
        }
    ]
})
router.beforeEach((to) => {
    const authStore = useAuthStore()//condition de verification de connexion
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return {
        path: '/login',
        query: { error: 'unauthorized' },
      }
    }
    if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) { //condition de mismatch de roles
        return {
          path: '/login',
          query: { error: 'unauthorized' },
        }
    }
    return true
})
  

export default router
