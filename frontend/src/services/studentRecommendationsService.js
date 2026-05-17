import api from './api'
import { studentRecommendationsMock } from '@/mockData/studentRecommendations.mock'

export const getStudentRecommendations = (params = {}) => {
  return api.get('/student/recommendations', { params })
}

export const getRecommendationDetails = (id) => {
  return api.get(`/recommendations/${id}`)
}

export const updateRecommendationVisibility = (id, visibility) => {
  return api.patch(`/student/recommendations/${id}/visibility`, {
    visibility,
  })
}

export const updateRecommendationStatus = (id, status) => {
  return api.patch(`/student/recommendations/${id}/status`, {
    status,
  })
}

export const reportRecommendation = (id, reason) => {
  return api.post(`/recommendations/${id}/report`, {
    reason,
  })
}

export const getStudentRecommendationsData = async (params = {}) => {
  try {
    const response = await getStudentRecommendations(params)

    return {
      ...studentRecommendationsMock,
      ...response.data,
    }
  } catch (error) {
    console.warn('Mock recommendations utilisé.')
    return studentRecommendationsMock
  }
}