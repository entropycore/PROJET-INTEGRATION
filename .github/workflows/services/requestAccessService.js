import api from './api'

export const requestAccess = async (payload) => {
  const response = await api.post('/auth/register', payload)
  return response.data
}
