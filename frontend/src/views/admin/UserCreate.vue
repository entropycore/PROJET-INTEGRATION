<script setup>
import { ref, computed } from 'vue'
import { useRouter ,useRoute} from 'vue-router'
import { createAdminUser } from '../../services/adminService'
import eyeIcon from '../../assets/icon.png'
import eyeOffIcon from '../../assets/Button.png'

import '../../assets/styles/admin-user-details.css'

const router = useRouter()
const route = useRoute()

const defaultRole = route.query.role || 'STUDENT'

const saving = ref(false)
const error = ref(null)
const temporaryPassword = ref(null)
const createdUser = ref(null)
const showPassword = ref(false)
const passwordCopied = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  profilePicture: '',
  role: defaultRole,
  accountStatus: 'ACTIVE',
  password: '',

  apogeeCode: '',
  cne: '',
  major: '',
  level: '',
  city: '',
  linkedinUrl: '',

  employeeId: '',
  grade: '',
  specialty: '',
  department: '',
  adminLevel: '',

  company: '',
  jobTitle: '',
  sector: '',
  bio: '',
})

const pageTitle = computed(() => {
  const map = {
    STUDENT: 'Créer un étudiant',
    PROFESSOR: 'Créer un professeur',
    PROFESSIONAL: 'Créer un recruteur',
    ADMINISTRATOR: 'Créer un administrateur',
  }

  return map[form.value.role] || 'Créer un utilisateur'
})

const fallbackRole = computed(() => {
  return route.query.role || form.value.role || 'STUDENT'
})

const goBack = () => {
  router.push({
    path: '/admin/users',
    query: { role: fallbackRole.value },
  })
}

const getPasswordIcon = () => {
  return showPassword.value ? eyeOffIcon : eyeIcon
}

const copyTemporaryPassword = async () => {
  if (!temporaryPassword.value) return

  await navigator.clipboard.writeText(temporaryPassword.value)
  passwordCopied.value = true
}

const continueToCreatedUser = () => {
  if (!createdUser.value) return

  router.push({
    path: `/admin/users/${createdUser.value.id}`,
    query: { role: createdUser.value.role },
  })
}

const submitCreate = async () => {
  saving.value = true
  error.value = null
  temporaryPassword.value = null
  createdUser.value = null
  passwordCopied.value = false

  try {
    const res = await createAdminUser(form.value)

    temporaryPassword.value = res.data.data.temporaryPassword
    createdUser.value = res.data.data.user

    if (temporaryPassword.value) return

    router.push({ path: `/admin/users/${createdUser.value.id}`,
      query: { role: createdUser.value.role },
    })
  } catch (err) {
    error.value = "Erreur lors de la création de l'utilisateur."
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="admin-user-details-page">
    <button class="back-btn" type="button" @click="goBack">
      ← Retour
    </button>

    <div class="details-header">
      <div>
        <p class="admin-kicker">USER MANAGEMENT</p>
        <h1>{{ pageTitle }}</h1>
        <p class="details-email">
          Remplissez les informations nécessaires pour créer un nouveau compte.
        </p>
      </div>

      <div class="details-actions">
        <button class="secondary-btn" type="button" @click="goBack">
          Annuler
        </button>

        <button class="primary-btn" type="button" :disabled="saving" @click="submitCreate">
          {{ saving ? 'Création...' : 'Créer utilisateur' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="details-state error">
      {{ error }}
    </div>

    <div class="details-grid">
      <section class="details-card">
        <h2>Informations générales</h2>

        <div class="form-grid">
          <label>
            Prénom
            <input v-model="form.firstName" />
          </label>

          <label>
            Nom
            <input v-model="form.lastName" />
          </label>

          <label>
            Email
            <input v-model="form.email" type="email" />
          </label>

          <label>
            Téléphone
            <input v-model="form.phone" />
          </label>

          <label>
            Rôle
            <select v-model="form.role">
              <option value="STUDENT">Étudiant</option>
              <option value="PROFESSOR">Professeur</option>
              <option value="PROFESSIONAL">Recruteur</option>
              <option value="ADMINISTRATOR">Administrateur</option>
            </select>
          </label>

          <label>
            Statut
            <select v-model="form.accountStatus">
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          <label class="full-width">
            Photo de profil URL
            <input v-model="form.profilePicture" placeholder="https://..." />
          </label>
        </div>
      </section>

      <section class="details-card">
        <h2>Détails du rôle</h2>

        <div v-if="form.role === 'STUDENT'" class="form-grid">
          <label>Filière <input v-model="form.major" /></label>
          <label>Niveau <input v-model="form.level" /></label>
          <label>Apogée <input v-model="form.apogeeCode" /></label>
          <label>CNE <input v-model="form.cne" /></label>
          <label>Ville <input v-model="form.city" /></label>
          <label>LinkedIn <input v-model="form.linkedinUrl" /></label>
        </div>

        <div v-else-if="form.role === 'PROFESSOR'" class="form-grid">
          <label>Employee ID <input v-model="form.employeeId" /></label>
          <label>Grade <input v-model="form.grade" /></label>
          <label>Département <input v-model="form.department" /></label>
          <label>Spécialité <input v-model="form.specialty" /></label>
        </div>

        <div v-else-if="form.role === 'PROFESSIONAL'" class="form-grid">
          <label>Entreprise <input v-model="form.company" /></label>
          <label>Poste <input v-model="form.jobTitle" /></label>
          <label>Secteur <input v-model="form.sector" /></label>
          <label class="full-width">
            Bio
            <textarea v-model="form.bio" />
          </label>
        </div>

        <div v-else-if="form.role === 'ADMINISTRATOR'" class="form-grid">
          <label>Employee ID <input v-model="form.employeeId" /></label>
          <label>Département <input v-model="form.department" /></label>
          <label>Niveau admin <input v-model="form.adminLevel" /></label>
        </div>
      </section>
      <section class="details-card security-card">
  <h2>Mot de passe</h2>

  <p class="security-text">
    Si vous laissez ce champ vide, un mot de passe temporaire sera généré automatiquement.
  </p>

  <div class="form-grid">
    <label class="full-width">
      Mot de passe initial
      <div class="password-input-wrapper">
        <input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Laisser vide pour générer automatiquement"
        />
        <button type="button" class="password-toggle" @click="showPassword = !showPassword">
          <img :src="getPasswordIcon()" alt="" />
        </button>
      </div>
    </label>
  </div>
</section>
    </div>

    <div v-if="temporaryPassword" class="admin-modal-backdrop">
      <section class="admin-modal">
        <h2>Utilisateur créé</h2>
        <p class="admin-modal-text">
          Mot de passe temporaire genere et envoye par email :
        </p>

        <p class="admin-modal-text">
          Seul le dernier mot de passe temporaire recu est valide.
        </p>

        <div class="temporary-password-box">
          {{ temporaryPassword }}
        </div>

        <div class="admin-modal-actions">
          <button class="secondary-btn" type="button" @click="copyTemporaryPassword">
            {{ passwordCopied ? 'Copié' : 'Copier' }}
          </button>

          <button class="primary-btn" type="button" @click="continueToCreatedUser">
            Continuer
          </button>
        </div>
      </section>
    </div>
  </section>
</template>
