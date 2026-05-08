<script setup>
import { reactive } from 'vue'

const props = defineProps({
  initialStage: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save-draft', 'submit-validation'])

const form = reactive({
  title: props.initialStage?.title || '',
  company: props.initialStage?.company || '',
  duration: props.initialStage?.duration || '',
  startDate: props.initialStage?.startDate || '',
  endDate: props.initialStage?.endDate || '',
  description: props.initialStage?.description || '',
  missions: props.initialStage?.missions?.join('\n') || '',
  supervisorName: props.initialStage?.supervisor?.fullName || '',
  supervisorDepartment: props.initialStage?.supervisor?.department || '',
  technologies: props.initialStage?.technologies?.join(', ') || '',
  visibility: props.initialStage?.visibility || 'PRIVATE',
  report: null,
  images: [],
})

const handleReportUpload = (event) => {
  form.report = event.target.files[0]
}

const handleImagesUpload = (event) => {
  form.images = Array.from(event.target.files)
}

const buildPayload = () => {
  return {
    title: form.title,
    company: form.company,
    duration: form.duration,
    startDate: form.startDate,
    endDate: form.endDate,
    description: form.description,
    missions: form.missions
      .split('\n')
      .map((mission) => mission.trim())
      .filter(Boolean),
    supervisor: {
      fullName: form.supervisorName,
      department: form.supervisorDepartment,
    },
    technologies: form.technologies
      .split(',')
      .map((tech) => tech.trim())
      .filter(Boolean),
    visibility: form.visibility,
    report: form.report,
    images: form.images,
  }
}

const saveDraft = () => {
  // BACKEND PLUS TARD :
  // POST ou PUT vers /api/student/stages avec status DRAFT
  emit('save-draft', buildPayload())
}

const submitValidation = () => {
  // BACKEND PLUS TARD :
  // Envoyer les données puis PATCH submit-validation
  emit('submit-validation', buildPayload())
}
</script>

<template>
  <form class="stage-form" @submit.prevent="submitValidation">
    <div class="form-grid">
      <div class="form-group">
        <label>Titre du stage</label>
        <input v-model="form.title" type="text" placeholder="Ex : Développement Frontend Vue.js" />
      </div>

      <div class="form-group">
        <label>Entreprise</label>
        <input v-model="form.company" type="text" placeholder="Ex : Capgemini Maroc" />
      </div>

      <div class="form-group">
        <label>Durée</label>
        <input v-model="form.duration" type="text" placeholder="Ex : 2 mois" />
      </div>

      <div class="form-group">
        <label>Visibilité</label>
        <select v-model="form.visibility">
          <option value="PUBLIC">Publique</option>
          <option value="PRIVATE">Privée</option>
        </select>
      </div>

      <div class="form-group">
        <label>Date début</label>
        <input v-model="form.startDate" type="date" />
      </div>

      <div class="form-group">
        <label>Date fin</label>
        <input v-model="form.endDate" type="date" />
      </div>
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea
        v-model="form.description"
        placeholder="Décrivez brièvement le contexte du stage..."
      ></textarea>
    </div>

    <div class="form-group">
      <label>Missions</label>
      <textarea
        v-model="form.missions"
        placeholder="Écrivez une mission par ligne..."
      ></textarea>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label>Encadrant</label>
        <input v-model="form.supervisorName" type="text" placeholder="Nom complet" />
      </div>

      <div class="form-group">
        <label>Département encadrant</label>
        <input v-model="form.supervisorDepartment" type="text" placeholder="Génie Informatique" />
      </div>
    </div>

    <div class="form-group">
      <label>Technologies utilisées</label>
      <input
        v-model="form.technologies"
        type="text"
        placeholder="Vue.js, Node.js, PostgreSQL"
      />
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label>Rapport PDF</label>
        <input type="file" accept="application/pdf" @change="handleReportUpload" />
      </div>

      <div class="form-group">
        <label>Images optionnelles</label>
        <input type="file" multiple accept="image/*" @change="handleImagesUpload" />
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="saveDraft">
        Sauvegarder brouillon
      </button>

      <button type="submit" class="btn btn-primary">
        Soumettre validation
      </button>
    </div>
  </form>
</template>

<style scoped>
.stage-form {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 14px;
  padding: 22px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  font-size: 12.5px;
  font-weight: 500;
  color: #6d9197;
  margin-bottom: 6px;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #c4cdc1;
  border-radius: 8px;
  background: #f8f9f8;
  font-size: 13.5px;
  color: #28363d;
  outline: none;
}

textarea {
  min-height: 110px;
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2f575d;
  background: #ffffff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #dee1dd;
}

.btn {
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #2f575d;
  color: white;
}

.btn-secondary {
  background: white;
  color: #2f575d;
  border-color: #c4cdc1;
}

@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>