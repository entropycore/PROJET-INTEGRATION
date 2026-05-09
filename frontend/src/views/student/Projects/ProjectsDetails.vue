<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute,useRouter } from 'vue-router'

import { getStudentProjectById } from '@/services/studentProjectsApis'
import { mockProjects } from '@/mockData/projects'

import '@/assets/styles/student-project-details.css'

const route = useRoute()
const router = useRouter()

const project = ref(null)
const isLoading = ref(false)

const statusLabels = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  APPROVED: 'Validé',
  REJECTED: 'Refusé',
  CHANGES_REQUESTED: 'Corrections demandées',
}

const canEditProject = computed(() => {
  return ['DRAFT', 'CHANGES_REQUESTED'].includes(
    project.value?.validationStatus,
  )
})

const projectStatusMessage = computed(() => {
  const messages = {
    DRAFT: {
      title: 'Projet en brouillon',
      text: 'Vous pouvez encore modifier ce projet avant de le soumettre à la validation.',
      icon: 'edit_note',
    },
    PENDING: {
      title: 'Validation en cours',
      text: 'Ce projet a été soumis. Il n\'est plus modifiable pendant son évaluation.',
      icon: 'schedule',
    },
    APPROVED: {
      title: 'Projet validé',
      text: 'Ce projet est validé et peut être utilisé dans votre portfolio académique.',
      icon: 'verified',
    },
    REJECTED: {
      title: 'Projet refusé',
      text: 'Ce projet a été refusé. Vous pouvez consulter le commentaire du validateur.',
      icon: 'cancel',
    },
    CHANGES_REQUESTED: {
      title: 'Corrections demandées',
      text: 'Des modifications sont attendues. Vous pouvez corriger le projet puis le resoumettre.',
      icon: 'rate_review',
    },
  }

  return messages[project.value?.validationStatus] || messages.DRAFT
})

const fetchProject = async () => {
  isLoading.value = true

  try {
    const response = await getStudentProjectById(route.params.id)
    project.value = response.data
  } catch (error) {
    console.warn('API project detail indisponible.')

    project.value = mockProjects.find(
      (item) => String(item.id) === String(route.params.id),
    )
  } finally {
    isLoading.value = false
  }
}

const displayScreenshots = computed(() => {
  const screenshots = project.value?.screenshots || []
  const placeholders = [
    { id: 'placeholder-1', title: 'Capture 1', imageUrl: null },
    { id: 'placeholder-2', title: 'Capture 2', imageUrl: null },
    { id: 'placeholder-3', title: 'Capture 3', imageUrl: null },
  ]

  return [...screenshots, ...placeholders].slice(0, 3)
})

