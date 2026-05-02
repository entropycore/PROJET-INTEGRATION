<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { logout } from '../../services/authService'
import { sidebarConfig } from '../../config/sidebarConfig'

import '../../assets/styles/sidebar.css'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

const sections = computed(() => {
  return sidebarConfig[user.value?.role] || []
})

const getIcon = (icon) => {
  return new URL(`../../assets/icons/${icon}`, import.meta.url).href
}

const userInitial = computed(() => {
  return user.value?.firstName?.charAt(0)?.toUpperCase() || 'A'
})

const handleLogout = async () => {
  try {
    await logout()
  } catch {}

  authStore.clearAuthSession()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div>
      <!-- USER -->
      <div class="sidebar-user">
        <div class="sidebar-avatar">{{ userInitial }}</div>
        <div>
          <h3>{{ user?.firstName }} {{ user?.lastName }}</h3>
          <p>{{ user?.role }}</p>
        </div>
      </div>

      <!-- NAV -->
      <nav>
        <div v-for="section in sections" :key="section.section">
          <p class="sidebar-section">{{ section.section }}</p>

          <RouterLink
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            class="sidebar-link"
          >
            <img :src="getIcon(item.icon)" class="sidebar-icon" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>
    </div>

    <!-- LOGOUT -->
    <button class="logout-btn" @click="handleLogout">
      <img :src="getIcon('logout.svg')" />
      Déconnexion
    </button>
  </aside>
</template>