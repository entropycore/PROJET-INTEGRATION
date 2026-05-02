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

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true //je retente une fois apres avoir renouvelé le token
      try {
        await api.post('/auth/refresh-token')
        return api(originalRequest)
      } catch (refreshError) {
        const authStore = useAuthStore()
        authStore.clearAuthSession()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
