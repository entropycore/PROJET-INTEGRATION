import axios from 'axios'
import { useAuthStore } from '../stores/auth'
const apiBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true //je retente une fois apres avoir renouvelé le token
       try {
         await api.post('/auth/refresh-token')
         return api(originalRequest)
       } catch {
         authStore.clearAuthSession()
         window.location.href = '/login'
         return Promise.reject(error)
}
    }
    // 403 — Accès refusé
    if (error.response?.status === 403) {
      window.location.href = '/403'
    }
    return Promise.reject(error)
  }
)

export default api
