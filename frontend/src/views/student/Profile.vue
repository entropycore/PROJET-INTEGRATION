<script setup>
import { ref, onMounted } from 'vue'
import {
  getStudentProfile,
  updateStudentProfile,
  getAcademicPaths,
  addAcademicPath,
  deleteAcademicPath,
  getSoftSkills,
  addSoftSkill,
  deleteSoftSkill,
  getCareerGoal,
  updateCareerGoal,
} from '../../services/studentProfileService'

const profile = ref(null)
const academicPaths = ref([])
const softSkills = ref([])
const careerGoal = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isEditing = ref(false)
const showAddPath = ref(false)
const showAddSkill = ref(false)
const newSkillName = ref('')

const careerGoals = [
  { value: 'WEB_DEVELOPER', label: 'Développeur Web' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'DATA', label: 'Data Science' },
  { value: 'CYBERSECURITY', label: 'Cybersécurité' },
]

const editForm = ref({
  firstName: '', lastName: '', phone: '',
  city: '', bio: '', linkedinUrl: '',
})

const newPath = ref({
  institution: '', degree: '', field: '',
  startDate: '', endDate: '',
})

const loadAll = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [profileRes, pathsRes, skillsRes, goalRes] = await Promise.all([
      getStudentProfile(),
      getAcademicPaths(),
      getSoftSkills(),
      getCareerGoal(),
    ])
    profile.value = profileRes.data
    academicPaths.value = pathsRes.data
    softSkills.value = skillsRes.data
    careerGoal.value = goalRes.data?.careerGoal || ''
  } catch (err) {
    profile.value = {
      firstName: 'Mohamed',
      lastName: 'Zaaboul',
      email: 'mohamed.zaaboul@ensa.ac.ma',
      phone: '',
      field: 'Génie Informatique',
      level: 'S2',
      city: 'Tanger',
      bio: '',
      linkedinUrl: '',
    }
    academicPaths.value = []
    softSkills.value = []
    careerGoal.value = ''
  } finally {
    isLoading.value = false
  }
}

const startEdit = () => {
  editForm.value = {
    firstName: profile.value.firstName,
    lastName: profile.value.lastName,
    phone: profile.value.phone || '',
    city: profile.value.city || '',
    bio: profile.value.bio || '',
    linkedinUrl: profile.value.linkedinUrl || '',
  }
  isEditing.value = true
}

const saveProfile = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await updateStudentProfile(editForm.value)
    successMessage.value = 'Profil mis à jour avec succès.'
    isEditing.value = false
    await loadAll()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Erreur de mise à jour.'
  }
}

const setCareerGoal = async (goal) => {
  try {
    await updateCareerGoal({ careerGoal: goal })
    careerGoal.value = goal
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Erreur.'
  }
}

const addPath = async () => {
  try {
    await addAcademicPath(newPath.value)
    showAddPath.value = false
    newPath.value = { institution: '', degree: '', field: '', startDate: '', endDate: '' }
    await loadAll()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Erreur d'ajout."
  }
}

const deletePath = async (id) => {
  try {
    await deleteAcademicPath(id)
    await loadAll()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Erreur de suppression.'
  }
}

const handleAddSkill = async () => {
  if (!newSkillName.value.trim()) return
  try {
    await addSoftSkill({ name: newSkillName.value })
    newSkillName.value = ''
    showAddSkill.value = false
    await loadAll()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Erreur.'
  }
}

const handleDeleteSkill = async (id) => {
  try {
    await deleteSoftSkill(id)
    await loadAll()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Erreur.'
  }
}

const getInitials = (fn, ln) => `${fn?.[0] || ''}${ln?.[0] || ''}`.toUpperCase()

onMounted(loadAll)
</script>

