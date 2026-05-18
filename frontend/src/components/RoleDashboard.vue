<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getDashboard, getProfile } from '../services/dashboardService'
import { logout } from '../services/authService'

const props = defineProps({
  roleArea: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const authStore = useAuthStore()

const dashboardMessage = ref('')
const profileMessage = ref('')
const profile = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)
const isLoggingOut = ref(false)

const userName = computed(() => {
  const user = authStore.user

  if (!user) return 'Utilisateur'
  return `${user.firstName } ${user.lastName }`.trim() || user.email
})

const loadDashboard = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const [dashboardResponse, profileResponse] = await Promise.all([
      getDashboard(props.roleArea),
      getProfile(props.roleArea),
    ])

    dashboardMessage.value = dashboardResponse.message
    profileMessage.value = profileResponse.message
    profile.value = profileResponse.data?.user
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      "Impossible de charger votre espace."
  } finally {
    isLoading.value = false
  }
}

const handleLogout = async () => {
  isLoggingOut.value = true

  try {
    await logout()
  } finally {
    authStore.clearAuthSession() //je vide la session locale apres l'appel api logout
    router.push('/login')
    isLoggingOut.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="page">
    <h1>{{ title }}</h1>

    <p>Utilisateur : {{ userName }}</p>

    <p v-if="isLoading">Chargement...</p>

    <p v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <div v-else>
      <p>✔ Dashboard chargé</p>
      <p>✔ Profil chargé</p>

      <p>Role : {{ profile?.role }}</p>
    </div>

    <button @click="handleLogout">
      Se déconnecter
    </button>
  </div>
</template>
<style scoped>
.page {
  padding: 40px;
  font-family: sans-serif;
}

.error {
  color: red;
  margin-top: 10px;
}

button {
  margin-top: 20px;
  padding: 10px 16px;
  cursor: pointer;
}
</style>
