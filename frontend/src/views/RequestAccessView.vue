<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { requestAccess } from '../services/requestAccessService'
import '../assets/styles/request-access.css'
import AppLogo from '../components/AppLogo.vue'


const router = useRouter()

const form = reactive({
  lastName: '',
  firstName: '',
  email: '',
  company: '',
  jobTitle: '',
  password: '',
  passwordConfirmation: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

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

  if (
    !form.lastName.trim() ||
    !form.firstName.trim() ||
    !form.email.trim() ||
    !form.company.trim() ||
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
    const response = await requestAccess({
      email: form.email.trim(),
      password: form.password,
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      company: form.company.trim(),
      jobTitle: form.jobTitle.trim(),
    })

    successMessage.value =
      response?.message ||
      "Demande envoyee. Veuillez verifier votre boite de reception pour valider votre email."
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
            Recrutez des profils<br />
            vérifiés et<br />
            <span>certifiés.</span>
          </h1>


          <p>
            Découvrez une sélection de portfolios académiques validés, offrant une
            visibilité claire et fiable sur les compétences des candidats.
          </p>

          <p>
            Chaque réalisation présentée est certifiée par son institution, pour un
            recrutement basé sur des données authentiques.
          </p>
        </div>
      </div>
    </section>

    <section class="auth-right">
      <div class="auth-card auth-card-request">
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
                v-model="form.company"
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

            <div class="password-row">
              <div class="form-group password-group">
                <label for="password">Mot de passe</label>
                <div class="input-wrapper">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
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

              <div class="form-group password-group">
                <label for="passwordConfirmation">Confirmation</label>
                <div class="input-wrapper">
                  <input
                    id="passwordConfirmation"
                    v-model="form.passwordConfirmation"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="••••••••"
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

            <p class="login-link">
              Already have an account?
              <span @click="goToLogin">Log in</span>
            </p>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
