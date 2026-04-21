import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,
  }),

  actions: {
    setAuthSession(data) {
      this.accessToken = data.accessToken
      this.user = data.user
      this.isAuthenticated = true
    },

    clearAuthSession() {
      this.accessToken = null
      this.user = null
      this.isAuthenticated = false
    },
  },
})