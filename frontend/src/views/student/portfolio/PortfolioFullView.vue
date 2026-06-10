<script setup>
import { computed, onMounted, ref } from "vue";
import "@/assets/styles/PorftolioFullView.css";
import { useRoute, useRouter } from "vue-router";
import PortfolioHero from "@/components/student/portfolio/PortfolioHero.vue";
import PortfolioSection from "@/components/student/portfolio/PortfolioSection.vue";
import {
  getPublicPortfolioData,
  getStudentPortfolioData,
} from "@/services/studentPortfolioService";
import { getBadgeIcon } from "@/utils/badges";
import api from "@/services/api";

const router = useRouter();
const route = useRoute();

const portfolioData = ref(null);
const isLoading = ref(false);

const selectedItem = ref(null);
const selectedType = ref("");
const isModalOpen = ref(false);
const selectedTheme = ref("modern-academic");
const githubData = ref(null);
const includeGithubActivity = ref(true);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const mediaDataUrls = ref({});
const defaultCoverByType = {
  project: "/portfolio/project-1.jpg",
  internship: "/portfolio/stage-1.jpg",
  activity: "/portfolio/activity-1.jpg",
};

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

const applyPortfolioConfig = (data) => {
  const config = data?.portfolioConfig;

  if (!config) {
    includeGithubActivity.value = true;
    return data;
  }

  selectedTheme.value = normalizeTheme(config.theme);

  const includedSections = new Set(config.includedSections || []);
  const includedItems = config.includedItems || {};
  includeGithubActivity.value = includedSections.has("githubActivity");

  return {
    ...data,
    skills: includedSections.has("skills") ? data.skills || [] : [],
    softSkills: includedSections.has("softSkills") ? data.softSkills || [] : [],
    badges: includedSections.has("badges") ? data.badges || [] : [],
    academicPaths: includedSections.has("academicPaths")
      ? data.academicPaths || []
      : [],
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

const formatAcademicYear = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("fr-FR", { year: "numeric" }).format(
    parsedDate,
  );
};

const getAcademicPathPeriod = (path) => {
  const start = formatAcademicYear(path.startDate);
  const end = path.endDate ? formatAcademicYear(path.endDate) : "Aujourd’hui";

  return start ? `${start} - ${end}` : end;
};

const fetchPortfolio = async () => {
  isLoading.value = true;

  try {
    const data = route.params.slug
      ? await getPublicPortfolioData(route.params.slug)
      : await getStudentPortfolioData();

    portfolioData.value = applyPortfolioConfig(data);
    githubData.value = includeGithubActivity.value
      ? portfolioData.value?.githubActivity || null
      : null;
    await loadPortfolioMediaDataUrls();
  } finally {
    isLoading.value = false;
  }
};

const pageThemeClass = computed(() => `theme-${selectedTheme.value}`);

const githubCalendarColor = computed(() => {
  const colorByTheme = {
    "modern-academic": "2F575D",
    "code-dark": "26A641",
    "pixel-tech": "7BC6B2",
    "neo-brutalist": "C89B3C",
  };

  return colorByTheme[selectedTheme.value] || colorByTheme["modern-academic"];
});

const getCoverImage = (item, type = "project") => {
  const image =
    item?.coverImage || item?.screenshots?.[0] || item?.images?.[0] || null;

  return (
    getImageUrl(image) || defaultCoverByType[type] || defaultCoverByType.project
  );
};

const handleCoverImageError = (event, type = "project") => {
  const fallback = defaultCoverByType[type] || defaultCoverByType.project;

  if (event.target.src.endsWith(fallback)) return;

  event.target.src = fallback;
};

const getDisplayName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.fullName || "";
};

const buildBackendUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  return `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

const getRawImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.imageUrl || image.url || image.mediaUrl || "";
};

const getImageUrl = (image) => {
  const rawUrl = getRawImageUrl(image);
  return mediaDataUrls.value[rawUrl] || buildBackendUrl(rawUrl);
};

const getImageKey = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return (
    image.id || image.imageUrl || image.url || image.mediaUrl || image.title
  );
};

const getImageTitle = (image) => {
  if (!image || typeof image === "string")
    return selectedItem.value?.title || "";
  return image.title || image.fileName || selectedItem.value?.title || "";
};

const selectedImages = computed(() => [
  ...(selectedItem.value?.screenshots || []),
  ...(selectedItem.value?.images || []),
]);

const collectPortfolioImages = () => {
  const data = portfolioData.value || {};
  const items = [
    ...(data.projects || []),
    ...(data.internships || []),
    ...(data.activities || []),
  ];

  return items.flatMap((item) => [
    item.coverImage,
    ...(item.screenshots || []),
    ...(item.images || []),
  ]);
};

const buildApiRequestUrl = (url) => {
  if (!url) return "";

  const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, "");
  const apiPrefix = `${normalizedBaseUrl}/api`;

  if (normalizedBaseUrl && url.startsWith(`${apiPrefix}/`)) {
    return url.slice(apiPrefix.length);
  }

  if (url.startsWith("/api/")) {
    return url.slice(4);
  }

  return url;
};

const canFetchWithApi = (url) => {
  if (!url) return false;
  const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, "");
  return url.startsWith("/api/") || url.startsWith(`${normalizedBaseUrl}/api/`);
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const loadPortfolioMediaDataUrls = async () => {
  mediaDataUrls.value = {};

  const urls = [
    ...new Set(
      collectPortfolioImages().map(getRawImageUrl).filter(canFetchWithApi),
    ),
  ];

  const entries = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await api.get(buildApiRequestUrl(url), {
          responseType: "blob",
          skipForbiddenRedirect: true,
        });
        return [url, await blobToDataUrl(response.data)];
      } catch {
        return null;
      }
    }),
  );

  mediaDataUrls.value = Object.fromEntries(entries.filter(Boolean));
};

const getPublicPortfolioUrl = () => {
  const slug = portfolioData.value?.portfolio?.publicSlug || route.params.slug;

  if (!slug) return window.location.href;

  return `${window.location.origin}/portfolio/${slug}`;
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
  if (route.params.slug) {
    router.push("/");
    return;
  }

  router.push("/student/portfolio");
};

const copyLink = async () => {
  await navigator.clipboard.writeText(getPublicPortfolioUrl());
  alert("Lien copié.");
};

const sharePortfolio = async () => {
  if (navigator.share) {
    await navigator.share({
      title: "Portfolio Credencia",
      url: getPublicPortfolioUrl(),
    });
  } else {
    await copyLink();
  }
};

const exportPdf = () => {
  window.print();
};

onMounted(fetchPortfolio);
</script>

<template>
  <section class="portfolio-full-page" :class="pageThemeClass">
    <header class="portfolio-topbar">
      <button class="back-home-btn" @click="goBack">
        <span class="material-icons-round">arrow_back</span>
        Mon espace
      </button>

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

        <PortfolioSection
          title="Biographie"
          icon="format_quote"
          :theme="selectedTheme"
        >
          <p class="bio-text">
            {{ portfolioData.student.bio }}
          </p>
        </PortfolioSection>

        <PortfolioSection
          v-if="githubData?.connected && githubData?.username"
          title="Calendrier d’activité GitHub"
          icon="calendar_month"
          :theme="selectedTheme"
        >
          <div class="portfolio-github-calendar">
            <div class="portfolio-github-chart-wrap">
              <img
                :src="`https://ghchart.rshah.org/${githubCalendarColor}/${githubData.username}`"
                alt="Calendrier des contributions GitHub"
                class="portfolio-github-chart"
              />
            </div>

            <div class="portfolio-github-legend">
              <span>Moins d’activité</span>
              <i></i>
              <i class="l1"></i>
              <i class="l2"></i>
              <i class="l3"></i>
              <i class="l4"></i>
              <span>Plus d’activité</span>
            </div>
          </div>
        </PortfolioSection>

        <PortfolioSection
          v-if="portfolioData.academicPaths?.length"
          title="Parcours académique"
          icon="school"
          :theme="selectedTheme"
        >
          <div class="academic-timeline">
            <article
              v-for="path in portfolioData.academicPaths"
              :key="
                path.id ||
                `${path.degree}-${path.institution}-${path.startDate}`
              "
              class="academic-step"
            >
              <div class="academic-period">
                {{ getAcademicPathPeriod(path) }}
              </div>

              <div class="academic-marker-wrap" aria-hidden="true">
                <span class="academic-marker"></span>
              </div>

              <div class="academic-content">
                <div class="academic-text">
                  <h3>
                    {{ path.degree }}
                    <span v-if="path.field" class="academic-title-field">
                      En {{ path.field }}
                    </span>
                  </h3>
                  <p class="academic-institution">
                    <span class="material-icons-round">location_on</span>
                    {{ path.institution }}
                  </p>
                  <p v-if="path.description" class="academic-description">
                    {{ path.description }}
                  </p>
                </div>
              </div>
            </article>
          </div>
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
              <span
                v-for="skill in portfolioData.skills"
                :key="skill.id || skill.name"
              >
                {{ getDisplayName(skill) }}
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
              <span
                v-for="skill in portfolioData.softSkills"
                :key="skill.id || skill.name"
              >
                {{ getDisplayName(skill) }}
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
              <img
                v-if="badge.iconUrl"
                :src="badge.iconUrl"
                :alt="badge.name"
                class="badge-image"
              />
              <span v-else class="material-icons-round">
                {{ getBadgeIcon(badge) }}
              </span>
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
                :src="getCoverImage(project, 'project')"
                :alt="project.title"
                class="card-image"
                @error="handleCoverImageError($event, 'project')"
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

                  <span v-if="project.role">
                    <span class="material-icons-round">badge</span>
                    Rôle : {{ project.role }}
                  </span>

                  <span v-if="project.team">
                    <span class="material-icons-round">groups</span>
                    {{ project.team }}
                  </span>

                  <span v-if="project.teamSize">
                    <span class="material-icons-round">groups</span>
                    Équipe : {{ project.teamSize }}
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
                    :href="buildBackendUrl(project.githubUrl)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="icon-action"
                    title="GitHub"
                  >
                    <svg
                      class="github-mark"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.11-.75.41-1.26.74-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.17 1.18A11.1 11.1 0 0 1 12 6.12c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.79 1.07.79 2.16v3.02c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
                      />
                    </svg>
                    GitHub
                  </a>

                  <a
                    v-if="project.demoUrl"
                    :href="buildBackendUrl(project.demoUrl)"
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
                :src="getCoverImage(stage, 'internship')"
                :alt="stage.title"
                class="card-image"
                @error="handleCoverImageError($event, 'internship')"
              />

              <div class="card-content">
                <div class="card-header">
                  <h3>{{ stage.title }}</h3>
                  <span>{{ stage.company }}</span>
                </div>

                <div class="card-title-divider"></div>

                <p class="meta">{{ stage.period }} · {{ stage.duration }}</p>

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
                    :href="buildBackendUrl(stage.reportUrl)"
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
                :src="getCoverImage(activity, 'activity')"
                :alt="activity.title"
                class="card-image"
                @error="handleCoverImageError($event, 'activity')"
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
                    :href="buildBackendUrl(activity.certificateUrl)"
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
                <p>{{ getDisplayName(letter.author) }} · {{ letter.type }}</p>

                <small v-if="letter.validator">
                  Validée par {{ letter.validator }}
                </small>
              </div>

              <a
                v-if="letter.downloadable && letter.documentUrl"
                :href="buildBackendUrl(letter.documentUrl)"
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
                {{ getDisplayName(rec.author).charAt(0) }}
              </div>

              <div>
                <h3>{{ getDisplayName(rec.author) }}</h3>
                <p class="meta">
                  {{ rec.authorJobTitle }} · {{ rec.organization }}
                </p>
                <blockquote>“{{ rec.content }}”</blockquote>
              </div>
            </article>
          </PortfolioSection>
        </div>
      </template>

      <footer class="portfolio-footer">
        <p>
          Portfolio généré avec <strong>Credencia</strong> — Plateforme
          académique de valorisation des parcours étudiants.
        </p>
      </footer>
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

          <div v-if="selectedItem?.role">
            <strong>Rôle</strong>
            <span>{{ selectedItem.role }}</span>
          </div>

          <div v-if="selectedItem?.team">
            <strong>Équipe</strong>
            <span>{{ selectedItem.team }}</span>
          </div>

          <div v-if="selectedItem?.teamSize">
            <strong>Équipe</strong>
            <span>{{ selectedItem.teamSize }}</span>
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

        <div v-if="selectedItem?.result" class="modal-block">
          <h3>Résultat</h3>

          <p>{{ selectedItem.result }}</p>
        </div>

        <div v-if="selectedItem?.technologies?.length" class="modal-block">
          <h3>Technologies utilisées</h3>

          <div class="chips small">
            <span v-for="tech in selectedItem.technologies" :key="tech">
              {{ tech }}
            </span>
          </div>
        </div>

        <div v-if="selectedImages.length" class="modal-block">
          <h3>Captures</h3>

          <div class="screenshots-grid">
            <img
              v-for="image in selectedImages"
              :key="getImageKey(image)"
              :src="getImageUrl(image)"
              :alt="getImageTitle(image)"
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
            :href="buildBackendUrl(selectedItem.githubUrl)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg class="github-mark" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.11-.75.41-1.26.74-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.17 1.18A11.1 11.1 0 0 1 12 6.12c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.79 1.07.79 2.16v3.02c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
              />
            </svg>
            GitHub
          </a>

          <a
            v-if="selectedItem?.demoUrl"
            :href="buildBackendUrl(selectedItem.demoUrl)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">open_in_new</span>
            Démo
          </a>

          <a
            v-if="selectedItem?.documentationUrl"
            :href="buildBackendUrl(selectedItem.documentationUrl)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">description</span>
            Documentation
          </a>

          <a
            v-if="selectedItem?.reportUrl"
            :href="buildBackendUrl(selectedItem.reportUrl)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">picture_as_pdf</span>
            Rapport PDF
          </a>

          <a
            v-if="selectedItem?.certificateUrl"
            :href="buildBackendUrl(selectedItem.certificateUrl)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">workspace_premium</span>
            Attestation
          </a>

          <a
            v-for="file in selectedItem?.attachments || []"
            :key="file.url"
            :href="buildBackendUrl(file.url)"
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
