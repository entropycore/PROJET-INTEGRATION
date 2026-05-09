<script setup>
import { computed, onMounted, ref } from 'vue'

import {
  connectGithub,
  getGithubStats,
  importGithubRepository,
} from '@/services/studentGithub'

import '@/assets/styles/student-github.css'

const isLoading = ref(false)
const isConnecting = ref(false)
const errorMessage = ref('')
const githubData = ref(null)
const importedRepos = ref([])

const mockGithubData = {
  connected: false,
  username: null,
  totalContributions: 0,
  languages: [],
  repositories: [],
}

const isConnected = computed(() => githubData.value?.connected)
const repositories = computed(() => githubData.value?.repositories || [])
const languagesCount = computed(() => githubData.value?.languages?.length || 0)
const publicReposCount = computed(() => repositories.value.length)
const totalContributions = computed(() => githubData.value?.totalContributions || 0)

const fetchGithubStats = async () => {
  isLoading.value = true

  try {
    const response = await getGithubStats()
    githubData.value = response.data.data
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
    await importGithubRepository({
      repoName: repo.name,
      repoDescription: repo.description,
      repoUrl: repo.htmlUrl || repo.url,
      repoLanguage: repo.language,
    })

    importedRepos.value.push(repo.name)
  } catch (error) {
    console.error('Erreur import repo:', error)
    errorMessage.value = 'Impossible d’importer ce dépôt.'
  }
}

const isRepoImported = (repo) => {
  return repo.isImported || importedRepos.value.includes(repo.name)
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

    <div
      v-if="isLoading"
      class="github-state-card"
    >
      Chargement des données GitHub...
    </div>

    <template v-else>
      <template v-if="!isConnected">
        <section class="github-connect-hero">
          <div class="github-connect-content">
            <div class="github-small-icon">
  <img
    src="@/assets/icons/github-octocat.svg"
    alt="GitHub"
    class="github-logo-icon"
  >
</div>

            <h2>Lier votre compte GitHub</h2>

            <p>
              Accédez à vos dépôts, suivez vos contributions et importez vos
              projets GitHub dans Credencia en quelques clics.
            </p>

            <p
              v-if="errorMessage"
              class="github-inline-error"
            >
              {{ errorMessage }}
            </p>

            <button
              type="button"
              class="primary-action"
              :disabled="isConnecting"
              @click="handleConnectGithub"
            >
              {{ isConnecting ? 'Connexion...' : 'Connecter GitHub' }}
            </button>
          </div>
        </section>

        <section class="github-benefits-card">
          <h2>Pourquoi connecter GitHub à Credencia ?</h2>

          <div class="github-benefits-grid">
            <article class="github-benefit-item">
              <div class="benefit-icon">
                <span class="material-icons-round">
                  folder_open
                </span>
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
                <span class="material-icons-round">
                  bar_chart
                </span>
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
                <span class="material-icons-round">
                  auto_awesome
                </span>
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
        <section class="github-account-card">
          <div>
            <h2>Compte connecté</h2>

            <div class="github-user-row">
              <div class="github-avatar">
                {{ githubData.username?.charAt(0)?.toUpperCase() || 'G' }}
              </div>

              <div>
                <strong>github.com/{{ githubData.username }}</strong>
                <p>Synchronisé avec Credencia</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="secondary-action"
            @click="fetchGithubStats"
          >
            Synchroniser
          </button>
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

        <section class="github-card">
          <h2>Langages détectés</h2>

          <div
            v-if="githubData.languages?.length"
            class="github-languages-list"
          >
            <span
              v-for="language in githubData.languages"
              :key="language"
              class="github-language-pill"
            >
              {{ language }}
            </span>
          </div>

          <p
            v-else
            class="github-empty-message"
          >
            Aucun langage détecté pour le moment.
          </p>
        </section>

        <section class="github-card">
          <div class="github-card-header">
            <div>
              <h2>Dépôts GitHub</h2>
              <p>
                Importez un dépôt pour créer un projet brouillon dans votre portfolio.
              </p>
            </div>
          </div>

          <p
            v-if="errorMessage"
            class="github-inline-error"
          >
            {{ errorMessage }}
          </p>

          <div
            v-if="repositories.length"
            class="github-repositories-list"
          >
            <article
              v-for="repo in repositories"
              :key="repo.id || repo.name"
              class="github-repository-card"
            >
              <div>
                <h3>{{ repo.name }}</h3>

                <p>
                  {{ repo.description || 'Aucune description disponible.' }}
                </p>

                <div class="repo-meta">
                  <span>{{ repo.language || 'N/A' }}</span>

                  <span v-if="repo.updatedAt">
                    Dernière activité : {{ repo.updatedAt }}
                  </span>
                </div>
              </div>

              <button
                type="button"
                class="secondary-action"
                :disabled="isRepoImported(repo)"
                @click="handleImportRepository(repo)"
              >
                {{ isRepoImported(repo) ? 'Importé' : 'Importer' }}
              </button>
            </article>
          </div>

          <p
            v-else
            class="github-empty-message"
          >
            Aucun dépôt GitHub trouvé.
          </p>
        </section>
      </template>
    </template>
  </section>
</template>