const formatDate = (date) => {
  if (!date) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
const sortedValidationHistory = computed(() => {
  return [...(project.value?.validationHistory || [])].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})
const handleDeleteProject = () => {
  const confirmed = confirm(
    'Supprimer définitivement ce projet ?',
  )

  if (!confirmed) return

  console.log('Projet supprimé')

  router.push('/student/projects')
}

onMounted(fetchProject)
</script>

<template>
  <section class="project-details-page">
    <div
      v-if="isLoading"
      class="details-state"
    >
      Chargement du projet...
    </div>

    <template v-else-if="project">
      <div class="project-details-header">
        <div class="project-header-left">
          <RouterLink
            to="/student/projects"
            class="back-link"
          >
            <span class="material-icons-round">
              arrow_back
            </span>

            Retour aux projets
          </RouterLink>

          <div class="project-title-row">
             <h1 class="project-title">
               {{ project.title }}
             </h1>
             <span class="project-type-badge">
               {{ project.type }}
             </span>
           </div>
           <p v-if="project.validationStatus === 'APPROVED' && project.validatorName" class="project-header-validator"> Validé par <strong>{{ project.validatorName }}</strong></p>

           <p v-else-if="project.validationStatus === 'PENDING'" class="project-header-validator pending" > En attente de validation
           </p>

           <p v-else-if="project.validationStatus === 'CHANGES_REQUESTED'" class="project-header-validator pending" > Corrections demandées par
             <strong>{{ project.validatorName || 'le validateur' }}</strong>
           </p>
           <p v-else-if="project.validationStatus === 'REJECTED'" class="project-header-validator rejected" >
             Refusé par
             <strong>{{ project.validatorName || 'le validateur' }}</strong>
           </p>
           
           <p v-else class="project-header-validator muted" >
             Brouillon non soumis
           </p>
           <div class="project-header-meta">
           </div>
        </div>

        <div class="project-header-actions">

<RouterLink
  v-if="canEditProject"
  :to="`/student/projects/${project.id}/edit`"
  class="secondary-action"
>
  <span class="material-icons-round">edit</span>
  Modifier
</RouterLink>
        </div>
      </div>

      <div class="project-details-layout">
        <div class="project-main-column">
          <section class="details-card project-about-card">
            <h2 class="section-title">À propos du projet</h2>

            <p class="project-full-description">
              {{ project.description }}
            </p>

            <div class="project-about-meta">
              <div>
                <span>Rôle</span>
                <strong>{{ project.role || 'Non précisé' }}</strong>
              </div>

              <div>
                <span>Équipe</span>
                <strong>{{ project.teamSize || 'Non précisé' }}</strong>
              </div>
            </div>
          </section>

          <section class="details-card">
            <h2 class="section-title">Technologies utilisées</h2>

            <div class="project-tech-list">
              <span
                v-for="tech in project.technologies"
                :key="tech"
                class="project-tech-pill"
              >
                {{ tech }}
              </span>
            </div>
          </section>

          <section class="details-card">
            <h2 class="section-title">Liens du projet</h2>

            <div class="project-links-list">
              <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="project-link-item" >
                <span class="material-icons-round"> open_in_new</span>
                GitHub Repository
              </a>

              <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" class="project-link-item" >
                <span class="material-icons-round"> open_in_new</span>
                Demo du projet
              </a>

              <a v-if="project.documentationUrl" :href="project.documentationUrl "
                target="_blank"
                class="project-link-item"
              >
              <span class="material-icons-round"> open_in_new</span>
                Documentation
              </a>
              <p v-if="!project.githubUrl && !project.demoUrl &&!project.documentationUrl && !project.portfolioUrl"
                class="empty-section-message">
               Aucun lien ajouté pour ce projet.
              </p>
            </div>
          </section>

          <section class="details-card">
            <h2 class="section-title">Pièces jointes</h2>
            <div class="attachments-list">
              <div v-for="attachment in project.attachments" :key="attachment.id" class="attachment-card"  >
                <div class="attachment-left">
                  <span class="material-icons-round">
                    description
                  </span>
                  <div>
                    <strong>
                      {{ attachment.name }}
                    </strong>

                    <p>
                      {{ attachment.type }}
                    </p>
                  </div>
                </div>

                <button class="secondary-action" >
                  Télécharger
                </button>
              </div>
              <p v-if="!project.attachments?.length"  class="empty-section-message" > Aucune pièce jointe ajoutée.
              </p>
            </div>
          </section>

          <section class="details-card">
            <div class="section-title">
              <h2 class="section-title">Historique de validation</h2>
            </div>

            <div class="timeline-list">
              <div v-for="item in sortedValidationHistory"  :key="item.id"  class="timeline-item"  >
                <div class="timeline-dot"></div>

                <div class="timeline-content">
                    <div class="timeline-header">
                      <strong>{{ item.title }}</strong>

                      <span class="timeline-date">
                        {{ formatDate(item.createdAt) }}
                      </span>
                    </div>

                    <p>{{ item.comment }}</p>

                    <small>
                     {{ item.actorName }} — {{ item.actorRole }}
                    </small>
                </div>
              </div>
              <p v-if="!sortedValidationHistory.length"  class="empty-section-message">
                  Aucun historique de validation disponible.
                </p>
            </div>
          </section>
        </div>

        <aside class="project-sidebar">
          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                verified
              </span>

              Validation
            </div>
            <section class="details-card project-status-card" :class="project.validationStatus.toLowerCase().replace('_', '-')" >
              <div class="status-card-icon">
               <span class="material-icons-round">
                {{ projectStatusMessage.icon }}
               </span>
              </div>
              <div>
                <h3>{{ projectStatusMessage.title }}</h3>
                <p>{{ projectStatusMessage.text }}</p>
              </div>
            </section>
            <div class="validator-card">
              <div class="validator-avatar">
                {{ project.validatorName?.charAt(0)}}
              </div>

              <div>
                <strong>
                  {{project.validatorName ||'Non assigné'  }}
                </strong>
                <p>
                  Validateur académique
                </p>
              </div>
            </div>

            <div  v-if=" project.validationComment"  class="validation-comment" >
              “{{ project.validationComment }}”
            </div>
          </section>
          <section class="details-card">
  <div class="section-title">
    Captures d'écran
  </div>

  <div class="screenshots-grid">
    <button
      v-for="(screenshot, index) in displayScreenshots"
      :key="screenshot.id"
      type="button"
      class="screenshot-card"
    >
      <img
        v-if="screenshot.imageUrl"
        :src="screenshot.imageUrl"
        :alt="screenshot.title"
      />

      <div
        v-else
        class="screenshot-placeholder"
        :class="`variant-${(index % 3) + 1}`"
      >
        {{ screenshot.title }}
      </div>
    </button>
  </div>
</section>

          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                info
              </span>

              Informations
            </div>

            <div class="details-info-list">
              <div class="details-info-row">
                <span>Type</span>
                <strong>
                  {{ project.type }}
                </strong>
              </div>

              <div class="details-info-row">
                <span>Créé le</span>
                <strong>
                  {{ formatDate(  project.createdAt,   )  }}
                </strong>
              </div>

              <div class="details-info-row">
                <span>Statut</span>

                <strong>
                  {{ statusLabels[project.validationStatus  ]}}
                </strong>
              </div>
            </div>
          </section>
          <section
  v-if="['DRAFT', 'CHANGES_REQUESTED', 'REJECTED'].includes(project.validationStatus)"
  class="details-card delete-project-card"
>
  <div class="delete-project-content">
    <h3>Suppression du projet</h3>

    <p>
      Cette action est irréversible. Le projet, les captures
      d’écran et les pièces jointes seront supprimés.
    </p>

    <button
      type="button"
      class="delete-project-button"
      @click="handleDeleteProject"
    >
      Supprimer le projet
    </button>
  </div>
</section>
        </aside>
      </div>
    </template>
  </section>
</template>