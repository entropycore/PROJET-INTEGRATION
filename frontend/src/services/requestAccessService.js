import api from './api'

export const requestAccess = async (payload) => {
  const response = await api.post('/access-requests', payload) //a verifier avec back
  return response.data
}