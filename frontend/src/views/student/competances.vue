<script setup>
import { computed, ref, onMounted } from "vue";
import {
  getMySkills,
  getSkillStats,
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
const skillStats = ref(null);
const catalog = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const showAddSkill = ref(false);
const showAddSoft = ref(false);
const isSkillSuggestionsOpen = ref(false);
const newSoftName = ref("");
const searchQuery = ref("");

const newSkill = ref({
  skillId: "",
});

const normalizeScore = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;

  return Math.min(100, Math.max(0, Math.round(score)));
};

const getSkillScore = (skill) => {
  return normalizeScore(skill.level ?? skill.masteryLevel);
};

const domainStats = computed(() => {
  return (skillStats.value?.domains || []).map((domain) => ({
    id: domain.id || domain.slug || domain.name,
    name: domain.name,
    score: normalizeScore(domain.score) || 0,
    count: domain.skillsCount || 0,
  }));
});

const getRadarPoint = (score, index, total, radiusScale = 1) => {
  const center = 50;
  const maxRadius = 34 * radiusScale;
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  const radius = (score / 100) * maxRadius;

  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
};

const formatRadarPoint = ({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`;

const radarPoints = computed(() => {
  const domains = domainStats.value;
  if (!domains.length) return "";

  return domains
    .map((domain, index) =>
      formatRadarPoint(getRadarPoint(domain.score, index, domains.length)),
    )
    .join(" ");
});

const radarLabelPositions = computed(() => {
  const center = 50;
  const radius = 45;
  const domains = domainStats.value;

  return domains.map((domain, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / domains.length;

    return {
      ...domain,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  });
});

const radarGridOuterPoints = computed(() => {
  const domains = domainStats.value;
  if (!domains.length) return "";

  return domains
    .map((_, index) =>
      formatRadarPoint(getRadarPoint(100, index, domains.length, 1.18)),
    )
    .join(" ");
});

const radarGridInnerPoints = computed(() => {
  const domains = domainStats.value;
  if (!domains.length) return "";

  return domains
    .map((_, index) =>
      formatRadarPoint(getRadarPoint(100, index, domains.length, 0.78)),
    )
    .join(" ");
});

const radarAxes = computed(() => {
  const center = { x: 50, y: 50 };
  const domains = domainStats.value;

  return domains.map((domain, index) => ({
    key: domain.id || domain.name,
    ...center,
    end: getRadarPoint(100, index, domains.length, 1.18),
  }));
});

const improvementSuggestions = computed(() => {
  return (skillStats.value?.suggestions || []).map((suggestion) => ({
    id: suggestion.domain || suggestion.title,
    title: suggestion.title,
    text: suggestion.message,
    icon: "trending_up",
  }));
});

const availableCatalog = computed(() => {
  const ownedSkillIds = new Set(mySkills.value.map((skill) => skill.skillId));

  return catalog.value.filter((skill) => !ownedSkillIds.has(skill.id));
});

const loadAll = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const [skillsRes, softRes, statsRes] = await Promise.all([
      getMySkills(),
      getSoftSkills(),
      getSkillStats(),
    ]);
    mySkills.value = skillsRes.data || [];
    softSkills.value = softRes.data || [];
    skillStats.value = statsRes.data || null;
  } catch {
    mySkills.value = [];
    softSkills.value = [];
    skillStats.value = null;
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

const openSkillSuggestions = async () => {
  isSkillSuggestionsOpen.value = true;
  await loadCatalog();
};

const closeSkillSuggestions = () => {
  window.setTimeout(() => {
    isSkillSuggestionsOpen.value = false;
  }, 120);
};

const handleSkillSearch = async () => {
  newSkill.value.skillId = "";
  isSkillSuggestionsOpen.value = true;
  await loadCatalog();
};

const selectCatalogSkill = (skill) => {
  newSkill.value.skillId = skill.id;
  searchQuery.value = skill.domain?.name
    ? `${skill.name} - ${skill.domain.name}`
    : skill.name;
  isSkillSuggestionsOpen.value = false;
};

const handleAddSkill = async () => {
  if (!newSkill.value.skillId) return;

  try {
    await addSkill({
      skillId: newSkill.value.skillId,
      level: 0,
      source: "MANUAL",
    });
    showAddSkill.value = false;
    newSkill.value = { skillId: "" };
    searchQuery.value = "";
    catalog.value = [];
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
  newSkill.value = { skillId: "" };
  searchQuery.value = "";
  isSkillSuggestionsOpen.value = false;
  await loadCatalog();
};

onMounted(loadAll);
</script>

<template>
  <div class="skills-page">
    <div class="page-header">
      <div>
        <span class="page-label">COMPÉTENCES</span>
        <h1>Mes compétences</h1>
        <p>Suivez vos compétences techniques et comportementales.</p>
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
          <div class="skill-autocomplete">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Tapez le nom de la compétence"
              class="skill-input"
              @focus="openSkillSuggestions"
              @blur="closeSkillSuggestions"
              @input="handleSkillSearch"
            />
            <div
              v-if="isSkillSuggestionsOpen && availableCatalog.length"
              class="catalog-suggestions"
            >
              <button
                v-for="item in availableCatalog"
                :key="item.id"
                type="button"
                class="catalog-suggestion"
                @mousedown.prevent="selectCatalogSkill(item)"
              >
                <span class="catalog-suggestion-icon">
                  {{ item.name?.charAt(0) || "C" }}
                </span>
                <span>
                  <strong>{{ item.name }}</strong>
                  <small>{{
                    item.domain?.name || "Domaine non renseigné"
                  }}</small>
                </span>
              </button>
            </div>
          </div>
          <p v-if="searchQuery && !availableCatalog.length" class="form-hint">
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
                <div class="skill-source">
                  {{ skill.domain?.name || "Compétence technique" }}
                </div>
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
            <div
              v-if="getSkillScore(skill) === null"
              class="skill-progress-note"
            >
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
          </div>

          <p class="radar-note">
            Statistiques calculées à partir des domaines de compétences du
            backend.
          </p>

          <div class="radar-wrap">
            <svg class="radar-chart" viewBox="0 0 100 100" aria-hidden="true">
              <polygon :points="radarGridOuterPoints" class="radar-grid-line" />
              <polygon
                :points="radarGridInnerPoints"
                class="radar-grid-line radar-grid-line-inner"
              />
              <line
                v-for="axis in radarAxes"
                :key="axis.key"
                :x1="axis.x"
                :y1="axis.y"
                :x2="axis.end.x"
                :y2="axis.end.y"
                class="radar-axis"
              />
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
          <h3 class="card-title">Suggestions d'amélioration</h3>
          <div v-if="improvementSuggestions.length" class="suggestions-list">
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
          <div v-else class="empty-state compact">
            <span class="material-icons-round">verified</span>
            <h4>Aucune suggestion prioritaire</h4>
            <p>Les domaines techniques du catalogue sont déjà couverts.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
