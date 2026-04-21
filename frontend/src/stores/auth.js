import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),

  actions: {
    setAuthSession(data) {
      this.user = data.user
      this.isAuthenticated = true
    },

    clearAuthSession() {
      this.user = null
      this.isAuthenticated = false
    },
  },
})