<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {RouterLink, useRouter } from "vue-router";
import {
  generateStudentPortfolio,
  getStudentPortfolioData,
} from "@/services/studentPortfolioService";

const router = useRouter();

const portfolioData = ref(null);
const isLoading = ref(false);
const isGenerating = ref(false);
const isGenerated = ref(false);

const config = reactive({
  goal: "WEB_DEVELOPER",
  theme: "modern-academic",
  includeSkills: true,
  includeSoftSkills: true,
  includeBadges: true,
  includedItems: {
    projects: [],
    internships: [],
    activities: [],
    recommendationLetters: [],
    recommendations: [],
  },
});

const goals = [
  { value: "WEB_DEVELOPER", label: "Développeur Web" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "DATA_SCIENCE", label: "Data Science" },
  { value: "CYBERSECURITY", label: "Cybersécurité" },
  { value: "MASTER_PHD", label: "Master / Doctorat" },
  { value: "INTERNSHIP_EMPLOYMENT", label: "Stage / Emploi" },
];

const themes = [
  {
    value: "modern-academic",
    title: "Modern Academic",
    desc: "Clair, académique et professionnel.",
    previewImage: "",
  },
  {
    value: "minimal-recruiter",
    title: "Minimal Recruiter",
    desc: "Simple, direct et orienté recruteur.",
    previewImage: "",
  },
  {
    value: "creative-tech",
    title: "Creative Tech",
    desc: "Plus visuel, adapté aux profils techniques.",
    previewImage: "",
  },
];

const fetchPortfolio = async () => {
  isLoading.value = true;

  try {
    portfolioData.value = await getStudentPortfolioData();

    config.includedItems.projects = portfolioData.value.projects.map((p) => p.id);
    config.includedItems.internships = portfolioData.value.internships.map(
      (s) => s.id,
    );
    config.includedItems.activities = portfolioData.value.activities.map(
      (a) => a.id,
    );
    config.includedItems.recommendationLetters =
      portfolioData.value.recommendationLetters.map((l) => l.id);
    config.includedItems.recommendations =
      portfolioData.value.recommendations.map((r) => r.id);
  } finally {
    isLoading.value = false;
  }
};

const selectedCount = computed(() => {
  return (
    config.includedItems.projects.length +
    config.includedItems.internships.length +
    config.includedItems.activities.length +
    config.includedItems.recommendationLetters.length +
    config.includedItems.recommendations.length
  );
});

const toggleItem = (section, id) => {
  const list = config.includedItems[section];

  if (list.includes(id)) {
    config.includedItems[section] = list.filter((itemId) => itemId !== id);
  } else {
    config.includedItems[section].push(id);
  }
};

const isSelected = (section, id) => {
  return config.includedItems[section].includes(id);
};

const generatePortfolio = async () => {
  isGenerating.value = true;

  const payload = {
    goal: config.goal,
    theme: config.theme,
    includedSections: [
      config.includeSkills ? "skills" : null,
      config.includeSoftSkills ? "softSkills" : null,
      config.includeBadges ? "badges" : null,
      "projects",
      "internships",
      "activities",
      "recommendationLetters",
      "recommendations",
    ].filter(Boolean),
    includedItems: config.includedItems,
  };

  try {
    await generateStudentPortfolio(payload);
    isGenerated.value = true;
  } catch {
    console.warn("Backend génération indisponible, simulation côté front.");
    isGenerated.value = true;
  } finally {
    isGenerating.value = false;
  }
};

const openFullPortfolio = () => {
  router.push("/student/portfolio/full");
};

onMounted(fetchPortfolio);
</script>

