<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login, getMe } from '../services/authService'
import AppLogo from '../components/AppLogo.vue'
import '../assets/styles/login.css'

const router = useRouter() //va me servir a naviguer(changer les pages)
const route = useRoute() //va me servir de lire (observer)
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

watch( //j'observe les infos de navigation utiles depuis l'url
  () => [route.query.error, route.query.reset],
  ([error, reset]) => {
    if (error === 'unauthorized') {
      errorMessage.value = "Vous n'avez pas acces a cette page."
      successMessage.value = ''
      return
    }

    errorMessage.value = ''

    if (reset === 'success') {
      successMessage.value =
        'Mot de passe reinitialise. Vous pouvez maintenant vous connecter.'
      return
    }

    successMessage.value = ''
  },
  { immediate: true }
)

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return
  }

  try {
    isLoading.value = true

    await login({
      email: email.value.trim(),
      password: password.value,
    })

    const meResponse = await getMe()

    authStore.setAuthSession(meResponse.data.data) //je stock la data user dans le store pinia
    successMessage.value = 'Connexion reussie.'
    const user = meResponse.data.data
    const dashboardMap = {
      ADMINISTRATOR: '/admin',
      STUDENT: '/student',
      PROFESSOR: '/professor',
      PROFESSIONAL: '/professional',
    }
    router.push(dashboardMap[user.role] || '/login')
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      'Connexion impossible. Verifiez vos identifiants.'
  } finally {
    isLoading.value = false
  }
}

const goToRequestAccess = () => {
  router.push('/request-access')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-left">
      <div class="brand-block">
        <AppLogo />

        <div class="hero-text">
          <h1>
            Votre identite<br />
            professionnelle<br />
            <span>certifiee.</span>
          </h1>

          <p>
            Construisez un portfolio academique valide par votre institution,
            et reconnu par les recruteurs.
          </p>

          <p>
            Chaque realisation validee devient un atout officiel pour votre
            insertion professionnelle.
          </p>
        </div>
      </div>
    </section>

    <section class="auth-right">
      <div class="auth-card">
        <div class="auth-form-block">
          <h2>Bon retour</h2>
          <p class="subtitle">Connectez-vous a votre espace personnel</p>

          <form class="auth-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">Adresse e-mail</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="exemple@ensa.ac.ma"
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label for="password">Mot de passe</label>
              <div class="input-wrapper">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <img
                  class="toggle-icon"
                  :src="showPassword ? '/src/assets/Button.png' : '/src/assets/icon.png'"
                  alt=""
                  aria-hidden="true"
                  @click="togglePassword"
                />
              </div>
            </div>

            <div class="login-form-links">
              <div class="forgot-password-row">
                <button
                  class="forgot-password"
                  type="button"
                  @click="goToForgotPassword"
                >
                  Mot de passe oublie ?
                </button>
              </div>

              <p class="access-request-text">
                Vous n'avez pas encore de compte ?
                <span class="access-request-link" @click="goToRequestAccess">
                  Demandez l'acces
                </span>
              </p>
            </div>

            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="success-message">
              {{ successMessage }}
            </p>

            <button class="submit-btn" type="submit" :disabled="isLoading">
              {{ isLoading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
