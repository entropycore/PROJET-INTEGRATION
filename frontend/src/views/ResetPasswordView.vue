<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '../services/authService'
import '../assets/styles/reset-password.css'
import AppLogo from '../components/AppLogo.vue'

const route = useRoute()
const router = useRouter()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const hasValidToken = computed(() => Boolean(token.value))

const goToLogin = () => {
  router.push('/login')
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const validateForm = () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!hasValidToken.value) {
    errorMessage.value = 'Lien de reinitialisation manquant ou invalide.'
    return false
  }

  if (!newPassword.value.trim() || !confirmPassword.value.trim()) {
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return false
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return false
  }

  return true
}

const getResetPasswordErrorMessage = (error) => {
  const apiError = error?.response?.data

  if (Array.isArray(apiError?.errors) && apiError.errors.length > 0) {
    return (
      apiError.errors[0]?.message ||
      apiError?.message ||
      'Impossible de reinitialiser le mot de passe.'
    )
  }

  return apiError?.message || 'Impossible de reinitialiser le mot de passe.'
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const response = await resetPassword({
      token: token.value,
      newPassword: newPassword.value,
    })

    successMessage.value =
      response?.message || 'Mot de passe reinitialise avec succes.'
    newPassword.value = ''
    confirmPassword.value = ''

    router.push({
      path: '/login',
      query: { reset: 'success' },
    })
  } catch (error) {
    errorMessage.value = getResetPasswordErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  const tokenFromQuery = route.query.token

  if (typeof tokenFromQuery === 'string' && tokenFromQuery.trim()) {
    token.value = tokenFromQuery
    return
  }

  errorMessage.value = 'Lien de reinitialisation manquant ou invalide.'
})
</script>

<template>
  <div class="auth-page">
    <section class="auth-left">
      <div class="brand-block">
        <div class="brand-logo-row">
          <AppLogo />
        </div>

        <div class="hero-text">
          <h1>
            Choisissez un<br />
            nouveau mot<br />
            <span>de passe.</span>
          </h1>

          <p>
            Definissez un nouveau mot de passe pour retrouver l'acces a votre
            espace personnel.
          </p>

          <p>
            Utilisez un mot de passe solide pour proteger votre compte et vos
            informations academiques.
          </p>
        </div>
      </div>
    </section>

    <section class="auth-right">
      <div class="auth-card auth-card-reset">
        <div class="auth-form-block">
          <h2>Reinitialiser le mot de passe</h2>
          <p class="subtitle">
            Saisissez votre nouveau mot de passe pour terminer la
            reinitialisation.
          </p>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="newPassword">Nouveau mot de passe</label>
              <div class="input-wrapper">
                <input
                  id="newPassword"
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  :disabled="!hasValidToken"
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

            <div class="form-group">
              <label for="confirmPassword">Confirmation</label>
              <div class="input-wrapper">
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  :disabled="!hasValidToken"
                />
                <img
                  class="toggle-icon"
                  :src="showConfirmPassword ? '/src/assets/Button.png' : '/src/assets/icon.png'"
                  alt=""
                  aria-hidden="true"
                  @click="toggleConfirmPassword"
                />
              </div>
            </div>

            <div class="request-note">
              <p>
                <strong>Important :</strong>
                le lien recu par email est necessaire pour valider cette
                operation.
              </p>
            </div>

            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="success-message">
              {{ successMessage }}
            </p>

            <button
              class="submit-btn"
              type="submit"
              :disabled="isSubmitting || !hasValidToken"
            >
              {{ isSubmitting ? 'Validation...' : 'Reinitialiser le mot de passe' }}
            </button>

            <p class="login-link">
              Retour a votre espace de connexion ?
              <span @click="goToLogin">Se connecter</span>
            </p>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
