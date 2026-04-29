import axios from 'axios'

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
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true //je retente une fois apres avoir renouvelé le token
      await api.post('/auth/refresh-token')
      return api(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default api
