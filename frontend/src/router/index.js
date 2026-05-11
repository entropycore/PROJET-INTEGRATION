import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getMe } from '../services/authService'

/* Imports des vues principales */
import LoginView from '../views/LoginView.vue'
import RequestAccessView from '../views/RequestAccessView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import LandingView from '../views/LandingView.vue' // Ajout de la Landing Page

/* Imports des tableaux de bord par rôle */
import AdminDashboard from '../views/admin/Dashboard.vue'
import StudentDashboard from '../views/student/Dashboard.vue'
import ProfessorDashboard from '../views/professor/Dashboard.vue'
import ProfessionalDashboard from '../views/professional/Dashboard.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            /* Changement : La Landing Page est maintenant la racine */
            path: '/',
            name: 'landing',
            component: LandingView,
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
      path: 'users/create',
      name: 'admin-user-create',
      component: () => import('../views/admin/UserCreate.vue'),
    },
    {
      path: 'users/:userId',
      name: 'admin-user-details',
      component: () => import('../views/admin/UserDetails.vue'),
    },
    {
      path: 'users/:userId/edit',
      name: 'admin-user-edit',
      component: () => import('../views/admin/UserDetails.vue'),
    },
    {
      path: 'validations',
      name: 'admin-validations',
      component: () => import('../views/admin/Validations.vue'),
    },
    {
      path: 'profiles',
      name: 'admin-profiles',
      component: () => import('../views/profiles.vue'),
    },
    {
      path: 'notifications',
      name: 'admin-notifications',
      component: () => import('../views/Notifications.vue'),
      meta: { baseApi: '/api/admin' }
    },
    {
      path: 'badges',
      name: 'admin-badges',
      component: () => import('../views/admin/Badges.vue'),
    },
    {
    path: 'settings',
    name: 'admin-settings',
    component: () => import('../views/Settings.vue'),
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
        component: DashboardLayout,
        meta: { role: 'STUDENT' },
        children: [
            {
            path: '',
            name: 'Studentdashboard',
            component: () => import('@/views/student/Dashboard.vue'),
            },
            {
            path: 'profile',
            name: 'StudentProfile',
            component: () => import('@/views/student/Profile.vue'),
            },
            {
            path: 'projects',
            name: 'StudentProjects',
            component: () => import('@/views/student/Projects/Projects.vue'),
            },
            {
              path: 'projects/:id',
              name: 'StudentProjectDetails',
              component: () => import('@/views/student/Projects/ProjectsDetails.vue'),
            },
            {
              path: 'projects/:id/edit',
              name: 'StudentProjectEdit',
              component: () => import('@/views/student/Projects/ProjectEdit.vue'),
            },
            {
            path: '/student/stages',
            name: 'student-stages',
            component: () => import('@/views/student/stages/StagesView.vue'),
            },
            {
            path: '/student/stages/create',
            name: 'student-stage-create',
            component: () => import('@/views/student/stages/StageFormView.vue'),
            },
            {
            path: '/student/stages/:id',
            name: 'student-stage-details',
            component: () => import('@/views/student/stages/StageDetailsView.vue'),
            },
            {
            path: '/student/stages/:id/edit',
            name: 'student-stage-edit',
            component: () => import('@/views/student/stages/StageFormView.vue'),
            },
            {
            path: 'activities',
            name: 'StudentActivities',
            component: () => import('@/views/student/Activities.vue'),
            },
            {
            path: 'competances',
            name: 'Studentcompetances',
            component: () => import('@/views/student/competances.vue'),
            },
            {
            path: 'badges',
            name: 'Studentbadges',
            component: () => import('@/views/student/Badges.vue'),
            },
            {
            path: 'portfolio',
            name: 'StudentPortfolio',
            component: () => import('@/views/student/Portfolio.vue'),
            },
            {
            path: 'github',
            name: 'StudentGithub',
            component: () => import('@/views/student/Github.vue'),
            },
            {
            path: 'recommendations',
            name: 'StudentRecommendations',
            component: () => import('@/views/student/Recommendations.vue'),
            },
            {
            path: 'recommendation-letters',
            name: 'StudentRecommendationLetters',
            component: () => import('@/views/student/RecommendationLetters.vue'),
            },
            {
            path: 'comments',
            name: 'StudentComments',
            component: () => import('@/views/student/comments.vue'),
            },
            {
            path: "notifications",
            name: "student-notifications",
            component: () => import("../views/Notifications.vue"),
            meta: { baseApi: "/api/student" },
            }
        ],
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
    const authStore = useAuthStore()

    /* Vérification de la session si nécessaire */
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        try {
            const meResponse = await getMe()
            authStore.setAuthSession(meResponse.data.data)
        } catch {
            authStore.clearAuthSession()
        }
    }

    /* Redirection si l'accès nécessite une authentification */
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return {
            path: '/login',
            query: { error: 'unauthorized' },
        }
    }

    /* Changement : Rediriger l'utilisateur vers son dashboard s'il est déjà connecté */
    if (authStore.isAuthenticated && (to.name === 'landing' || to.name === 'login')) {
        const role = authStore.user?.role
        if (role === 'ADMINISTRATOR') return { name: 'admin-dashboard' }
        if (role === 'STUDENT') return { path: '/student' }
        if (role === 'PROFESSOR') return { path: '/professor' }
        if (role === 'PROFESSIONAL') return { path: '/professional' }
    }

    /* Vérification des permissions par rôle */
    if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
        return { path: '/403' }
    }

    return true
})

export default router