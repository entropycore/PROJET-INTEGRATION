<script setup>

import { computed ,ref} from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter , useRoute } from 'vue-router'
import { logout } from '../../services/authService'
import { sidebarConfig } from '../../config/sidebarConfig'

import '../../assets/styles/sidebar.css'

const authStore = useAuthStore()
const router = useRouter()
//pour les routes enfqnts de gestions utilisateurs
const route = useRoute()
const isChildActive = (child) => {
  return route.fullPath === child.path
}

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
const openDropdown = ref(null)

const toggleDropdown = (label) => {
  openDropdown.value = openDropdown.value === label ? null : label
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

          <div v-for="item in section.items" :key="item.label">
  <button
    v-if="item.children"
    type="button"
    class="sidebar-link sidebar-dropdown-trigger"
    @click="toggleDropdown(item.label)"
  >
    <span class="sidebar-link-left">
      <img :src="getIcon(item.icon)" class="sidebar-icon" />
      <span>{{ item.label }}</span>
    </span>

    <span class="sidebar-chevron">
      {{ openDropdown === item.label ? '⌃' : '⌄' }}
    </span>
  </button>

  <div
    v-if="item.children && openDropdown === item.label"
    class="sidebar-submenu"
  >
    <RouterLink
      v-for="child in item.children"
      :key="child.path"
      :to="child.path"
      class="sidebar-sublink"
      :class="{ 'sidebar-sublink-active': isChildActive(child) }"
    >
      {{ child.label }}
    </RouterLink>
  </div>

  <RouterLink
    v-else-if="!item.children"
    :to="item.path"
    class="sidebar-link"
    active-class="sidebar-link-active"
    exact-active-class="sidebar-link-exact-active"
  >
    <img :src="getIcon(item.icon)" class="sidebar-icon" />
    <span>{{ item.label }}</span>
  </RouterLink>
</div>
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