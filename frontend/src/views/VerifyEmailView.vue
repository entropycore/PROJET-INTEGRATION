<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
import { verifyEmail } from '../services/authService'
import '../assets/styles/verification-email.css'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const isSuccess = ref(false)
const message = ref('')

const goToLogin = () => {
  router.push('/login')
}

const statusTitle = computed(() => {
  if (isLoading.value) {
    return "Vérification de l'email"
  }

  if (isSuccess.value) {
    return 'Email vérifié avec succès'
  }

  return 'Vérification impossible'
})

const statusText = computed(() => {
  if (isLoading.value) {
    return 'Nous confirmons votre adresse email. Veuillez patienter un instant.'
  }

  if (isSuccess.value) {
    return 'Votre demande est en attente de validation par l\'administration.'
  }

  return message.value || "Impossible de vérifier l'adresse email."
})

onMounted(async () => {
  const token = route.query.token

  if (!token || typeof token !== 'string') {
    isLoading.value = false
    message.value = 'Token de vérification manquant.'
    return
  }

  try {
    await verifyEmail(token)
    isSuccess.value = true
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
  <div class="verify-email-page">
    <div class="verify-email-wrapper">
      <section class="verify-email-card">
        <div class="verify-email-logo">
          <AppLogo />
        </div>

        <div class="verify-email-content">
          <div
            class="status-icon"
            :class="{
              'status-icon-loading': isLoading,
              'status-icon-success': !isLoading && isSuccess,
              'status-icon-error': !isLoading && !isSuccess,
            }"
            aria-hidden="true"
          >
            <svg
              v-if="isLoading"
              viewBox="0 0 24 24"
              class="status-spinner"
            >
              <circle
                class="status-spinner-track"
                cx="12"
                cy="12"
                r="9"
              />
              <path
                class="status-spinner-head"
                d="M12 3a9 9 0 0 1 9 9"
              />
            </svg>

            <svg
              v-else-if="isSuccess"
              viewBox="0 0 24 24"
              class="status-symbol"
            >
              <path
                d="M7 12.5l3.2 3.2L17.5 8.5"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.4"
              />
            </svg>

            <svg
              v-else
              viewBox="0 0 24 24"
              class="status-symbol"
            >
              <path
                d="M12 8v5"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2.4"
              />
              <circle cx="12" cy="16.5" r="1.1" fill="currentColor" />
            </svg>
          </div>

          <div class="verify-email-copy">
            <h1>{{ statusTitle }}</h1>
            <p>{{ statusText }}</p>
          </div>

          <button
            v-if="!isLoading"
            class="verify-email-button"
            type="button"
            @click="goToLogin"
          >
            Retour à la connexion
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>

</style>
