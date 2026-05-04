import api from './api'

export const getDashboard = async (roleArea) => {
  const response = await api.get(`/${roleArea}/dashboard`)
  return response.data
}

export const getProfile = async (roleArea) => {
  const response = await api.get(`/${roleArea}/profile`)
  return response.data
}
