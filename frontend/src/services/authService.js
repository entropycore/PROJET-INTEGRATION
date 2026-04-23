import api from './api'

export const login = async ({ email, password }) => {
  const response = await api.post('/login', {
    email,
    password,
  })

  return response.data
}

export const getMe = async () => {
  const response = await api.get('/me')
  return response
}

export const logout = async () => {
  const response = await api.post('/logout')
  return response.data
}

export const refreshToken = async () => {
  const response = await api.post('/refresh-token')
  return response.data
}

export const verifyEmail = async (token) => {
  const response = await api.get('/verify-email', {
    params: { token },
  })

  return response.data
}
