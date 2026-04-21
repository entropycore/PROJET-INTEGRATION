<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { requestAccess } from '../services/requestAccessService'
import '../assets/styles/request-access.css'
import  AppLogo  from '../components/AppLogo.vue'

const router = useRouter()

const form = reactive({
  // À confirmer avec le backend :
  lastName: '',
  firstName: '',
  email: '',
  companyName: '',
  jobTitle: '',
  password: '',
  passwordConfirmation: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

const goToLogin = () => {
  router.push('/login')
}

const validateForm = () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (
    !form.lastName.trim() ||
    !form.firstName.trim() ||
    !form.email.trim() ||
    !form.companyName.trim() ||
    !form.jobTitle.trim() ||
    !form.password.trim() ||
    !form.passwordConfirmation.trim()
  ) {
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return false
  }

  if (form.password !== form.passwordConfirmation) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try { 
    await requestAccess({
      lastName: form.lastName,
      firstName: form.firstName,
      email: form.email,
      companyName: form.companyName,
      jobTitle: form.jobTitle,
      password: form.password,
    })

  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Impossible d'envoyer la demande."
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
      <div class="auth-card auth-card-request">
        <div class="auth-tabs">
          <button class="tab" type="button" @click="goToLogin">
            Connexion
          </button>
          <button class="tab active" type="button">
            Demander l'accès
          </button>
        </div>

        <div class="auth-form-block">
          <h2>Rejoignez ValiDia</h2>
          <p class="subtitle">
            Envoyez votre demande d'accès à notre plateforme
          </p>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label for="lastName">Nom</label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  placeholder="Berrada"
                />
              </div>

              <div class="form-group">
                <label for="firstName">Prénom</label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  placeholder="Amina"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email">Adresse email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="votre@email.ma"
              />
            </div>

            <div class="form-group">
              <label for="companyName">Nom de l'entreprise</label>
              <input
                id="companyName"
                v-model="form.companyName"
                type="text"
                placeholder="Saisir le nom de votre entreprise..."
              />
            </div>

            <div class="form-group">
              <label for="jobTitle">Poste</label>
              <input
                id="jobTitle"
                v-model="form.jobTitle"
                type="text"
                placeholder="Ex : Développeur, RH, Manager"
              />
            </div>

            <div class="form-row">
              <div class="form-group password-group">
                <label for="password">Mot de passe</label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div class="form-group password-group">
                <label for="passwordConfirmation">Confirmation</label>
                <input
                  id="passwordConfirmation"
                  v-model="form.passwordConfirmation"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div class="request-note">
              <p>
                <strong>Note importante :</strong>
                Votre demande sera validée par l'administration avant
                l'activation de votre compte.
              </p>
            </div>

            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="success-message">
              {{ successMessage }}
            </p>

            <button class="submit-btn" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Envoi...' : 'Envoyer une demande' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>