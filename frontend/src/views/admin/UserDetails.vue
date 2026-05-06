<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getAdminUserById,
  updateAdminUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser
} from '../../services/adminService'

import '../../assets/styles/admin-user-details.css'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const user = ref(null)

const isEditMode = computed(() => route.path.endsWith('/edit'))

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  profilePicture: '',
  accountStatus: '',
  role: '',

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

const roleTitle = computed(() => {
  const map = {
    STUDENT: 'Étudiant',
    PROFESSOR: 'Professeur',
    PROFESSIONAL: 'Recruteur',
    ADMINISTRATOR: 'Administrateur',
  }

  return map[user.value?.role] || 'Utilisateur'
})

const fullName = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
})

const initials = computed(() => {
  const first = user.value?.firstName?.charAt(0) || ''
  const last = user.value?.lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
})

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

const fillForm = (data) => {
  const details = data.roleDetails || {}
  const roleData =
    details.student ||
    details.professor ||
    details.professional ||
    details.administrator ||
    {}

  form.value = {
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    profilePicture: data.profilePicture || '',
    accountStatus: data.accountStatus || '',
    role: data.role || '',

    apogeeCode: roleData.apogeeCode || '',
    cne: roleData.cne || '',
    major: roleData.major || '',
    level: roleData.level || '',
    city: roleData.city || '',
    linkedinUrl: roleData.linkedinUrl || '',

    employeeId: roleData.employeeId || '',
    grade: roleData.grade || '',
    specialty: roleData.specialty || '',
    department: roleData.department || '',
    adminLevel: roleData.adminLevel || '',

    company: roleData.company || '',
    jobTitle: roleData.jobTitle || '',
    sector: roleData.sector || '',
    bio: roleData.bio || '',
  }
}

/*const fetchUser = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await getAdminUserById(route.params.userId)
    user.value = res.data.data
    fillForm(res.data.data)
  } catch (err) {
    error.value = "Impossible de charger l'utilisateur."
  } finally {
    loading.value = false
  }
}*/
const fetchUser = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await getAdminUserById(route.params.userId)
    user.value = res.data.data
    fillForm(res.data.data)
  } catch (err) {
    user.value = mockProfessorDetails
    fillForm(mockProfessorDetails)
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)

const goBack = () => {
  router.push({
    path: '/admin/users',
    query: user.value?.role ? { role: user.value.role } : {},
  })
}

const goEdit = () => {
  router.push(`/admin/users/${route.params.userId}/edit`)
}

const cancelEdit = () => {
  router.push(`/admin/users/${route.params.userId}`)
}

/*const saveUser = async () => {
  saving.value = true
  error.value = null

  try {
    await updateAdminUser(route.params.userId, form.value)

    if (form.value.accountStatus !== user.value.accountStatus) {
      await updateUserStatus(route.params.userId, form.value.accountStatus)
    }

    await fetchUser()
    router.push(`/admin/users/${route.params.userId}`)
  } catch (err) {
    error.value = "Erreur lors de la sauvegarde."
  } finally {
    saving.value = false
  }
}*/
const saveUser = async () => {
  saving.value = true
  error.value = null

  try {
    await updateAdminUser(route.params.userId, form.value)

    user.value = {
      ...user.value,
      ...form.value,
      roleDetails: {
        [user.value.role.toLowerCase()]: {
          ...form.value
        }
      }
    }

    router.push(`/admin/users/${route.params.userId}`)
  } catch (err) {
    user.value = {
      ...user.value,
      ...form.value,
      roleDetails: {
        [user.value.role.toLowerCase()]: {
          ...form.value
        }
      }
    }

    router.push(`/admin/users/${route.params.userId}`)
  } finally {
    saving.value = false
  }
}

const handleResetPassword = async () => {
  try {
    const res = await resetUserPassword(route.params.userId)
    alert(`Mot de passe temporaire : ${res.data.data.temporaryPassword}`)
  } catch (err) {
    alert('Erreur reset password.')
  }
}

