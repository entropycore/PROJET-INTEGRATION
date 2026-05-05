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
import { getMe } from '../services/authService'

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
      path: 'profiles',
      name: 'admin-profiles',
      component: () => import('../views/Profiles.vue'),
    },
    {
      path: 'notifications',
      name: 'admin-notifications',
      component: () => import('../views/Notifications.vue'),
      meta: { baseApi: '/api/professional' }
    },
    {
      path: 'badges',
      name: 'admin-badges',
      component: () => import('../views/admin/Badges.vue'),
    },
    {
      path: 'profile',
      name: 'admin-profile',
      component: () => import('../views/Profile.vue'),
    },
    {
        path: 'reports',
        name: 'admin-reports',
        component: () => import('../views/admin/Reports.vue'),
        }
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
        },
        {
            path: '/403',
            name: 'not-authorized',
            component: () => import('../views/NotAuthorized.vue'),
        }
    ]
})
router.beforeEach(async (to) => {
    const authStore = useAuthStore()//condition de verification de connexion

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      try {
        const meResponse = await getMe()
        authStore.setAuthSession(meResponse.data.data)
      } catch {
        authStore.clearAuthSession()
      }
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return {
        path: '/login',
        query: { error: 'unauthorized' },
      }
    }
    if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    return {
      path: '/403',
    }
}
    return true
})
  

export default router
