<script setup>
import { computed, onMounted, ref } from "vue";
import "@/assets/styles/PorftolioFullView.css";
import { useRouter } from "vue-router";
import PortfolioHero from "@/components/student/portfolio/PortfolioHero.vue";
import PortfolioSection from "@/components/student/portfolio/PortfolioSection.vue";
import {
  exportMyPortfolioPdf,
  getGeneratedPortfolioConfig,
  getStudentPortfolioData,
} from "@/services/studentPortfolioService";

const router = useRouter();

const portfolioData = ref(null);
const isLoading = ref(false);

const selectedItem = ref(null);
const selectedType = ref("");
const isModalOpen = ref(false);
const selectedTheme = ref("modern-academic");

const normalizeTheme = (theme) => {
  const themeMap = {
    "minimal-recruiter": "code-dark",
    "creative-tech": "pixel-tech",
  };

  return themeMap[theme] || theme || "modern-academic";
};

const filterBySelectedIds = (items = [], selectedIds = []) => {
  const selectedIdSet = new Set(selectedIds.map(String));
  return items.filter((item) => selectedIdSet.has(String(item.id)));
};

const applyGeneratedPortfolioConfig = (data) => {
  const config = getGeneratedPortfolioConfig();

  if (!config) return data;

  selectedTheme.value = normalizeTheme(config.theme);

  const includedSections = new Set(config.includedSections || []);
  const includedItems = config.includedItems || {};

  return {
    ...data,
    skills: includedSections.has("skills") ? data.skills || [] : [],
    softSkills: includedSections.has("softSkills") ? data.softSkills || [] : [],
    badges: includedSections.has("badges") ? data.badges || [] : [],
    projects: filterBySelectedIds(data.projects, includedItems.projects),
    internships: filterBySelectedIds(
      data.internships,
      includedItems.internships,
    ),
    activities: filterBySelectedIds(data.activities, includedItems.activities),
    recommendationLetters: filterBySelectedIds(
      data.recommendationLetters,
      includedItems.recommendationLetters,
    ),
    recommendations: filterBySelectedIds(
      data.recommendations,
      includedItems.recommendations,
    ),
  };
};

const fetchPortfolio = async () => {
  isLoading.value = true;

  try {
    const data = await getStudentPortfolioData();
    portfolioData.value = applyGeneratedPortfolioConfig(data);
  } finally {
    isLoading.value = false;
  }
};

const pageThemeClass = computed(() => `theme-${selectedTheme.value}`);

const getCoverImage = (item) => {
  return item?.coverImage || item?.screenshots?.[0] || "";
};

const openDetails = (type, item) => {
  selectedType.value = type;
  selectedItem.value = item;
  isModalOpen.value = true;
};

const closeDetails = () => {
  selectedType.value = "";
  selectedItem.value = null;
  isModalOpen.value = false;
};

const goBack = () => {
  router.push("/student/portfolio");
};

const copyLink = async () => {
  await navigator.clipboard.writeText(window.location.href);
  alert("Lien copié.");
};

const sharePortfolio = async () => {
  if (navigator.share) {
    await navigator.share({
      title: "Portfolio Credencia",
      url: window.location.href,
    });
  } else {
    await copyLink();
  }
};

const exportPdf = async () => {
  try {
    const response = await exportMyPortfolioPdf();
    const data = response.data?.data || response.data;

    if (data?.downloadUrl) {
      window.open(data.downloadUrl, "_blank");
      return;
    }
  } catch {
    console.warn("Export PDF backend indisponible.");
  }

  window.print();
};

onMounted(fetchPortfolio);
</script>

