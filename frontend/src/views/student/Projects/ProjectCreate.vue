<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import '@/assets/styles/student-project-edit.css'

const router = useRouter()

const newTechnology = ref('')
const newLinkLabel = ref('')
const newLinkUrl = ref('')

const validators = [
  'Pr. Moussaoui',
  'Pr. Benali',
  'Mme Ghizlan',
  'Pr. Haddad',
  'Pr. El Amrani',
]

const projectTypes = [
  'Module',
  'Intégration',
  'Hackathon',
  'Personnel',
  'Stage',
]

const projectForm = ref({
  title: '',
  type: 'Module',
  description: '',
  role: '',
  teamSize: '',
  validationStatus: 'DRAFT',

  technologies: [],

  githubUrl: '',
  demoUrl: '',
  documentationUrl: '',
  portfolioUrl: '',

  extraLinks: [],

  screenshots: [],
  attachments: [],

  validatorName: '',
})

const canSubmit = computed(() => {
  return (
    projectForm.value.title.trim() &&
    projectForm.value.description.trim() &&
    projectForm.value.validatorName
  )
})

const projectLinks = computed(() => {
  return [
    {
      key: 'githubUrl',
      label: 'GitHub Repository',
    },
    {
      key: 'demoUrl',
      label: 'Démo du projet',
    },
    {
      key: 'documentationUrl',
      label: 'Documentation',
    },
    {
      key: 'portfolioUrl',
      label: 'Portfolio',
    },
  ]
})

const addTechnology = () => {
  const value = newTechnology.value.trim()

  if (!value) return

  if (!projectForm.value.technologies.includes(value)) {
    projectForm.value.technologies.push(value)
  }

  newTechnology.value = ''
}

const removeTechnology = (tech) => {
  projectForm.value.technologies =
    projectForm.value.technologies.filter(
      (item) => item !== tech,
    )
}

const addCustomLink = () => {
  const label = newLinkLabel.value.trim()
  const url = newLinkUrl.value.trim()

  if (!label || !url) return

  projectForm.value.extraLinks.push({
    id: Date.now(),
    label,
    url,
  })

  newLinkLabel.value = ''
  newLinkUrl.value = ''
}

const removeCustomLink = (id) => {
  projectForm.value.extraLinks =
    projectForm.value.extraLinks.filter(
      (link) => link.id !== id,
    )
}

const handleScreenshotsUpload = (event) => {
  const files = Array.from(event.target.files || [])

  files.forEach((file) => {
    projectForm.value.screenshots.push({
      id: Date.now() + Math.random(),
      title: file.name,
      imageUrl: URL.createObjectURL(file),
    })
  })

  event.target.value = ''
}

const handleAttachmentsUpload = (event) => {
  const files = Array.from(event.target.files || [])

  files.forEach((file) => {
    projectForm.value.attachments.push({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type || 'FICHIER',
      url: '#',
    })
  })

  event.target.value = ''
}

const removeScreenshot = (id) => {
  projectForm.value.screenshots =
    projectForm.value.screenshots.filter(
      (screenshot) => screenshot.id !== id,
    )
}

const removeAttachment = (id) => {
  projectForm.value.attachments =
    projectForm.value.attachments.filter(
      (attachment) => attachment.id !== id,
    )
}

const createDraftProject = () => {
  console.log('Projet brouillon créé :', projectForm.value)

  router.push('/student/projects')
}

const createAndSubmitProject = () => {
  if (!canSubmit.value) return

  console.log('Projet créé et soumis :', projectForm.value)

  router.push('/student/projects')
}
</script>

