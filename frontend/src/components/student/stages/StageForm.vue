<script setup>
import { reactive, ref } from 'vue'

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
  technologies: props.initialStage?.technologies || [],
  visibility: props.initialStage?.visibility || 'PRIVATE',
  report: null,
  images: [],
})

const technologyInput = ref('')

const addTechnology = () => {
  const value = technologyInput.value.trim()

  if (!value) return

  if (!form.technologies.includes(value)) {
    form.technologies.push(value)
  }

  technologyInput.value = ''
}

const removeTechnology = (tech) => {
  form.technologies = form.technologies.filter((item) => item !== tech)
}

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
    technologies: form.technologies,
    visibility: form.visibility,
    report: form.report,
    images: form.images,
  }
}

const saveDraft = () => {
  emit('save-draft', buildPayload())
}

const submitValidation = () => {
  emit('submit-validation', buildPayload())
}

const submitButtonLabel = () => {
  return props.initialStage?.validationStatus === 'CORRECTION_REQUIRED'
    ? 'Resoumettre pour validation'
    : 'Soumettre validation'
}
</script>

<template>
  <form class="stage-form" @submit.prevent="submitValidation">
    <div class="form-actions top-actions">
      <button type="button" class="btn btn-secondary" @click="saveDraft">
        Sauveg. brouillon
      </button>

      <button type="submit" class="btn btn-primary">
        <span class="material-icons-round">send</span>
        {{ submitButtonLabel() }}
      </button>
    </div>

    <div class="form-layout">
      <main class="form-main">
        <section class="form-card">
          <h2>
            <span class="material-icons-round">info</span>
            Informations principales
          </h2>

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
              placeholder="Décrivez le contexte général du stage..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Missions réalisées</label>
            <textarea
              v-model="form.missions"
              placeholder="Écrivez une mission par ligne..."
            ></textarea>
          </div>
        </section>

        <section class="form-card">
          <h2>
            <span class="material-icons-round">person</span>
            Encadrant
          </h2>

          <div class="form-grid">
            <div class="form-group">
              <label>Nom de l’encadrant</label>
              <input v-model="form.supervisorName" type="text" placeholder="Ex : Pr. Karim Alaoui" />
            </div>

            <div class="form-group">
              <label>Département</label>
              <input v-model="form.supervisorDepartment" type="text" placeholder="Ex : Génie Informatique" />
            </div>
          </div>
        </section>

        <section class="form-card">
          <h2>
            <span class="material-icons-round">code</span>
            Technologies utilisées
          </h2>

          <div v-if="form.technologies.length" class="tech-tags">
            <span
              v-for="tech in form.technologies"
              :key="tech"
              class="tech-tag"
            >
              {{ tech }}
              <button type="button" @click="removeTechnology(tech)">
                ×
              </button>
            </span>
          </div>

          <div class="technology-add-row">
            <input
              v-model="technologyInput"
              type="text"
              placeholder="Ajouter une technologie"
              @keydown.enter.prevent="addTechnology"
            />

            <button type="button" class="add-tech-btn" @click="addTechnology">
              Ajouter
            </button>
          </div>
        </section>
      </main>

      <aside class="form-side">
        <section class="form-card">
          <h2>
            <span class="material-icons-round">image</span>
            Captures d’écran
          </h2>

          <label class="upload-box">
            <span class="material-icons-round">add_photo_alternate</span>
            <strong>Ajouter des captures</strong>
            <small>PNG, JPG ou WEBP</small>

            <input type="file" multiple accept="image/*" @change="handleImagesUpload" />
          </label>

          <p v-if="form.images.length" class="file-info">
            {{ form.images.length }} image(s) sélectionnée(s)
          </p>
        </section>

        <section class="form-card">
          <h2>
            <span class="material-icons-round">picture_as_pdf</span>
            Rapport PDF
          </h2>

          <label class="upload-box">
            <span class="material-icons-round">attach_file</span>
            <strong>Ajouter le rapport</strong>
            <small>PDF uniquement</small>

            <input type="file" accept="application/pdf" @change="handleReportUpload" />
          </label>

          <p v-if="form.report" class="file-info">
            {{ form.report.name }}
          </p>
        </section>
      </aside>
    </div>
  </form>
</template>

<style scoped>
.stage-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}
.form-layout {
  display: grid;
  grid-template-columns: 1fr 22rem;
  gap: 1rem;
}

.form-main,
.form-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.875rem;
  padding: 1.25rem;
}

h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28363d;
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0 0 1rem;
}

h2 .material-icons-round {
  color: #2f575d;
  font-size: 1.2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.95rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  display: block;
  color: #2f575d;
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #c4cdc1;
  border-radius: 0.7rem;
  background: #f8f9f8;
  color: #28363d;
  font-size: 0.93rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

input,
select {
  height: 2.75rem;
  padding: 0 0.95rem;
}

textarea {
  min-height: 7rem;
  padding: 0.85rem 0.95rem;
  line-height: 1.7;
  resize: vertical;
}

input::placeholder,
textarea::placeholder {
  color: #8ba0a3;
  font-size: 0.88rem;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2f575d;
  background: #ffffff;
  box-shadow: 0 0 0 0.18rem rgba(47, 87, 93, 0.08);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.tech-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: #edf2f0;
  color: #2f575d;
  border: 1px solid #d9e2de;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.tech-tag button {
  border: none;
  background: transparent;
  color: #6d9197;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
}

.technology-add-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem;
}

.add-tech-btn {
  height: 2.75rem;
  padding: 0 1rem;
  border-radius: 0.7rem;
  border: 1px solid #c4cdc1;
  background: #ffffff;
  color: #2f575d;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.add-tech-btn:hover {
  background: #f8f9f8;
}

.upload-box {
  min-height: 8.5rem;
  border: 1.5px dashed #c4cdc1;
  border-radius: 0.875rem;
  background: #f8f9f8;
  color: #6d9197;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;

  text-align: center;
  cursor: pointer;
  padding: 1rem;
  transition: 0.2s ease;
}

.upload-box:hover {
  background: #ffffff;
  border-color: #2f575d;
}

.upload-box .material-icons-round {
  color: #2f575d;
  font-size: 1.9rem;
}

.upload-box strong {
  color: #2f575d;
  font-size: 0.92rem;
}

.upload-box small {
  color: #8ba0a3;
  font-size: 0.78rem;
}

.upload-box input {
  display: none;
}

.file-info {
  margin: 0.75rem 0 0;
  color: #6d9197;
  font-size: 0.85rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.top-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  margin-bottom: 1rem;
  margin-top: -5.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  min-height: 2.85rem;
  padding: 0 1.35rem;

  border-radius: 0.75rem;
  border: 1px solid transparent;

  font-size: 0.92rem;
  font-weight: 700;

  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary {
  background: #2f575d;
  color: #ffffff;
  border-color: #2f575d;
}

.btn-primary:hover {
  background: #26494d;
}

.btn-primary .material-icons-round {
  color: #ffffff;
  font-size: 1.1rem;
}

.btn-secondary {
  background: #ffffff;
  color: #2f575d;
  border-color: #c4cdc1;
}

.btn-secondary:hover {
  background: #f8f9f8;
}

@media (max-width: 1050px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 800px) {
  .form-grid,
  .technology-add-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn,
  .add-tech-btn {
    width: 100%;
  }
}
</style>