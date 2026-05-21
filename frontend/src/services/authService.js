import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const login = (payload) => apiClient.post('/auth/login', payload)
export const getMe = () => apiClient.get('/auth/me')
export const verifyEmail = (token) => apiClient.get('/auth/verify-email', { params: { token } })
export const forgotPassword = (email) => apiClient.post('/auth/forgot-password', { email })
export const resetPassword = (payload) => apiClient.post('/auth/reset-password', payload)
export const logout = () => apiClient.post('/auth/logout')