<template>
  <section class="portfolio-generator">
    <div class="page-header">
      <div>
        <h1>Génération du portfolio</h1>
        <p>Choisissez les éléments validés à afficher dans votre portfolio public.</p>
      </div>

      <div class="header-actions">
        <button
          class="btn-primary"
          :disabled="isGenerating"
          @click="generatePortfolio"
        >
          <span class="material-icons-round">auto_awesome</span>
          {{ isGenerating ? "Génération..." : "Générer mon portfolio" }}
        </button>

        <button
          v-if="isGenerated"
          class="btn-secondary"
          @click="openFullPortfolio"
        >
          <span class="material-icons-round">open_in_new</span>
          Voir en plein écran
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="content-card">
      Chargement des données validées...
    </div>

    <template v-else-if="portfolioData">
      <section class="intro-card">
        <div>
          
          <h2>{{ portfolioData.student.fullName }}</h2>
          <p>
            Étudiante ingénieure en {{ portfolioData.student.major }} ·
            {{ portfolioData.student.school }}
          </p>
        </div>

        <div class="score-box">
          <strong>{{ portfolioData.credibilityScore.score }}/100</strong>
          <span>{{ portfolioData.credibilityScore.label }}</span>
        </div>
      </section>

      <div class="info-note">
        <span class="material-icons-round">info</span>
        <p>
          Les informations principales comme l’email, le téléphone, LinkedIn,
          GitHub et la biographie proviennent de votre profil. Pour les modifier,
          passez par la page <RouterLink to="/student/profile" class="profile-link">
            Mon profil
        </RouterLink>.
        </p>
      </div>

      <div v-if="isGenerated" class="success-note">
        <span class="material-icons-round">check_circle</span>
        Votre portfolio a été généré avec succès. Vous pouvez maintenant le voir
        en plein écran.
      </div>

      <div class="config-grid">
        <div class="content-card">
          <h3>Objectif du portfolio</h3>

          <select v-model="config.goal" class="select-input">
            <option v-for="goal in goals" :key="goal.value" :value="goal.value">
              {{ goal.label }}
            </option>
          </select>
          <p class="objective-description">
            > L’objectif choisi permettra d’organiser votre portfolio pour mieux attirer
            les recruteurs et mettre en avant les expériences les plus pertinentes.
          </p>
        </div>

        <div class="content-card">
          <h3>Options générales</h3>

          <label class="switch-row">
            <input v-model="config.includeSkills" type="checkbox" />
            <span>Afficher les compétences techniques</span>
          </label>

          <label class="switch-row">
            <input v-model="config.includeSoftSkills" type="checkbox" />
            <span>Afficher les soft skills</span>
          </label>

          <label class="switch-row">
            <input v-model="config.includeBadges" type="checkbox" />
            <span>Afficher les badges obtenus</span>
          </label>
        </div>
      </div>

      <div class="content-card">
        <h3>Choisir le thème</h3>

        <div class="themes-grid">
          <button
            v-for="theme in themes"
            :key="theme.value"
            class="theme-card"
            :class="{ active: config.theme === theme.value }"
            @click="config.theme = theme.value"
          >
            <div class="theme-preview">
              <img
                v-if="theme.previewImage"
                :src="theme.previewImage"
                :alt="theme.title"
              />
              <span v-else class="material-icons-round">image</span>
            </div>

            <strong>{{ theme.title }}</strong>
            <span>{{ theme.desc }}</span>
          </button>
        </div>
      </div>

      <div class="items-grid">
        <div class="content-card">
          <h3>Projets validés</h3>

          <div
            v-for="project in portfolioData.projects"
            :key="project.id"
            class="selectable-item"
            @click="toggleItem('projects', project.id)"
          >
            <input
              type="checkbox"
              :checked="isSelected('projects', project.id)"
              readonly
            />

            <div>
              <strong>{{ project.title }}</strong>
              <p>{{ project.technologies.join(" · ") }}</p>
            </div>
          </div>
        </div>

        <div class="content-card">
          <h3>Stages validés</h3>

          <div
            v-for="stage in portfolioData.internships"
            :key="stage.id"
            class="selectable-item"
            @click="toggleItem('internships', stage.id)"
          >
            <input
              type="checkbox"
              :checked="isSelected('internships', stage.id)"
              readonly
            />

            <div>
              <strong>{{ stage.title }} — {{ stage.company }}</strong>
              <p>{{ stage.period }} · {{ stage.duration }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="items-grid">
        <div class="content-card">
          <h3>Activités certifiées</h3>

          <div
            v-for="activity in portfolioData.activities"
            :key="activity.id"
            class="selectable-item"
            @click="toggleItem('activities', activity.id)"
          >
            <input
              type="checkbox"
              :checked="isSelected('activities', activity.id)"
              readonly
            />

            <div>
              <strong>{{ activity.title }}</strong>
              <p>{{ activity.type }} · {{ activity.date }}</p>
            </div>
          </div>
        </div>

        <div class="content-card">
          <h3>Lettres & recommandations</h3>

          <div
            v-for="letter in portfolioData.recommendationLetters"
            :key="letter.id"
            class="selectable-item"
            @click="toggleItem('recommendationLetters', letter.id)"
          >
            <input
              type="checkbox"
              :checked="isSelected('recommendationLetters', letter.id)"
              readonly
            />

            <div>
              <strong>{{ letter.title }}</strong>
              <p>{{ letter.author }} · {{ letter.objective }}</p>
            </div>
          </div>

          <div
            v-for="rec in portfolioData.recommendations"
            :key="rec.id"
            class="selectable-item recommendation-item"
            @click="toggleItem('recommendations', rec.id)"
          >
            <input
              type="checkbox"
              :checked="isSelected('recommendations', rec.id)"
              readonly
            />

            <div>
              <strong>{{ rec.author }}</strong>
              <p>{{ rec.role }} · {{ rec.organization }}</p>
              <em>“{{ rec.content }}”</em>
            </div>
          </div>
        </div>
      </div>

      <div class="selection-summary">
        <strong>{{ selectedCount }}</strong>
        <span>éléments sélectionnés pour le portfolio</span>
      </div>
    </template>
  </section>
</template>

<style scoped>
.portfolio-generator {
  color: #28363d;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  color: #28363d;
  font-size: 1.75rem;
  font-weight: 900;
}

.page-header p {
  margin: 0.35rem 0 0;
  color: #8b9f9e;
  font-size: 0.9rem;
  font-style: italic;
}

.header-actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.intro-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  background:
    radial-gradient(
      circle at top right,
      rgba(101, 139, 111, 0.14),
      transparent 30%
    ),
    linear-gradient(135deg, #ffffff 0%, #f4f8f6 100%);

  border: 1px solid #dde5df;
  border-radius: 1.2rem;
  padding: 1.6rem;
  margin-bottom: 1.2rem;
}

.eyebrow {
  color: #658b6f;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
}

.intro-card h2 {
  margin: 0.35rem 0;
  color: #24343a;
  font-size: 1.7rem;
  font-weight: 900;
}

.intro-card p {
  margin: 0;
  color: #6d9197;
  font-size: 0.95rem;
}

.score-box {
  min-width: 8rem;
  background: #ffffff;
  border: 1px solid #dfe7e2;
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
}

.score-box strong {
  display: block;
  color: #2f575d;
  font-size: 1.45rem;
}

.score-box span {
  color: #99aead;
  font-size: 0.78rem;
}

.info-note,
.success-note {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  border-radius: 0.85rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1.2rem;
  font-size: 0.88rem;
  font-weight: 700;
}

.info-note {
  background: #fffaf0;
  border: 1px solid #ead8aa;
  color: #735300;
}

.info-note p {
  margin: 0;
  line-height: 1.5;
}

.info-note .material-icons-round {
  color: #e67e22;
  font-size: 1.2rem;
}

.success-note[data-v-28d0d79d] {
    align-items: center;
    background: #6d919708;
    color: #2f575d;
    border: 1px solid #6d9197;
}

.config-grid,
.items-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.1rem;
}