<template>
  <section class="project-edit-page">
    <div class="edit-header">
      <div>
        <RouterLink
          to="/student/projects"
          class="back-link"
        >
          <span class="material-icons-round">
            arrow_back
          </span>

          Retour aux projets
        </RouterLink>

          <h1>Nouveau projet</h1>

        <p>
          Ajoutez un nouveau projet à votre portfolio académique.
        </p>
      </div>

      <div class="edit-header-actions">
        <button
          type="button"
          class="secondary-action"
          @click="createDraftProject"
        >
          Enregistrer
        </button>

        <button
          type="button"
          class="primary-action"
          :disabled="!canSubmit"
          @click="createAndSubmitProject"
        >
          Créer et soumettre
        </button>
      </div>
    </div>

    <div class="edit-layout">
      <div class="edit-main-column">
        <section class="edit-card">
          <h2>Informations principales</h2>

          <div class="form-grid">
            <label class="form-field full">
              <span>Titre du projet</span>

              <input
                v-model="projectForm.title"
                type="text"
                placeholder="Titre du projet"
              />
            </label>

            <label class="form-field">
              <span>Type</span>

              <select v-model="projectForm.type">
                <option
                  v-for="type in projectTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </option>
              </select>
            </label>

            <label class="form-field">
              <span>Validateur</span>

              <select v-model="projectForm.validatorName">
                <option value="">
                  Choisir un validateur
                </option>

                <option
                  v-for="validator in validators"
                  :key="validator"
                  :value="validator"
                >
                  {{ validator }}
                </option>
              </select>
            </label>

            <label class="form-field full">
              <span>À propos du projet</span>

              <textarea
                v-model="projectForm.description"
                rows="5"
                placeholder="Décrivez le projet..."
              ></textarea>
            </label>

            <label class="form-field">
              <span>Rôle</span>

              <input
                v-model="projectForm.role"
                type="text"
                placeholder="Ex: Dev Fullstack"
              />
            </label>

            <label class="form-field">
              <span>Équipe</span>

              <input
                v-model="projectForm.teamSize"
                type="text"
                placeholder="Ex: 4 membres"
              />
            </label>
          </div>
        </section>

        <section class="edit-card">
            <h2>Technologies utilisées</h2>

          <div class="project-tech-list">
            <span
              v-for="tech in projectForm.technologies"
              :key="tech"
              class="project-tech-pill editable"
            >
              {{ tech }}

              <button
                type="button"
                @click="removeTechnology(tech)"
              >
                ×
              </button>
            </span>
          </div>

          <div class="inline-add-form">
            <input
              v-model="newTechnology"
              type="text"
              placeholder="Ajouter une technologie"
              @keyup.enter="addTechnology"
            />

            <button
              type="button"
              class="secondary-action"
              @click="addTechnology"
            >
              Ajouter
            </button>
          </div>
        </section>

        <section class="edit-card">
          <h2>Liens du projet</h2>

          <div class="form-grid">
            <label
              v-for="link in projectLinks"
              :key="link.key"
              class="form-field full"
            >
              <span>{{ link.label }}</span>

              <input
                v-model="projectForm[link.key]"
                type="url"
                placeholder="https://..."
              />
            </label>
          </div>

          <div class="inline-add-form two-inputs">
            <input
              v-model="newLinkLabel"
              type="text"
              placeholder="Nom du lien"
            />

            <input
              v-model="newLinkUrl"
              type="url"
              placeholder="https://..."
            />

            <button
              type="button"
              class="secondary-action"
              @click="addCustomLink"
            >
              Ajouter
            </button>
          </div>

          <div
            v-if="projectForm.extraLinks.length"
            class="extra-links-list"
          >
            <div
              v-for="link in projectForm.extraLinks"
              :key="link.id"
              class="extra-link-item"
            >
              <span>{{ link.label }}</span>

              <button
                type="button"
                @click="removeCustomLink(link.id)"
              >
                Supprimer
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside class="edit-side-column">
        <section class="edit-card">
          <h2>Captures d’écran</h2>

          <label class="file-upload-box">
            <span class="material-icons-round">
              add_photo_alternate
            </span>

            <strong>
              Ajouter des captures
            </strong>

            <small>
              PNG, JPG ou WEBP
            </small>

            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleScreenshotsUpload"
            />
          </label>

          <div
            v-if="projectForm.screenshots.length"
            class="uploaded-list"
          >
            <div
              v-for="screenshot in projectForm.screenshots"
              :key="screenshot.id"
              class="uploaded-item"
            >
              <span>{{ screenshot.title }}</span>

              <button
                type="button"
                @click="removeScreenshot(screenshot.id)"
              >
                Supprimer
              </button>
            </div>
          </div>
        </section>

        <section class="edit-card">
          <h2>Pièces jointes</h2>

          <label class="file-upload-box">
            <span class="material-icons-round">
              attach_file
            </span>

            <strong>
              Ajouter des fichiers
            </strong>

            <small>
              PDF, image ou document
            </small>

            <input
              type="file"
              multiple
              @change="handleAttachmentsUpload"
            />
          </label>

          <div
            v-if="projectForm.attachments.length"
            class="uploaded-list"
          >
            <div
              v-for="attachment in projectForm.attachments"
              :key="attachment.id"
              class="uploaded-item"
            >
              <span>{{ attachment.name }}</span>

              <button
                type="button"
                @click="removeAttachment(attachment.id)"
              >
                Supprimer
              </button>
            </div>
          </div>
        </section>

        <section
          v-if="!canSubmit"
          class="edit-warning-card"
        >
          Complétez le titre, la description et choisissez un validateur avant de soumettre le projet.
        </section>
      </aside>
    </div>
  </section>
</template>