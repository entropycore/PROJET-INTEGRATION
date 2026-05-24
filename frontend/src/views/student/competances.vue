<script setup>
import { computed, ref, onMounted } from "vue";
import {
  getMySkills,
  addSkill,
  deleteSkill,
  getSkillsCatalog,
  getSoftSkills,
  addSoftSkill,
  deleteSoftSkill,
} from "../../services/studentSkillsService";
import "@/assets/styles/student-skills.css";

const mySkills = ref([]);
const softSkills = ref([]);
const catalog = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const showAddSkill = ref(false);
const showAddSoft = ref(false);
const newSoftName = ref("");
const searchQuery = ref("");

const newSkill = ref({
  skillId: "",
});

const technicalDomains = ["Web", "Backend", "DevOps", "Security", "AI/Data"];

// Radar temporaire côté front en attendant GET /api/student/skills/stats.
// Le mapping définitif doit venir du backend avec SkillDomain.
const skillDomainMap = {
  "Vue.js": "Web",
  React: "Web",
  HTML: "Web",
  CSS: "Web",
  JavaScript: "Web",

  "Node.js": "Backend",
  "Express.js": "Backend",
  Prisma: "Backend",
  PostgreSQL: "Backend",

  Docker: "DevOps",
  "GitHub Actions": "DevOps",
  "CI/CD": "DevOps",
  Kubernetes: "DevOps",

  JWT: "Security",
  OWASP: "Security",
  Firewall: "Security",

  Python: "AI/Data",
  "Machine Learning": "AI/Data",
  "Data Analysis": "AI/Data",
};

const normalizeScore = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;

  return Math.min(100, Math.max(0, Math.round(score)));
};

const getSkillScore = (skill) => {
  return normalizeScore(skill.level ?? skill.masteryLevel);
};

const getRadarSkillScore = (skill) => {
  const score = getSkillScore(skill);
  return score ? score : 55;
};

const domainStats = computed(() => {
  const buckets = technicalDomains.map((domain) => ({
    name: domain,
    scores: [],
  }));

  mySkills.value.forEach((skill) => {
    const domain = skillDomainMap[skill.name];
    if (!domain) return;

    const bucket = buckets.find((item) => item.name === domain);
    if (!bucket) return;

    bucket.scores.push(getRadarSkillScore(skill));
  });

  return buckets.map((bucket) => ({
    name: bucket.name,
    score: bucket.scores.length
      ? Math.round(
          bucket.scores.reduce((total, score) => total + score, 0) /
            bucket.scores.length,
        )
      : 0,
    count: bucket.scores.length,
  }));
});

