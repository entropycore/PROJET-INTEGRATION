<script setup>
import { ref, computed } from 'vue'
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
const isLoading = ref(false)
const showPassword = ref(false)

const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN  

const isEmailValid = computed(() => {
  const regex = new RegExp(`^[a-zA-Z0-9._%+-]+@${allowedDomain.replace('.', '\\.')}$`)
  return regex.test(email.value.trim())
})

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return
  }

  if (!isEmailValid.value) {
    errorMessage.value = `L\'adresse e-mail doit se terminer par @${allowedDomain}.`
    return
  }

  try {
    isLoading.value = true

    await login({
      email: email.value.trim(),
      password: password.value,
    })

    const meResponse = await getMe()

    authStore.setAuthSession({ user: meResponse.data })

    router.push('/dashboard')
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      'Connexion impossible. Vérifiez vos identifiants.'
  } finally {
    isLoading.value = false
  }
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
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
          <h2>Bon retour !</h2>
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

            <div class="forgot-password-row">
              <button
                class="forgot-password"
                type="button"
                @click="goToForgotPassword"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <p class="access-request-text" @click="goToRequestAccess">
              Demandez l’accès à notre plateforme
            </p>

            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
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
