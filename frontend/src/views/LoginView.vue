<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login, getMe } from '../services/authService'
import  AppLogo  from '../components/AppLogo.vue'
import '../assets/styles/login.css'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

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

    authStore.setAuthSession(meResponse.data.data)
    successMessage.value = 'Connexion réussie.'
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      'Connexion impossible. Vérifiez vos identifiants.'
  } finally {
    isLoading.value = false
  }
}

const goToRequestAccess = () => {
  router.push('/request-access')
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
            Votre identité<br />
            professionnelle<br />
            <span>certifiée.</span>
          </h1>

          <p>
            Construisez un portfolio académique validé par votre institution,
            et reconnu par les recruteurs.
          </p>

          <p>
            Chaque réalisation validée devient un atout officiel pour votre
            insertion professionnelle.
          </p>
        </div>
      </div>
    </section>

    <section class="auth-right">
      <div class="auth-card">
        <div class="auth-form-block">
          <h2>Bon retour</h2>
          <p class="subtitle">Connectez-vous à votre espace personnel</p>

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
              <p class="access-request-text">
                Vous n'avez pas encore de compte ?
                <span class="access-request-link" @click="goToRequestAccess">
                  Demandez l'accès
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