const handleDelete = async () => {
  const confirmed = confirm('Voulez-vous vraiment supprimer cet utilisateur ?')
  if (!confirmed) return

  try {
    await deleteUser(route.params.userId)
    goBack()
  } catch (err) {
    alert('Erreur suppression utilisateur.')
  }
}
const mockUserDetails = {
  id: route.params.userId,
  firstName: 'Sara',
  lastName: 'Bensaid',
  fullName: 'Sara Bensaid',
  email: 'sara.bensaid@accenture.com',
  phone: '0600000000',
  profilePicture: null,
  role: 'PROFESSIONAL',
  accountStatus: 'PENDING',
  createdAt: '2026-05-02T10:00:00.000Z',
  lastLoginAt: null,
  emailVerified: true,
  roleDetails: {
    professional: {
      company: 'Accenture Maroc',
      jobTitle: 'Recruiter',
      sector: 'IT',
      bio: 'Responsable recrutement.'
    }
  }
}
const mockStudentDetails = {
  id: route.params.userId,
  firstName: 'Youssef',
  lastName: 'Amrani',
  fullName: 'Youssef Amrani',
  email: 'youssef.amrani@etu.uae.ac.ma',
  phone: '0612345678',
  profilePicture: null,
  role: 'STUDENT',
  accountStatus: 'ACTIVE',
  createdAt: '2026-03-15T09:20:00.000Z',
  lastLoginAt: '2026-05-05T14:10:00.000Z',
  emailVerified: true,
  roleDetails: {
    student: {
      apogeeCode: 'A123456',
      cne: 'CNE789456',
      major: 'Génie Informatique',
      level: 'M2',
      city: 'Tanger',
      linkedinUrl: 'https://linkedin.com/in/youssef-amrani'
    }
  }
}
const mockProfessorDetails = {
  id: route.params.userId,
  firstName: 'Fatima',
  lastName: 'Zahra',
  fullName: 'Fatima Zahra',
  email: 'fatima.zahra@ensat.ac.ma',
  phone: '0654321987',
  profilePicture: null,
  role: 'PROFESSOR',
  accountStatus: 'ACTIVE',
  createdAt: '2025-11-20T08:00:00.000Z',
  lastLoginAt: '2026-05-04T11:30:00.000Z',
  emailVerified: true,
  roleDetails: {
    professor: {
      employeeId: 'ENSAT-PR-102',
      grade: 'Professeur Assistant',
      specialty: 'Intelligence Artificielle',
      department: 'Informatique'
    }
  }
}
</script>

