<script setup>
import { computed, onMounted, ref } from 'vue'

import { connectGithub,getGithubStats, importGithubRepository} from '@/services/studentGithub'

import '@/assets/styles/student-github.css'

const isLoading = ref(false)
const isConnecting = ref(false)
const errorMessage = ref('')
const githubData = ref(null)
const importedRepos = ref([])

const mockGithubData = {
  connected: true,

  username: 'Rime-seria',

  profileUrl: 'https://github.com/Rime-seria',

  publicRepos: 12,

  totalContributions: 284,

  languages: [
    'Vue.js',
    'JavaScript',
    'Node.js',
    'Express',
    'PostgreSQL',
    'Prisma',
    'Docker',
  ],

  repositories: [
    {
      id: 1,
      name: 'PROJET-INTEGRATION',

      description:
        'Plateforme académique de portfolios numériques adaptatifs et certifiés.',

      url: 'https://github.com/Rime-seria/PROJET-INTEGRATION',

      language: 'Vue.js',

      updatedAt: '2026-05-07T14:25:00Z',

      isImported: false,
    },

    {
      id: 2,
      name: 'credencia-backend',

      description:
        'Backend Express + Prisma de la plateforme Credencia.',

      url: 'https://github.com/Rime-seria/credencia-backend',

      language: 'Node.js',

      updatedAt: '2026-05-05T20:10:00Z',

      isImported: true,
    },

    {
      id: 3,
      name: 'testingPR',

      description:
        'Tests GitHub Actions et workflows CI/CD.',

      url: 'https://github.com/Rime-seria/testingPR',

      language: 'JavaScript',

      updatedAt: '2026-05-01T09:18:00Z',

      isImported: false,
    },

    {
      id: 4,
      name: 'portfolio-ui',

      description:
        'Expérimentations UI/UX pour les dashboards étudiants.',

      url: 'https://github.com/Rime-seria/portfolio-ui',

      language: 'CSS',

      updatedAt: '2026-04-28T11:00:00Z',

      isImported: false,
    },
  ],
}

const isConnected = computed(() => githubData.value?.connected)
const repositories = computed(() => githubData.value?.repositories || [])
const languagesCount = computed(() => githubData.value?.languages?.length || 0)

const publicReposCount = computed(() => {
  return githubData.value?.publicRepos || repositories.value.length
})

const totalContributions = computed(() => {
  return githubData.value?.totalContributions || 0
})

const fetchGithubStats = async () => {
  isLoading.value = true

  try {
    githubData.value = mockGithubData
  } catch (error) {
    console.error('Erreur récupération GitHub:', error)
    githubData.value = mockGithubData
  } finally {
    isLoading.value = false
  }
}

const handleConnectGithub = async () => {
  isConnecting.value = true
  errorMessage.value = ''

  try {
    const response = await connectGithub()
    window.location.href = response.data.data.url
  } catch (error) {
    console.error('Erreur connexion GitHub:', error)
    errorMessage.value = 'Connexion GitHub impossible pour le moment.'
  } finally {
    isConnecting.value = false
  }
}

const handleImportRepository = async (repo) => {
  errorMessage.value = ''

  try {
    const response = await importGithubRepository({
      repoName: repo.name,
      repoDescription: repo.description,
      repoUrl: repo.url,
      repoLanguage: repo.language,
    })

    importedRepos.value.push(repo.name)

    const projectId = response.data?.data?.project?.id

    if (projectId) {
      console.log('Projet créé depuis GitHub :', projectId)
    }
  } catch (error) {
    console.error('Erreur import repo:', error)
    errorMessage.value = 'Impossible d\'importer ce dépôt.'
  }
}

const isRepoImported = (repo) => {
  return repo.isImported || importedRepos.value.includes(repo.name)
}

