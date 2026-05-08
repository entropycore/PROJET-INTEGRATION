import api from './api'

// BACKEND PLUS TARD :
// Le contrat actuel utilise /api/v1/internships...
// Mais côté frontend on garde temporairement /student/stages
// pour rester cohérent avec les routes admin déjà utilisées.

// get stages
export const getStudentStages = (params = {}) => {
  return api.get('/student/stages', { params })
}

// get stage by id
export const getStudentStageById = (id) => {
  return api.get(`/student/stages/${id}`)
}

// create stage
export const createStudentStage = (data) => {
  return api.post('/student/stages', data)
}

// update stage
export const updateStudentStage = (id, data) => {
  return api.put(`/student/stages/${id}`, data)
}

// delete stage
export const deleteStudentStage = (id) => {
  return api.delete(`/student/stages/${id}`)
}

// submit validation
export const submitStudentStageValidation = (id) => {
  return api.post(`/student/stages/${id}/submit-validation`)
}

// change visibility
export const updateStudentStageVisibility = (id, visibility) => {
  return api.patch(`/student/stages/${id}/visibility`, { visibility })
}

// upload report
export const uploadStudentStageReport = (id, formData) => {
  return api.post(`/student/stages/${id}/report`, formData)
}

// validation history
export const getStudentStageValidationHistory = (id) => {
  return api.get(`/student/stages/${id}/validation-history`)
}

// add technologies
export const addStudentStageTechnologies = (id, technologyIds) => {
  return api.post(`/student/stages/${id}/technologies`, { technologyIds })
}

// remove technology
export const removeStudentStageTechnology = (id, technologyId) => {
  return api.delete(`/student/stages/${id}/technologies/${technologyId}`)
}