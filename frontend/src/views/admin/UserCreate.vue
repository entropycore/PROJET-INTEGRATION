<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createAdminUser } from '../../services/adminService'

import '../../assets/styles/admin-user-details.css'

const router = useRouter()

const saving = ref(false)
const error = ref(null)
const temporaryPassword = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  profilePicture: '',
  role: 'STUDENT',
  accountStatus: 'ACTIVE',

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

const goBack = () => {
  router.push('/admin/users')
}

const submitCreate = async () => {
  saving.value = true
  error.value = null
  temporaryPassword.value = null

  try {
    const res = await createAdminUser(form.value)

    temporaryPassword.value = res.data.data.temporaryPassword

    const createdUser = res.data.data.user
    router.push(`/admin/users/${createdUser.id}`)
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
    </div>
  </section>
</template>