const radarPoints = computed(() => {
  const center = 50;
  const maxRadius = 34;

  return domainStats.value
    .map((domain, index) => {
      const angle =
        -Math.PI / 2 + (index * 2 * Math.PI) / domainStats.value.length;
      const radius = (domain.score / 100) * maxRadius;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});

const radarLabelPositions = computed(() => {
  const center = 50;
  const radius = 45;

  return domainStats.value.map((domain, index) => {
    const angle =
      -Math.PI / 2 + (index * 2 * Math.PI) / domainStats.value.length;

    return {
      ...domain,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  });
});

const weakestDomain = computed(() => {
  return [...domainStats.value].sort(
    (left, right) => left.score - right.score,
  )[0];
});

const improvementSuggestions = computed(() => {
  const domain = weakestDomain.value?.name || "Web";
  const suggestionsByDomain = {
    Web: ["Vue.js", "React", "JavaScript"],
    Backend: ["Node.js", "Express.js", "Prisma"],
    DevOps: ["Docker", "GitHub Actions", "CI/CD"],
    Security: ["JWT", "OWASP", "Secure API"],
    "AI/Data": ["Python", "Machine Learning", "Data Analysis"],
  };

  return [
    {
      id: "weak-domain",
      title: `Renforcer le domaine ${domain}`,
      text: `Ajoutez une compétence comme ${suggestionsByDomain[domain]
        .slice(0, 2)
        .join(" ou ")} pour améliorer ce profil.`,
      icon: "trending_up",
    },
    {
      id: "project-proof",
      title: "Ajouter une preuve projet",
      text: `Créez ou complétez un projet lié au domaine ${domain} pour rendre cette progression plus crédible.`,
      icon: "verified",
    },
  ];
});

const loadAll = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const [skillsRes, softRes] = await Promise.all([
      getMySkills(),
      getSoftSkills(),
    ]);
    mySkills.value = skillsRes.data || [];
    softSkills.value = softRes.data || [];
  } catch {
    mySkills.value = [];
    softSkills.value = [];
    errorMessage.value = "Impossible de charger les compétences.";
  } finally {
    isLoading.value = false;
  }
};

const loadCatalog = async () => {
  try {
    const res = await getSkillsCatalog(searchQuery.value);
    catalog.value = res.data || [];
  } catch {
    catalog.value = [];
    errorMessage.value = "Impossible de charger le catalogue des compétences.";
  }
};

const handleAddSkill = async () => {
  if (!newSkill.value.skillId) return;

  try {
    await addSkill(newSkill.value);
    showAddSkill.value = false;
    newSkill.value = { skillId: "" };
    await loadAll();
  } catch {
    errorMessage.value = "Erreur lors de l'ajout.";
  }
};

const handleDeleteSkill = async (id) => {
  try {
    await deleteSkill(id);
    await loadAll();
  } catch {
    errorMessage.value = "Erreur lors de la suppression.";
  }
};

const handleAddSoft = async () => {
  if (!newSoftName.value.trim()) return;
  try {
    await addSoftSkill({ name: newSoftName.value });
    newSoftName.value = "";
    showAddSoft.value = false;
    await loadAll();
  } catch {
    errorMessage.value = "Erreur lors de l'ajout.";
  }
};

const handleDeleteSoft = async (id) => {
  try {
    await deleteSoftSkill(id);
    await loadAll();
  } catch {
    errorMessage.value = "Erreur lors de la suppression.";
  }
};

const openAddSkill = async () => {
  showAddSkill.value = true;
  await loadCatalog();
};

onMounted(loadAll);
</script>

<template>
  <div class="skills-page">
    <div class="page-header">
      <div>
        <h1>Compétences</h1>
        <div class="sub">Compétences techniques et comportementales</div>
      </div>
      <button class="btn btn-primary" @click="openAddSkill">
        <span class="material-icons-round">add</span>
        Ajouter une compétence
      </button>
    </div>

    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    <p v-if="isLoading" class="text-muted">Chargement...</p>

    <div v-if="!isLoading">
      <!-- Formulaire ajout compétence technique -->
      <div v-if="showAddSkill" class="content-card add-form-card">
        <h3 class="card-title">Ajouter une compétence technique</h3>

        <div class="form-group">
          <label>Compétence</label>
          <select v-model="newSkill.skillId" class="form-select">
            <option value="">Sélectionner...</option>
            <option v-for="item in catalog" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <p v-if="!catalog.length" class="form-hint">
            Aucune compétence technique disponible dans le catalogue.
          </p>
        </div>

        <div class="flex-gap">
          <button
            class="btn btn-primary btn-sm"
            :disabled="!newSkill.skillId"
            @click="handleAddSkill"
          >
            Ajouter
          </button>
          <button
            class="btn btn-secondary btn-sm"
            @click="showAddSkill = false"
          >
            Annuler
          </button>
        </div>
      </div>

      <!-- Compétences techniques -->
      <div class="content-card">
        <div class="flex-between mb-16">
          <h3 class="card-title" style="margin: 0">Compétences techniques</h3>
        </div>

        <div v-if="mySkills.length > 0" class="skills-grid">
          <div v-for="skill in mySkills" :key="skill.id" class="skill-card">
            <div class="skill-header">
              <div>
                <div class="skill-name">{{ skill.name }}</div>
                <div class="skill-source">Compétence technique</div>
              </div>
              <div class="skill-right">
                <span v-if="getSkillScore(skill) !== null" class="skill-score">
                  {{ getSkillScore(skill) }}%
                </span>
                <button
                  class="icon-btn"
                  @click="handleDeleteSkill(skill.id)"
                  title="Supprimer"
                >
                  <span class="material-icons-round">close</span>
                </button>
              </div>
            </div>
            <div
              class="skill-progress"
              :class="{ empty: getSkillScore(skill) === null }"
            >
              <div
                class="skill-progress-fill"
                :style="{ width: `${getSkillScore(skill) || 0}%` }"
              ></div>
            </div>
            <div v-if="getSkillScore(skill) === null" class="skill-progress-note">
              Score non renseigné
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="material-icons-round">code</span>
          <h4>Aucune compétence technique</h4>
          <p>Ajoutez vos compétences pour enrichir votre profil.</p>
        </div>
      </div>

      <!-- Soft skills -->
      <div class="content-card">
        <div class="flex-between mb-16">
          <h3 class="card-title" style="margin: 0">
            Compétences comportementales
          </h3>
          <button
            class="btn btn-secondary btn-sm"
            @click="showAddSoft = !showAddSoft"
          >
            <span class="material-icons-round">add</span>
            Ajouter
          </button>
        </div>

        <div v-if="showAddSoft" class="flex-gap mb-16">
          <input
            v-model="newSoftName"
            type="text"
            placeholder="Ex: Leadership"
            class="skill-input"
          />
          <button class="btn btn-primary btn-sm" @click="handleAddSoft">
            OK
          </button>
          <button class="btn btn-secondary btn-sm" @click="showAddSoft = false">
            ✕
          </button>
        </div>

        <div v-if="softSkills.length > 0" class="soft-grid">
          <div v-for="skill in softSkills" :key="skill.id" class="soft-card">
            <span class="material-icons-round check-icon">check_circle</span>
            <span class="soft-name">{{ skill.name }}</span>
            <button
              class="icon-btn"
              @click="handleDeleteSoft(skill.id)"
              title="Supprimer"
            >
              <span class="material-icons-round">close</span>
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="material-icons-round">psychology</span>
          <h4>Aucune compétence comportementale</h4>
          <p>Ajoutez vos soft skills pour compléter votre profil.</p>
        </div>
      </div>

      <div class="insights-layout">
        <div class="content-card radar-card">
          <div class="flex-between mb-16">
            <h3 class="card-title" style="margin: 0">
              Aperçu du profil technique
            </h3>
            <span class="radar-badge">Prototype</span>
          </div>

          <p class="radar-note">
            Radar temporaire calculé côté front à partir des compétences
            techniques ajoutées.
          </p>

          <div class="radar-wrap">
            <svg class="radar-chart" viewBox="0 0 100 100" aria-hidden="true">
              <polygon
                points="50,8 89.9,37 74.7,84 25.3,84 10.1,37"
                class="radar-grid-line"
              />
              <polygon
                points="50,22 76.6,41.3 66.5,72.3 33.5,72.3 23.4,41.3"
                class="radar-grid-line radar-grid-line-inner"
              />
              <line x1="50" y1="50" x2="50" y2="8" class="radar-axis" />
              <line x1="50" y1="50" x2="89.9" y2="37" class="radar-axis" />
              <line x1="50" y1="50" x2="74.7" y2="84" class="radar-axis" />
              <line x1="50" y1="50" x2="25.3" y2="84" class="radar-axis" />
              <line x1="50" y1="50" x2="10.1" y2="37" class="radar-axis" />
              <polygon :points="radarPoints" class="radar-shape" />
              <circle cx="50" cy="50" r="2.1" class="radar-center" />
              <text
                v-for="label in radarLabelPositions"
                :key="label.name"
                :x="label.x"
                :y="label.y"
                class="radar-label"
              >
                {{ label.name }}
              </text>
            </svg>

            <div class="domain-bars">
              <div
                v-for="domain in domainStats"
                :key="domain.name"
                class="domain-row"
              >
                <div class="domain-row-head">
                  <span>{{ domain.name }}</span>
                  <strong>{{ domain.score }}%</strong>
                </div>
                <div class="domain-track">
                  <div
                    class="domain-fill"
                    :style="{ width: `${domain.score}%` }"
                  ></div>
                </div>
                <small>
                  {{
                    domain.count
                      ? `${domain.count} compétence(s)`
                      : "Aucune compétence"
                  }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div class="content-card suggestions-card">
          <h3 class="card-title">Suggestions d’amélioration</h3>
          <div class="suggestions-list">
            <div
              v-for="suggestion in improvementSuggestions"
              :key="suggestion.id"
              class="suggestion-item"
            >
              <span class="material-icons-round suggestion-icon">
                {{ suggestion.icon }}
              </span>
              <div>
                <strong>{{ suggestion.title }}</strong>
                <p>{{ suggestion.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
