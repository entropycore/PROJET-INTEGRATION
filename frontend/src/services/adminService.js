import api from './api'

export const getAdminDashboard = () => {
  return api.get('/admin/dashboard')
}
//get users
export const getAdminUsers = (params = {}) => {
  return api.get('/admin/users', { params })
}

// get user by id
export const getAdminUserById = (id) => {
  return api.get(`/admin/users/${id}`)
}

// create user
export const createAdminUser = (data) => {
  return api.post('/admin/users', data)
}

// update user
export const updateAdminUser = (id, data) => {
  return api.put(`/admin/users/${id}`, data)
}

// change status
export const updateUserStatus = (id, status) => {
  return api.patch(`/admin/users/${id}/status`, { status })
}

// chnage role
export const updateUserRole = (id, role) => {
  return api.patch(`/admin/users/${id}/role`, { role })
}

// reset passwd
export const resetUserPassword = (id) => {
  return api.patch(`/admin/users/${id}/reset-password`)
}

// delete user
export const deleteUser = (id) => {
  return api.delete(`/admin/users/${id}`)
}