const formatDate = (date) => {
  if (!date) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

onMounted(fetchGithubStats)
</script>

<template>
  <section class="student-github-page">
    <header class="github-page-header">
      <span class="page-kicker">GITHUB</span>

      <h1>Mon GitHub</h1>

      <p>
        Connectez votre compte GitHub pour enrichir automatiquement votre portfolio.
      </p>
    </header>

    <div  v-if="isLoading"  class="github-state-card"  >
      Chargement des données GitHub...
    </div>

    <template v-else>
      <template v-if="!isConnected">
        <section class="github-connect-hero">
          <div class="github-connect-content">
            <div class="github-small-icon">
              <img src="@/assets/icons/github-octocat.svg"  alt="GitHub"  class="github-logo-icon" />
            </div>

            <h2>Lier votre compte GitHub</h2>

            <p>
              Accédez à vos dépôts, suivez vos contributions et importez vos
              projets GitHub dans Credencia en quelques clics.
            </p>

            <p  v-if="errorMessage"  class="github-inline-error"  >
              {{ errorMessage }}
            </p>

            <button  type="button"  class="primary-action"  :disabled="isConnecting"  @click="handleConnectGithub"  >
              {{ isConnecting ? 'Connexion...' : 'Connecter GitHub' }}
            </button>
          </div>
        </section>

        <section class="github-benefits-card">
          <h2>Pourquoi connecter GitHub à Credencia ?</h2>

          <div class="github-benefits-grid">
            <article class="github-benefit-item">
              <div class="benefit-icon">
                <span class="material-icons-round">folder_open</span>
              </div>

              <div>
                <h3>Importez vos projets</h3>
                <p>
                  Transformez vos dépôts en projets brouillons dans votre portfolio.
                </p>
              </div>
            </article>

            <article class="github-benefit-item">
              <div class="benefit-icon">
                <span class="material-icons-round">bar_chart</span>
              </div>

              <div>
                <h3>Suivez vos contributions</h3>
                <p>
                  Visualisez vos statistiques et votre activité GitHub.
                </p>
              </div>
            </article>

            <article class="github-benefit-item">
              <div class="benefit-icon">
                <span class="material-icons-round">auto_awesome</span>
              </div>

              <div>
                <h3>Gagnez du temps</h3>
                <p>
                  Préremplissez automatiquement les informations techniques importantes.
                </p>
              </div>
            </article>
          </div>
        </section>
      </template>

      <template v-else>
  <section class="github-account-panel">
    <div class="github-account-head">
      <h3>Compte connecté</h3>

      <span class="github-badge-connected">
        <span></span>
        Connecté
      </span>
    </div>

    <div class="github-account-body">
      <div class="github-account-avatar">
        <span class="material-icons-round">hub</span>
      </div>

      <div>
        <a :href="githubData.profileUrl" target="_blank"  rel="noopener noreferrer"  class="github-profile-link" > github.com/{{ githubData.username }}
            <span class="material-icons-round">open_in_new</span>
        </a>
        <p>Synchronisé avec Credencia</p>
      </div>

      <button  type="button"  class="github-sync-btn"  @click="fetchGithubStats"  >
        <span class="material-icons-round">sync</span>
        Synchroniser
      </button>
    </div>
  </section>

  <div class="github-stats-grid">
    <section class="github-stat-card">
      <span>Dépôts publics</span>
      <strong>{{ publicReposCount }}</strong>
    </section>

    <section class="github-stat-card">
      <span>Contributions</span>
      <strong>{{ totalContributions }}</strong>
    </section>

    <section class="github-stat-card">
      <span>Langages</span>
      <strong>{{ languagesCount }}</strong>
    </section>
  </div>

  <section class="github-content-card">
  <div class="github-card-title-row">
    <h3>Calendrier d'activité</h3>
  </div>

  <div class="github-chart-wrap">
    <img
      v-if="githubData.username"
      :src="`https://ghchart.rshah.org/2F575D/${githubData.username}`"
      alt="Calendrier des contributions GitHub"
      class="github-contribution-chart"
    />
  </div>
</section>

  <section class="github-table-card">
    <div class="github-table-title">
      <h3>Dépôts à inclure dans le portfolio</h3>
      <p>Importez un dépôt pour créer un projet brouillon dans votre portfolio.</p>
    </div>

    <p  v-if="errorMessage"  class="github-inline-error" >
      {{ errorMessage }}
    </p>

    <table>
      <thead>
        <tr>
          <th>Dépôt</th>
          <th>Technologie</th>
          <th>Dernière activité</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="repo in repositories" :key="repo.id || repo.name" >
          <td>
            <strong>{{ repo.name }}</strong>
            <p>{{ repo.description || 'Aucune description disponible.' }}</p>
          </td>

          <td>
            <span class="github-language-pill">
              {{ repo.language || 'N/A' }}
            </span>
          </td>

          <td class="github-muted">
            {{ formatDate(repo.updatedAt) }}
          </td>

          <td>
            <button  type="button" class="github-import-project-btn" :class="{ imported: isRepoImported(repo) }" :disabled="isRepoImported(repo)" @click="handleImportRepository(repo)">
                {{ isRepoImported(repo) ? 'Déjà importé' : '+ Projet' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!repositories.length" class="github-empty-message" >
      Aucun dépôt GitHub trouvé.
    </p>
  </section>
</template>
    </template>
  </section>
</template>