<template>
  <section class="admin-user-details-page">
    <button class="back-btn" type="button" @click="goBack">
      ← Retour
    </button>

    <div v-if="loading" class="details-state">
      Chargement...
    </div>

    <div v-else-if="error" class="details-state error">
      {{ error }}
    </div>

    <template v-else-if="user">
      <div class="details-header">
        <div class="details-user">
          <div class="details-avatar">
            <img v-if="user.profilePicture" :src="user.profilePicture" alt="" />
            <span v-else>{{ initials }}</span>
          </div>

          <div>
            <p class="admin-kicker">{{ roleTitle }}</p>
            <h1>{{ fullName }}</h1>
            <p class="details-email">{{ user.email }}</p>
          </div>
        </div>

        <div class="details-actions">

          <button v-if="!isEditMode" class="primary-btn" @click="goEdit">
            Modifier
          </button>

          <button v-if="isEditMode" class="secondary-btn" @click="cancelEdit">
            Annuler
          </button>

          <button v-if="isEditMode" class="primary-btn" :disabled="saving" @click="saveUser">
            {{ saving ? 'Sauvegarde...' : 'Enregistrer' }}
          </button>

          <button v-if="!isEditMode" class="danger-btn" @click="handleDelete">
            Supprimer
          </button>
        </div>
      </div>

      <div class="details-grid">
        <section class="details-card">
          <h2>Informations générales</h2>

          <div class="form-grid">
            <label>
              Prénom
              <input v-model="form.firstName" :disabled="!isEditMode" />
            </label>

            <label>
              Nom
              <input v-model="form.lastName" :disabled="!isEditMode" />
            </label>

            <label>
              Email
              <input v-model="form.email" :disabled="!isEditMode" />
            </label>

            <label>
              Téléphone
              <input v-model="form.phone" :disabled="!isEditMode" />
            </label>
            <label class="full-width">
             Photo de profil URL
             <input
               v-model="form.profilePicture"
               :disabled="!isEditMode"
               placeholder="https://..."
             />
            </label>
            <label>
              Rôle
              <input v-model="form.role" disabled />
            </label>

            <label>
              Statut
              <select v-model="form.accountStatus" :disabled="!isEditMode">
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>
        </section>

        <section class="details-card">
          <h2>Détails du rôle</h2>

          <div v-if="user.role === 'STUDENT'" class="form-grid">
            <label>Filière <input v-model="form.major" :disabled="!isEditMode" /></label>
            <label>Niveau <input v-model="form.level" :disabled="!isEditMode" /></label>
            <label>Apogée <input v-model="form.apogeeCode" :disabled="!isEditMode" /></label>
            <label>CNE <input v-model="form.cne" :disabled="!isEditMode" /></label>
            <label>Ville <input v-model="form.city" :disabled="!isEditMode" /></label>
            <label>LinkedIn <input v-model="form.linkedinUrl" :disabled="!isEditMode" /></label>
          </div>

          <div v-else-if="user.role === 'PROFESSOR'" class="form-grid">
            <label>Employee ID <input v-model="form.employeeId" :disabled="!isEditMode" /></label>
            <label>Grade <input v-model="form.grade" :disabled="!isEditMode" /></label>
            <label>Département <input v-model="form.department" :disabled="!isEditMode" /></label>
            <label>Spécialité <input v-model="form.specialty" :disabled="!isEditMode" /></label>
          </div>

          <div v-else-if="user.role === 'PROFESSIONAL'" class="form-grid">
            <label>Entreprise <input v-model="form.company" :disabled="!isEditMode" /></label>
            <label>Poste <input v-model="form.jobTitle" :disabled="!isEditMode" /></label>
            <label>Secteur <input v-model="form.sector" :disabled="!isEditMode" /></label>
            <label class="full-width">Bio <textarea v-model="form.bio" :disabled="!isEditMode" /></label>
          </div>

          <div v-else-if="user.role === 'ADMINISTRATOR'" class="form-grid">
            <label>Employee ID <input v-model="form.employeeId" :disabled="!isEditMode" /></label>
            <label>Département <input v-model="form.department" :disabled="!isEditMode" /></label>
            <label>Niveau admin <input v-model="form.adminLevel" :disabled="!isEditMode" /></label>
          </div>
        </section>
        
<div class="details-two-columns">
  <section class="details-card security-card">
    <h2>Mot de passe</h2>

    <p class="security-text">
      Générer un nouveau mot de passe temporaire pour cet utilisateur.
    </p>

    <button class="danger-btn" type="button" @click="handleResetPassword">
      Réinitialiser le mot de passe
    </button>
  </section>

  <section class="details-card meta-card">
    <h2>Métadonnées</h2>

    <div class="meta-row">
      <span>Date de création</span>
      <strong>{{ formatDate(user.createdAt) }}</strong>
    </div>

    <div class="meta-row">
      <span>Dernière connexion</span>
      <strong>{{ formatDate(user.lastLoginAt) }}</strong>
    </div>

    <div class="meta-row">
      <span>Email vérifié</span>
      <strong>{{ user.emailVerified ? 'Oui' : 'Non' }}</strong>
    </div>
  </section>
</div>
      </div>
    </template>
  </section>
</template>