import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),

  actions: {
    initializeAuth() {
      if (typeof window === 'undefined') return

      const savedAuth = window.localStorage.getItem('auth')
      if (!savedAuth) return

      try {
        const { user, isAuthenticated } = JSON.parse(savedAuth)
        this.user = user ?? null
        this.isAuthenticated = Boolean(isAuthenticated)
      } catch {
        this.user = null
        this.isAuthenticated = false
      }
    },

    setAuthSession(user) {
      this.user = user
      this.isAuthenticated = Boolean(user)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'auth',
          JSON.stringify({ user: this.user, isAuthenticated: this.isAuthenticated })
        )
      }
    },

    clearAuthSession() {
      this.user = null
      this.isAuthenticated = false
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('auth')
      }
    },
  },
})
