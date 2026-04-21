<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { loginRequest } from '../services/authService'
import  AppLogo  from '../components/AppLogo.vue'
import '../assets/styles/login.css'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

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

    const data = await loginRequest({
      email: email.value.trim(),
      password: password.value,
    })

    authStore.setAuthSession({ user: data.user,})

    router.push('/dashboard')
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

const goToForgotPassword = () => {
  router.push('/forgot-password')
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
        <div class="auth-tabs">
          <button class="tab active" type="button">Connexion</button>
          <button class="tab" type="button" @click="goToRequestAccess">
            Demander l'accès
          </button>
        </div>

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
              <input
                id="password"
                v-model="password" 
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
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