<template>
  <div class="profile-page">

    <div class="page-header">
      <div>
        <h1>Mon profil</h1>
        <div class="sub">Informations personnelles et parcours académique</div>
      </div>
      <button v-if="!isEditing && profile" class="btn btn-primary" @click="startEdit">
        <span class="material-icons-round">edit</span>
        Modifier
      </button>
    </div>

    <p v-if="isLoading" class="text-muted">Chargement...</p>
    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

    <div v-if="profile">

      <div class="section-row">

        <!-- Colonne gauche -->
        <div class="content-card">
          <div class="avatar-row">
            <div class="profile-avatar">{{ getInitials(profile.firstName, profile.lastName) }}</div>
            <div>
              <div class="profile-name">{{ profile.firstName }} {{ profile.lastName }}</div>
              <div class="text-muted">{{ profile.email }}</div>
              <div style="margin-top:6px">
                <span class="badge badge-info">{{ profile.field }} {{ profile.level }}</span>
              </div>
            </div>
          </div>

          <div v-if="!isEditing">
            <h3 class="card-title">Informations personnelles</h3>
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="info-label">Filière</td>
                  <td class="info-value">{{ profile.field || '—' }}</td>
                </tr>
                <tr>
                  <td class="info-label">Niveau</td>
                  <td class="info-value">{{ profile.level || '—' }}</td>
                </tr>
                <tr>
                  <td class="info-label">Téléphone</td>
                  <td class="info-value">{{ profile.phone || '—' }}</td>
                </tr>
                <tr>
                  <td class="info-label">Ville</td>
                  <td class="info-value">{{ profile.city || '—' }}</td>
                </tr>
                <tr>
                  <td class="info-label">LinkedIn</td>
                  <td class="info-value link">{{ profile.linkedinUrl || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else>
            <div class="form-row">
              <div class="form-group">
                <label>Prénom</label>
                <input v-model="editForm.firstName" type="text" />
              </div>
              <div class="form-group">
                <label>Nom</label>
                <input v-model="editForm.lastName" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Téléphone</label>
                <input v-model="editForm.phone" type="text" />
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input v-model="editForm.city" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>Bio</label>
              <textarea v-model="editForm.bio"></textarea>
            </div>
            <div class="form-group">
              <label>LinkedIn URL</label>
              <input v-model="editForm.linkedinUrl" type="text" />
            </div>
            <div class="flex-gap mt-12">
              <button class="btn btn-primary" @click="saveProfile">Enregistrer</button>
              <button class="btn btn-secondary" @click="isEditing = false">Annuler</button>
            </div>
          </div>
        </div>

        <!-- Colonne droite -->
        <div>
          <div class="content-card" style="margin-bottom:16px">
            <h3 class="card-title">Objectif professionnel</h3>
            <div class="chips-row">
              <span
                v-for="goal in careerGoals"
                :key="goal.value"
                class="filter-chip"
                :class="{ active: careerGoal === goal.value }"
                @click="setCareerGoal(goal.value)"
              >
                {{ goal.label }}
              </span>
            </div>
            <p class="hint-text">
              Votre portfolio sera adapté selon l'objectif sélectionné pour mettre en avant les compétences pertinentes.
            </p>
          </div>

          <div class="content-card">
            <h3 class="card-title">Compétences comportementales</h3>
            <div class="skills-row">
              <span
                v-for="skill in softSkills"
                :key="skill.id"
                class="skill-badge"
                @click="handleDeleteSkill(skill.id)"
                title="Cliquer pour supprimer"
              >
                <span class="material-icons-round" style="font-size:12px">check</span>
                {{ skill.name }}
              </span>
            </div>
            <div v-if="showAddSkill" class="flex-gap mt-12">
              <input
                v-model="newSkillName"
                type="text"
                placeholder="Ex: Leadership"
                class="skill-input"
              />
              <button class="btn btn-primary btn-sm" @click="handleAddSkill">OK</button>
              <button class="btn btn-secondary btn-sm" @click="showAddSkill = false">✕</button>
            </div>
            <button v-else class="btn btn-secondary btn-sm mt-12" @click="showAddSkill = true">
              <span class="material-icons-round">add</span>
              Ajouter
            </button>
          </div>
        </div>
      </div>

      <!-- Parcours académique -->
      <div class="content-card">
        <div class="flex-between mb-8">
          <h3 class="card-title" style="margin:0">Parcours académique</h3>
          <button class="btn btn-secondary btn-sm" @click="showAddPath = !showAddPath">
            <span class="material-icons-round">add</span>
            Ajouter
          </button>
        </div>

        <div v-if="showAddPath" class="add-form">
          <div class="form-row">
            <div class="form-group">
              <label>Établissement</label>
              <input v-model="newPath.institution" type="text" placeholder="Ex: ENSA Tanger" />
            </div>
            <div class="form-group">
              <label>Diplôme</label>
              <input v-model="newPath.degree" type="text" placeholder="Ex: Cycle Ingénieur" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Filière</label>
              <input v-model="newPath.field" type="text" placeholder="Ex: Génie Informatique" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date de début</label>
              <input v-model="newPath.startDate" type="date" />
            </div>
            <div class="form-group">
              <label>Date de fin</label>
              <input v-model="newPath.endDate" type="date" />
            </div>
          </div>
          <div class="flex-gap">
            <button class="btn btn-primary btn-sm" @click="addPath">Ajouter</button>
            <button class="btn btn-secondary btn-sm" @click="showAddPath = false">Annuler</button>
          </div>
          <div class="divider"></div>
        </div>

        <div v-if="academicPaths.length > 0" class="timeline">
          <div v-for="path in academicPaths" :key="path.id" class="timeline-item">
            <div class="t-date">{{ path.startDate }} — {{ path.endDate || 'Présent' }}</div>
            <div class="t-title">{{ path.degree }}</div>
            <div class="t-desc">{{ path.institution }}<span v-if="path.field"> — {{ path.field }}</span></div>
            <button class="btn btn-danger btn-sm mt-12" @click="deletePath(path.id)">
              <span class="material-icons-round">delete</span>
              Supprimer
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="material-icons-round">school</span>
          <h4>Aucune formation ajoutée</h4>
          <p>Ajoutez votre parcours académique pour enrichir votre profil.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.profile-page { font-family: 'DM Sans', sans-serif; color: #28363D; }

.page-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px }
.page-header h1 { font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;color:#28363D;line-height:1.2 }
.sub { font-size:13px;color:#99AEAD;margin-top:3px;font-style:italic }

.section-row { display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px }

.content-card { background:#fff;border:1px solid #DEE1DD;border-radius:12px;padding:20px;margin-bottom:16px }
.card-title { font-size:15px;color:#28363D;font-family:'DM Serif Display',serif;font-weight:400;margin-bottom:12px }

.avatar-row { display:flex;align-items:center;gap:16px;margin-bottom:20px }
.profile-avatar { width:72px;height:72px;border-radius:50%;background:#2F575D;display:flex;align-items:center;justify-content:center;font-size:26px;font-family:'DM Serif Display',serif;color:#fff;flex-shrink:0 }
.profile-name { font-size:20px;font-family:'DM Serif Display',serif;color:#28363D }

.badge { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:500 }
.badge-info { background:#e3f2fd;color:#1565c0 }

.info-table { width:100%;border-collapse:collapse }
.info-label { color:#99AEAD;font-size:13px;padding:7px 0;width:140px;vertical-align:top }
.info-value { font-size:13.5px;color:#28363D;padding:7px 0 }
.info-value.link { color:#2F575D }

.chips-row { display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px }
.filter-chip { padding:6px 14px;border-radius:20px;border:1px solid #C4CDC1;font-size:12.5px;cursor:pointer;color:#6D9197;transition:all .15s }
.filter-chip:hover { border-color:#6D9197 }
.filter-chip.active { background:#2F575D;color:#fff;border-color:#2F575D }
.hint-text { font-size:13px;color:#6D9197;margin:0 }

.skills-row { display:flex;flex-wrap:wrap;gap:4px }
.skill-badge { display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;background:#F8F9F8;border:1px solid #C4CDC1;color:#2F575D;cursor:pointer }
.skill-badge:hover { border-color:#6D9197 }
.skill-input { flex:1;padding:7px 10px;border:1px solid #C4CDC1;border-radius:8px;font-size:13px;outline:none;font-family:'DM Sans',sans-serif;color:#28363D;background:#fff }
.skill-input:focus { border-color:#2F575D }

.form-group { margin-bottom:16px }
.form-group label { display:block;font-size:12.5px;font-weight:500;color:#6D9197;margin-bottom:5px }
.form-group input,
.form-group textarea { width:100%;padding:9px 12px;border:1px solid #C4CDC1;border-radius:8px;background:#fff;font-family:'DM Sans',sans-serif;font-size:13.5px;color:#28363D;outline:none;transition:border-color .2s;box-sizing:border-box }
.form-group input:focus,
.form-group textarea:focus { border-color:#2F575D }
.form-group textarea { resize:vertical;min-height:90px }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:16px }

.add-form { background:#F8F9F8;border-radius:10px;padding:16px;margin-bottom:16px;border:1px solid #DEE1DD }

.btn { display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .15s }
.btn-primary { background:#2F575D;color:#fff;border-color:#2F575D }
.btn-primary:hover { background:#245055 }
.btn-secondary { background:#fff;color:#2F575D;border-color:#C4CDC1 }
.btn-secondary:hover { background:#F8F9F8 }
.btn-danger { background:#fff;color:#C0392B;border-color:#f5c6c6 }
.btn-danger:hover { background:#fff5f5 }
.btn-sm { padding:6px 12px;font-size:12.5px }
.btn .material-icons-round { font-size:16px }

.timeline { padding-left:20px;border-left:2px solid #DEE1DD }
.timeline-item { position:relative;padding:0 0 20px 20px }
.timeline-item::before { content:'';position:absolute;left:-6px;top:4px;width:10px;height:10px;border-radius:50%;background:#2F575D;border:2px solid #fff }
.t-date { font-size:11.5px;color:#99AEAD;margin-bottom:3px }
.t-title { font-size:14px;font-weight:500;color:#28363D }
.t-desc { font-size:13px;color:#6D9197;margin-top:3px }

.empty-state { text-align:center;padding:48px 24px;color:#99AEAD }
.empty-state .material-icons-round { font-size:48px;color:#C4CDC1;margin-bottom:12px;display:block }
.empty-state h4 { font-size:16px;color:#6D9197;font-weight:500;margin-bottom:6px }
.empty-state p { font-size:13px }

.divider { height:1px;background:#DEE1DD;margin:16px 0 }
.flex-between { display:flex;align-items:center;justify-content:space-between }
.flex-gap { display:flex;align-items:center;gap:10px }
.mt-12 { margin-top:12px }
.mb-8 { margin-bottom:8px }
.text-muted { color:#99AEAD;font-size:13px }
.error-msg { color:#C0392B;font-size:13px;margin-bottom:12px }
.success-msg { color:#658B6F;font-size:13px;margin-bottom:12px }
</style>