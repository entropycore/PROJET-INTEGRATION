import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),

  actions: {
    setAuthSession(user) {
      this.user = user
      this.isAuthenticated = Boolean(user)
    },

    clearAuthSession() {
      this.user = null
      this.isAuthenticated = false
    },
  },
})
