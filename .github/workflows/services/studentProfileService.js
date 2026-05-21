import api from './api'

export const getStudentProfile = async () => {
  const response = await api.get('/students/me')
  return response.data
}

export const updateStudentProfile = async (data) => {
  const response = await api.put('/students/me', data)
  return response.data
}

export const getAcademicPaths = async () => {
  const response = await api.get('/academic-paths/me')
  return response.data
}

export const addAcademicPath = async (data) => {
  const response = await api.post('/academic-paths', data)
  return response.data
}

export const updateAcademicPath = async (id, data) => {
  const response = await api.put(`/academic-paths/${id}`, data)
  return response.data
}

export const deleteAcademicPath = async (id) => {
  const response = await api.delete(`/academic-paths/${id}`)
  return response.data
}
export const getSoftSkills = async () => {
  const response = await api.get('/student/soft-skills')
  return response.data
}

export const addSoftSkill = async (data) => {
  const response = await api.post('/student/soft-skills', data)
  return response.data
}

export const deleteSoftSkill = async (id) => {
  const response = await api.delete(`/student/soft-skills/${id}`)
  return response.data
}

export const getCareerGoal = async () => {
  const response = await api.get('/student/career-goal')
  return response.data
}

export const updateCareerGoal = async (data) => {
  const response = await api.put('/student/career-goal', data)
  return response.data
}