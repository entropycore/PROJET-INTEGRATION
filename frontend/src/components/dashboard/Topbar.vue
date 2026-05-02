<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import AppLogo from '../AppLogo.vue'

import '../../assets/styles/topbar.css'

const authStore = useAuthStore()

const roleLabel = computed(() => {
  const map = {
    ADMINISTRATOR: 'Administrateur',
    STUDENT: 'Étudiant',
    PROFESSOR: 'Professeur',
    PROFESSIONAL: 'Professionnel',
  }

  return map[authStore.user?.role] || ''
})

const avatarLetter = computed(() => {
  return authStore.user?.firstName?.charAt(0)?.toUpperCase() || 'A'
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <AppLogo />
      <span class="role">{{ roleLabel }}</span>
    </div>

    <div class="topbar-right">
      <RouterLink to="/notifications">🔔</RouterLink>

      <RouterLink to="/profile" class="avatar">
        {{ avatarLetter }}
      </RouterLink>
    </div>
  </header>
</template>