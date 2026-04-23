<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
import { verifyEmail } from '../services/authService'
import '../assets/styles/request-access.css'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const isSuccess = ref(false)
const message = ref('')

const goToLogin = () => {
  router.push('/login')
}

onMounted(async () => {
  const token = route.query.token

  if (!token || typeof token !== 'string') {
    isLoading.value = false
    message.value = 'Token de vérification manquant.'
    return
  }

  try {
    const response = await verifyEmail(token)
    isSuccess.value = true
    message.value = response.message
  } catch (error) {
    message.value =
      error?.response?.data?.message ||
      "Impossible de vérifier l'adresse email."
  } finally {
    isLoading.value = false
  }
})
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
            Finalisez votre accès en confirmant votre adresse email.
          </p>

          <p>
            Une fois l'email validé, votre demande pourra être traitée par
            l'administration.
          </p>
        </div>
      </div>
    </section>

    <section class="auth-right">
      <div class="auth-card">
        <div class="auth-form-block">
          <h2>Vérification email</h2>
          <p class="subtitle">
            {{ isLoading ? 'Vérification en cours...' : 'Résultat de la vérification' }}
          </p>

          <div class="auth-form">
            <p v-if="!isLoading && !isSuccess" class="error-message">
              {{ message }}
            </p>

            <p v-if="!isLoading && isSuccess" class="success-message">
              {{ message }}
            </p>

            <button
              v-if="!isLoading"
              class="submit-btn"
              type="button"
              @click="goToLogin"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
