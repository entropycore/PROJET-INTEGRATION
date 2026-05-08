import api from './api'

export const getStudentProjects = (params = {}) => {
  return api.get('/projects/me', { params })
}

export const getStudentProjectById = (id) => {
  return api.get(`/projects/${id}`)
}

export const createStudentProject = (data) => {
  return api.post('/projects', data)
}

export const updateStudentProject = (id, data) => {
  return api.put(`/projects/${id}`, data)
}

export const submitStudentProject = (id) => {
  return api.patch(`/projects/${id}/submit`)
}

export const deleteStudentProject = (id) => {
  return api.delete(`/projects/${id}`)
}