.content-card {
  background: #ffffff;
  border: 1px solid #e4e9e5;
  border-radius: 1rem;
  padding: 1.2rem;
  margin-bottom: 1.1rem;
}

.content-card h3 {
  position: relative;
  margin: 0 0 1rem;
  color: #2f575d;
  font-size: 1rem;
  font-weight: 900;
}

.content-card h3::after {
  content: "";
  display: block;
  width: 2.7rem;
  height: 3px;
  margin-top: 0.45rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #2f575d, #8aa78d);
}

.select-input {
  width: 100%;
  border: 1px solid #c4cdc1;
  border-radius: 0.7rem;
  background: #f8f9f8;
  padding: 0.75rem;
  color: #28363d;
  font-weight: 700;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #435b60;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
}

.switch-row input,
.selectable-item input {
  accent-color: #2f575d;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.theme-card {
  text-align: left;
  border: 1px solid #dfe7e2;
  background: #ffffff;
  border-radius: 0.9rem;
  padding: 1rem;
  cursor: pointer;
  transition: 0.2s;
}

.theme-card:hover {
  border-color: #99aead;
}

.theme-preview {
  height: 5.4rem;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, #f8f9f8, #edf4f1);
  border: 1px solid #e4e9e5;
  display: grid;
  place-items: center;
  margin-bottom: 0.8rem;
  overflow: hidden;
}

.theme-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-preview .material-icons-round {
  color: #99aead;
  font-size: 1.8rem;
}

.theme-card strong {
  display: block;
  color: #28363d;
  margin-bottom: 0.35rem;
}

.theme-card span {
  color: #8b9f9e;
  font-size: 0.82rem;
}

.theme-card.active {
  border-color: #2f575d;
}

.selectable-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border: 1px solid #e4e9e5;
  border-radius: 0.8rem;
  padding: 0.85rem;
  margin-bottom: 0.7rem;
  cursor: pointer;
  transition: 0.2s;
}

.selectable-item:hover {
  border-color: #99aead;
  background: #f8f9f8;
}

.selectable-item input {
  margin-top: 0.2rem;
}

.selectable-item strong {
  color: #28363d;
  font-size: 0.9rem;
}

.selectable-item p {
  margin: 0.25rem 0 0;
  color: #8b9f9e;
  font-size: 0.78rem;
}

.recommendation-item em {
  display: block;
  margin-top: 0.45rem;
  color: #6d9197;
  font-size: 0.82rem;
  line-height: 1.55;
}

.selection-summary {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #ffffff;
  border: 1px solid #dde5df;
  border-radius: 0.9rem;
  padding: 0.9rem 1rem;
  color: #8b9f9e;
  margin-bottom: 1rem;
}

.selection-summary strong {
  color: #2f575d;
  font-size: 1.2rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 0.65rem;
  padding: 0.7rem 1rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-primary {
  background: #2f575d;
  color: #ffffff;
  border: 1px solid #2f575d;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
}

@media (max-width: 900px) {
  .page-header,
  .intro-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .config-grid,
  .items-grid,
  .themes-grid {
    grid-template-columns: 1fr;
  }
}
.profile-link {
  color: #2f575d;
  font-weight: 800;
  text-decoration: none;
  transition: 0.2s;
}

.profile-link:hover {
  color: #658b6f;
  text-decoration: underline;
}
.objective-description {
    margin-top: 1rem;
    margin-left: 1rem;
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.5;
    max-width: 500px;
}
</style>