<template>
  <section class="portfolio-full-page" :class="pageThemeClass">
    <header class="portfolio-topbar">
      <div class="brand">
        <span class="material-icons-round">verified_user</span>
        Credencia
      </div>

      <div class="top-actions">
        <button @click="copyLink">
          <span class="material-icons-round">link</span>
          Copier le lien
        </button>

        <button @click="exportPdf">
          <span class="material-icons-round">download</span>
          Exporter PDF
        </button>

        <button @click="sharePortfolio">
          <span class="material-icons-round">share</span>
          Partager
        </button>

        <button @click="goBack">
          <span class="material-icons-round">arrow_back</span>
          Mon espace
        </button>
      </div>
    </header>

    <main class="portfolio-container">
      <div v-if="isLoading" class="loading-card">
        Chargement du portfolio...
      </div>

      <template v-else-if="portfolioData">
        <PortfolioHero
          :student="portfolioData.student"
          :credibility-score="portfolioData.credibilityScore"
          :theme="selectedTheme"
        />

        <PortfolioSection title="Biographie" icon="format_quote" :theme="selectedTheme">
          <p class="bio-text">
            {{ portfolioData.student.bio }}
          </p>
        </PortfolioSection>

        <!-- COMPÉTENCES -->
        <div class="two-columns">
          <PortfolioSection
            v-if="portfolioData.skills?.length"
            title="Compétences techniques"
            icon="code"
            :theme="selectedTheme"
          >
            <div class="chips">
              <span v-for="skill in portfolioData.skills" :key="skill">
                {{ skill }}
              </span>
            </div>
          </PortfolioSection>

          <PortfolioSection
            v-if="portfolioData.softSkills?.length"
            title="Soft skills"
            icon="psychology"
            :theme="selectedTheme"
          >
            <div class="chips">
              <span v-for="skill in portfolioData.softSkills" :key="skill">
                {{ skill }}
              </span>
            </div>
          </PortfolioSection>
        </div>

        <PortfolioSection
          v-if="portfolioData.badges?.length"
          title="Badges obtenus"
          icon="workspace_premium"
          :theme="selectedTheme"
        >
          <div class="badge-grid">
            <div
              v-for="badge in portfolioData.badges"
              :key="badge.id"
              class="badge-card"
            >
              <span class="material-icons-round">{{ badge.icon }}</span>
              <strong>{{ badge.name }}</strong>
            </div>
          </div>
        </PortfolioSection>

        <PortfolioSection
          v-if="portfolioData.projects?.length"
          title="Projets validés"
          icon="business_center"
          :theme="selectedTheme"
        >
          <div class="cards-grid">
            <article
              v-for="project in portfolioData.projects"
              :key="project.id"
              class="portfolio-card"
            >
              <img
                v-if="getCoverImage(project)"
                :src="getCoverImage(project)"
                :alt="project.title"
                class="card-image"
              />

              <div class="card-content">
                <div class="card-header">
                  <h3>{{ project.title }}</h3>
                  <span>{{ project.type }}</span>
                </div>

                <div class="card-title-divider"></div>

                <p class="card-description">
                  {{ project.description }}
                </p>

                <div class="meta-list">
                  <span v-if="project.validator">
                    <span class="material-icons-round">verified</span>
                    Validé par {{ project.validator }}
                  </span>

                  <span v-if="project.roleInTeam">
                    <span class="material-icons-round">badge</span>
                    Rôle : {{ project.roleInTeam }}
                  </span>

                  <span v-if="project.team">
                    <span class="material-icons-round">groups</span>
                    {{ project.team }}
                  </span>
                </div>

                <div v-if="project.technologies?.length" class="tech-block">
                  <div class="card-subtitle">
                    <span class="material-icons-round">memory</span>
                    Technologies utilisées
                  </div>

                  <div class="chips small">
                    <span v-for="tech in project.technologies" :key="tech">
                      {{ tech }}
                    </span>
                  </div>
                </div>

                <div class="card-actions">
                  <a
                    v-if="project.githubUrl"
                    :href="project.githubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="icon-action"
                    title="GitHub"
                  >
                    <svg class="github-mark" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.11-.75.41-1.26.74-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.17 1.18A11.1 11.1 0 0 1 12 6.12c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.79 1.07.79 2.16v3.02c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                    </svg>
                    GitHub
                  </a>

                  <a
                    v-if="project.demoUrl"
                    :href="project.demoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="icon-action"
                    title="Démo"
                  >
                    <span class="material-icons-round">open_in_new</span>
                    Démo
                  </a>

                  <button @click="openDetails('project', project)">
                    <span class="material-icons-round">visibility</span>
                    Voir détails
                  </button>
                </div>
              </div>
            </article>
          </div>
        </PortfolioSection>

        <PortfolioSection
          v-if="portfolioData.internships?.length"
          title="Stages validés"
          icon="work"
          :theme="selectedTheme"
        >
          <div class="cards-grid">
            <article
              v-for="stage in portfolioData.internships"
              :key="stage.id"
              class="portfolio-card"
            >
              <img
                v-if="getCoverImage(stage)"
                :src="getCoverImage(stage)"
                :alt="stage.title"
                class="card-image"
              />

              <div class="card-content">
                <div class="card-header">
                  <h3>{{ stage.title }}</h3>
                  <span>{{ stage.company }}</span>
                </div>

                <div class="card-title-divider"></div>

                <p class="meta">
                  {{ stage.period }} · {{ stage.duration }}
                </p>

                <p class="card-description">
                  {{ stage.description }}
                </p>

                <div class="meta-list">
                  <span v-if="stage.supervisor">
                    <span class="material-icons-round">person</span>
                    Encadrant : {{ stage.supervisor }}
                  </span>

                  <span v-if="stage.department">
                    <span class="material-icons-round">domain</span>
                    {{ stage.department }}
                  </span>
                </div>

                <div v-if="stage.technologies?.length" class="tech-block">
                  <div class="card-subtitle">
                    <span class="material-icons-round">memory</span>
                    Technologies utilisées
                  </div>

                  <div class="chips small">
                    <span v-for="tech in stage.technologies" :key="tech">
                      {{ tech }}
                    </span>
                  </div>
                </div>

                <div class="card-actions">
                  <a
                    v-if="stage.reportUrl"
                    :href="stage.reportUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="icon-action"
                    title="Rapport PDF"
                  >
                    <span class="material-icons-round">picture_as_pdf</span>
                    Rapport PDF
                  </a>

                  <button @click="openDetails('internship', stage)">
                    <span class="material-icons-round">visibility</span>
                    Voir détails
                  </button>
                </div>
              </div>
            </article>
          </div>
        </PortfolioSection>

        <PortfolioSection
          v-if="portfolioData.activities?.length"
          title="Activités certifiées"
          icon="stars"
          :theme="selectedTheme"
        >
          <div class="cards-grid">
            <article
              v-for="activity in portfolioData.activities"
              :key="activity.id"
              class="portfolio-card"
            >
              <img
                v-if="getCoverImage(activity)"
                :src="getCoverImage(activity)"
                :alt="activity.title"
                class="card-image"
              />

              <div class="card-content">
                <div class="card-header">
                  <h3>{{ activity.title }}</h3>
                  <span>{{ activity.type }}</span>
                </div>

                <div class="card-title-divider"></div>

                <p class="meta">
                  {{ activity.organization }} · {{ activity.date }}
                </p>

                <p class="card-description">
                  {{ activity.description }}
                </p>

                <div class="meta-list">
                  <span v-if="activity.duration">
                    <span class="material-icons-round">schedule</span>
                    Durée : {{ activity.duration }}
                  </span>

                  <span v-if="activity.location">
                    <span class="material-icons-round">location_on</span>
                    Lieu : {{ activity.location }}
                  </span>

                  <span v-if="activity.validator">
                    <span class="material-icons-round">verified</span>
                    Validé par {{ activity.validator }}
                  </span>
                </div>

                <div class="card-actions">
                  <a
                    v-if="activity.certificateUrl"
                    :href="activity.certificateUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="icon-action"
                    title="Attestation"
                  >
                    <span class="material-icons-round">workspace_premium</span>
                    Attestation {{ activity.certificateType }}
                  </a>

                  <button @click="openDetails('activity', activity)">
                    <span class="material-icons-round">visibility</span>
                    Voir détails
                  </button>
                </div>
              </div>
            </article>
          </div>
        </PortfolioSection>

        <!-- LETTRES + RECOMMANDATIONS -->
        <div class="two-columns">
          <PortfolioSection
            v-if="portfolioData.recommendationLetters?.length"
            title="Lettres de recommandation"
            icon="mail"
            :theme="selectedTheme"
          >
            <article
              v-for="letter in portfolioData.recommendationLetters"
              :key="letter.id"
              class="simple-card"
            >
              <div>
                <h3>{{ letter.title }}</h3>
                <p>{{ letter.author }} · {{ letter.objective }}</p>

                <small v-if="letter.validator">
                  Validée par {{ letter.validator }}
                </small>
              </div>

              <a
                v-if="letter.downloadable"
                :href="letter.downloadUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="download-link"
              >
                <span class="material-icons-round">download</span>
                Télécharger
              </a>
            </article>
          </PortfolioSection>

          <PortfolioSection
            v-if="portfolioData.recommendations?.length"
            title="Recommandations"
            icon="format_quote"
            :theme="selectedTheme"
          >
            <article
              v-for="rec in portfolioData.recommendations"
              :key="rec.id"
              class="recommendation-card"
            >
              <div class="rec-avatar">
                {{ rec.initials }}
              </div>

              <div>
                <h3>{{ rec.author }}</h3>
                <p class="meta">{{ rec.role }} · {{ rec.organization }}</p>
                <blockquote>“{{ rec.content }}”</blockquote>
              </div>
            </article>
          </PortfolioSection>
        </div>
      </template>
    </main>

    <!-- MODAL DÉTAILS -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeDetails">
      <div class="details-modal" @click.stop>
        <button class="close-btn" @click="closeDetails">
          <span class="material-icons-round">close</span>
        </button>

        <span class="modal-type">
          {{ selectedType === "project" ? "Projet" : "" }}
          {{ selectedType === "internship" ? "Stage" : "" }}
          {{ selectedType === "activity" ? "Activité" : "" }}
        </span>

        <h2>{{ selectedItem?.title }}</h2>

        <p class="modal-description">
          {{ selectedItem?.description }}
        </p>

        <div class="modal-grid">
          <div v-if="selectedItem?.type">
            <strong>Type</strong>
            <span>{{ selectedItem.type }}</span>
          </div>

          <div v-if="selectedItem?.validator">
            <strong>Validateur</strong>
            <span>{{ selectedItem.validator }}</span>
          </div>

          <div v-if="selectedItem?.roleInTeam">
            <strong>Rôle</strong>
            <span>{{ selectedItem.roleInTeam }}</span>
          </div>

          <div v-if="selectedItem?.team">
            <strong>Équipe</strong>
            <span>{{ selectedItem.team }}</span>
          </div>

          <div v-if="selectedItem?.company">
            <strong>Entreprise</strong>
            <span>{{ selectedItem.company }}</span>
          </div>

          <div v-if="selectedItem?.department">
            <strong>Département</strong>
            <span>{{ selectedItem.department }}</span>
          </div>

          <div v-if="selectedItem?.supervisor">
            <strong>Encadrant</strong>
            <span>{{ selectedItem.supervisor }}</span>
          </div>

          <div v-if="selectedItem?.period">
            <strong>Période</strong>
            <span>{{ selectedItem.period }}</span>
          </div>

          <div v-if="selectedItem?.duration">
            <strong>Durée</strong>
            <span>{{ selectedItem.duration }}</span>
          </div>

          <div v-if="selectedItem?.organization">
            <strong>Organisme</strong>
            <span>{{ selectedItem.organization }}</span>
          </div>

          <div v-if="selectedItem?.location">
            <strong>Lieu</strong>
            <span>{{ selectedItem.location }}</span>
          </div>

          <div v-if="selectedItem?.date">
            <strong>Date</strong>
            <span>{{ selectedItem.date }}</span>
          </div>
        </div>

        <div v-if="selectedItem?.missions?.length" class="modal-block">
          <h3>Missions réalisées</h3>

          <ul>
            <li v-for="mission in selectedItem.missions" :key="mission">
              {{ mission }}
            </li>
          </ul>
        </div>

        <div v-if="selectedItem?.technologies?.length" class="modal-block">
          <h3>Technologies utilisées</h3>

          <div class="chips small">
            <span v-for="tech in selectedItem.technologies" :key="tech">
              {{ tech }}
            </span>
          </div>
        </div>

        <div v-if="selectedItem?.screenshots?.length" class="modal-block">
          <h3>Captures</h3>

          <div class="screenshots-grid">
            <img
              v-for="image in selectedItem.screenshots"
              :key="image"
              :src="image"
              :alt="selectedItem.title"
            />
          </div>
        </div>

        <div class="modal-links">
          <h3 class="modal-links-title">
            <span class="material-icons-round">folder_open</span>
            Pièces jointes
          </h3>

          <a
            v-if="selectedItem?.githubUrl"
            :href="selectedItem.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg class="github-mark" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.11-.75.41-1.26.74-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.17 1.18A11.1 11.1 0 0 1 12 6.12c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.79 1.07.79 2.16v3.02c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            GitHub
          </a>

          <a
            v-if="selectedItem?.demoUrl"
            :href="selectedItem.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">open_in_new</span>
            Démo
          </a>

          <a
            v-if="selectedItem?.documentationUrl"
            :href="selectedItem.documentationUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">description</span>
            Documentation
          </a>

          <a
            v-if="selectedItem?.reportUrl"
            :href="selectedItem.reportUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">picture_as_pdf</span>
            Rapport PDF
          </a>

          <a
            v-if="selectedItem?.certificateUrl"
            :href="selectedItem.certificateUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">workspace_premium</span>
            Attestation
          </a>

          <a
            v-for="file in selectedItem?.attachments || []"
            :key="file.url"
            :href="file.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">attach_file</span>
            {{ file.name }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>


