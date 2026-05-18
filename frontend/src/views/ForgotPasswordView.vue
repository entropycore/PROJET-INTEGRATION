<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword } from '../services/authService'
import '../assets/styles/forgot-password.css'
import AppLogo from '../components/AppLogo.vue'

const router = useRouter()

const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

const goToLogin = () => {
  router.push('/login')
}

const validateForm = () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = 'Veuillez renseigner votre adresse email.'
    return false
  }

  return true
}

const getForgotPasswordErrorMessage = (error) => {
  const apiError = error?.response?.data

  if (Array.isArray(apiError?.errors) && apiError.errors.length > 0) {
    return (
      apiError.errors[0]?.message ||
      apiError?.message ||
      "Impossible d'envoyer l'email de réinitialisation."
    )
  }

  return apiError?.message || "Impossible d'envoyer l'email de réinitialisation."
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const response = await forgotPassword(email.value.trim())
    successMessage.value =
      response?.message ||
      'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
  } catch (error) {
    errorMessage.value = getForgotPasswordErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
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
            Récupérez l'accès<br />
            à votre espace<br />
            <span>en toute sécurité.</span>
          </h1>

          <p>
            Saisissez votre adresse email pour recevoir un lien de
            réinitialisation si votre compte existe déjà dans la plateforme.
          </p>

          <p>
            Pour des raisons de confidentialité, nous affichons le même message
            même si aucun compte ne correspond à l'adresse renseignée.
          </p>
        </div>
      </div>
    </section>

    <section class="auth-right">
      <div class="auth-card auth-card-forgot">
        <div class="auth-form-block">
          <h2>Mot de passe oublié</h2>
          <p class="subtitle">
            Entrez votre email pour recevoir les instructions de
            réinitialisation.
          </p>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="email">Adresse email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="exemple@ensa.ac.ma"
                autocomplete="email"
              />
            </div>

            <div class="request-note">
              <p>
                <strong>Important :</strong>
                si un compte est associé à cette adresse, vous recevrez un email
                vous permettant de définir un nouveau mot de passe.
              </p>
            </div>

            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="success-message">
              {{ successMessage }}
            </p>

            <button class="submit-btn" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Envoi...' : 'Envoyer le lien' }}
            </button>

            <p class="login-link">
              Vous vous souvenez de votre mot de passe ?
              <span @click="goToLogin">Retour à la connexion</span>
            </p>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
