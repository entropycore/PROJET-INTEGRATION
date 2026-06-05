<script setup>
import { onMounted, ref } from "vue";
import {
  createBadge,
  deleteBadge,
  getBadges,
  updateBadge,
} from "@/services/adminBadgesApi";
import "../../assets/styles/admin-badges.css";

/*
  BACKEND NOTE

  Backend admin badges disponible :
  GET    /api/admin/badges
  POST   /api/admin/badges
  PUT    /api/admin/badges/:id
  DELETE /api/admin/badges/:id

  Limites temporaires :
  - pas d'upload d'image pour l'instant ;
  - iconUrl est une simple URL texte ;
  - attributionCount n'est pas encore relie a une table d'attribution.
*/

const loading = ref(false);
const error = ref(null);

const TEMP_ATTRIBUTION_COUNTS = {
  "Web Developer": 89,
  "DevOps Explorer": 34,
  "Hackathon Participant": 67,
  "Full Stack Developer": 45,
  "Security Aware": 22,
  "AI / Data": 18,
};

const MOCK_BADGES = [
  {
    id: "mock-web-developer",
    name: "Web Developer",
    description: "Badge pour les étudiants actifs en développement web.",
    rule: "Avoir au moins un projet web valide.",
    iconFallback: "WD",
    tone: "blue",
  },
  {
    id: "mock-devops-explorer",
    name: "DevOps Explorer",
    description: "Badge lié aux outils DevOps et à l'intégration continue.",
    rule: "Avoir un projet avec pipeline, Docker ou workflow GitHub.",
    iconFallback: "DX",
    tone: "green",
  },
  {
    id: "mock-hackathon-participant",
    name: "Hackathon Participant",
    description: "Badge attribué après validation d'une participation.",
    rule: "Déclarer une activité de type hackathon validée.",
    iconFallback: "HP",
    tone: "purple",
  },
  {
    id: "mock-full-stack-developer",
    name: "Full Stack Developer",
    description: "Badge pour les projets frontend ET backend validés.",
    rule: "Projets frontend ET backend validés.",
    iconFallback: "FS",
    tone: "green",
  },
  {
    id: "mock-security-aware",
    name: "Security Aware",
    description: "Badge pour les bonnes pratiques et la sécurité.",
    rule: "Projet avec bonnes pratiques OWASP documentées.",
    iconFallback: "SA",
    tone: "red",
  },
  {
    id: "mock-ai-data",
    name: "AI / Data",
    description: "Badge pour les projets en IA ou Data Science validés.",
    rule: "Projet IA ou Data validé.",
    iconFallback: "AI",
    tone: "orange",
  },
];

const FALLBACK_BADGE_ICON = "*";

const BADGE_ICON_BY_NAME = {
  "Web Developer": "terminal",
  "DevOps Explorer": "cloud_sync",
  "Hackathon Participant": "emoji_events",
  "Full Stack Developer": "layers",
  "Security Aware": "verified_user",
  "AI / Data": "psychology",
};

const BADGE_ICON_BY_TONE = {
  blue: "code_blocks",
  cyan: "cloud_sync",
  purple: "groups",
  green: "layers",
  red: "verified_user",
  orange: "psychology",
};

const normalizeBadge = (badge) => ({
  ...badge,
  iconUrl: badge.iconUrl || "",
  iconFallback: badge.iconFallback || FALLBACK_BADGE_ICON,
  tone: badge.tone || "blue",
  attributionCount:
    badge.attributionCount ?? TEMP_ATTRIBUTION_COUNTS[badge.name] ?? 0,
});

const badges = ref([]);
const useMockFallback = ref(false);

const getBadgeIcon = (badge) => {
  return (
    BADGE_ICON_BY_NAME[badge.name] ||
    BADGE_ICON_BY_TONE[badge.tone] ||
    "workspace_premium"
  );
};

const extractBadgeItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;

  return [];
};

const loadTemporaryBadges = () => {
  useMockFallback.value = true;
  badges.value = MOCK_BADGES.map(normalizeBadge);
};

const fetchBadges = async () => {
  loading.value = true;
  error.value = null;
  useMockFallback.value = false;

  try {
    const response = await getBadges();
    const items = extractBadgeItems(response);

    if (items.length) {
      badges.value = items.map(normalizeBadge);
      return;
    }

    loadTemporaryBadges();
  } catch (e) {
    console.error("Erreur badges:", e);
    loadTemporaryBadges();
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBadges);

const showCreateModal = ref(false);
const isEditMode = ref(false);
const selectedBadgeId = ref(null);

const newBadge = ref({
  name: "",
  description: "",
  rule: "",
  iconUrl: "",
  tone: "blue",
});

const resetForm = () => {
  newBadge.value = {
    name: "",
    description: "",
    rule: "",
    iconUrl: "",
    tone: "blue",
  };
};

const handleNewBadge = () => {
  isEditMode.value = false;
  selectedBadgeId.value = null;
  resetForm();
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  isEditMode.value = false;
  selectedBadgeId.value = null;
  resetForm();
};

const handleEditBadge = (badge) => {
  isEditMode.value = true;
  selectedBadgeId.value = badge.id;
  showCreateModal.value = true;

  newBadge.value = {
    name: badge.name,
    description: badge.description || "",
    rule: badge.rule,
    iconUrl: badge.iconUrl || "",
    tone: badge.tone || "blue",
  };
};

const buildBadgePayload = () => ({
  name: newBadge.value.name,
  description: newBadge.value.description,
  rule: newBadge.value.rule,
  iconUrl: newBadge.value.iconUrl,
  tone: newBadge.value.tone,
});

const upsertTemporaryBadge = (payload) => {
  const localBadge = normalizeBadge({
    id: selectedBadgeId.value || `local-${Date.now()}`,
    ...payload,
  });

  if (isEditMode.value) {
    badges.value = badges.value.map((badge) =>
      badge.id === selectedBadgeId.value ? localBadge : badge,
    );
    return;
  }

  badges.value = [localBadge, ...badges.value];
};

const handleSaveBadge = async () => {
  if (!newBadge.value.name || !newBadge.value.rule) {
    alert("Veuillez remplir au moins le nom et la règle d'attribution.");
    return;
  }

  const payload = buildBadgePayload();

  try {
    if (isEditMode.value) {
      await updateBadge(selectedBadgeId.value, payload);
    } else {
      await createBadge(payload);
    }

    await fetchBadges();
    closeCreateModal();
  } catch (e) {
    console.error("Erreur sauvegarde badge:", e);
    useMockFallback.value = true;
    upsertTemporaryBadge(payload);
    closeCreateModal();
  }
};

const handleDeleteBadge = async (id) => {
  const confirmed = confirm("Voulez-vous vraiment supprimer ce badge ?");

  if (!confirmed) return;

  try {
    await deleteBadge(id);
    await fetchBadges();
  } catch (e) {
    console.error("Erreur suppression badge:", e);
    useMockFallback.value = true;
    badges.value = badges.value.filter((badge) => badge.id !== id);
  }
};
</script>

<template>
  <section class="badges-page">
    <header class="page-header">
      <div>
        <span>ADMINISTRATION</span>
        <h1>Système de badges</h1>
        <p>Configurez les règles d'attribution automatique des badges</p>
      </div>

      <button class="primary-btn" @click="handleNewBadge">
        + Nouveau badge
      </button>
    </header>

    <div v-if="loading" class="state-box">Chargement des badges...</div>

    <div v-else-if="error" class="state-box error">
      {{ error }}
    </div>

    <template v-else>
      <div class="badges-grid">
        <article v-for="badge in badges" :key="badge.id" class="badge-card">
  <div class="badge-main">
    <div class="badge-icon">
      <img v-if="badge.iconUrl" :src="badge.iconUrl" alt="Icone badge" />

      <span v-else class="material-icons-round">
        {{ getBadgeIcon(badge) }}
      </span>
    </div>

    <div class="badge-copy">
      <h3>{{ badge.name }}</h3>

      <p class="description">
        {{ badge.description || "Aucune description renseignée." }}
      </p>
    </div>
  </div>

  <div class="rule">
    <span class="material-icons-round">verified_user</span>

    <p>
      <strong>Règle :</strong>
      {{ badge.rule }}
    </p>
  </div>

  <div class="badge-card-footer">
    <p class="count">
      <span class="material-icons-round">groups</span>
      {{ badge.attributionCount }} attributions
    </p>

    <div class="card-actions">
      <button
        class="edit-btn"
        title="Modifier ce badge"
        @click="handleEditBadge(badge)"
      >
        <span class="material-icons-round">edit</span>
      </button>

      <button
        class="delete-btn"
        title="Supprimer ce badge"
        @click="handleDeleteBadge(badge.id)"
      >
        <span class="material-icons-round">delete</span>
      </button>
    </div>
  </div>
</article>
      </div>

      <div v-if="useMockFallback" class="state-box temporary-note">
        <span class="material-icons-round">info</span>
        Mode temporaire : le backend badges ne renvoie pas encore de données
        utilisables, donc l'affichage conserve des badges locaux.
      </div>
    </template>

    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditMode ? "Modifier le badge" : "Nouveau badge" }}</h2>

          <button class="close-btn" @click="closeCreateModal">x</button>
        </div>

        <div class="form-group">
          <label>URL de l'icône</label>

          <input
            v-model="newBadge.iconUrl"
            type="text"
            placeholder="https://exemple.com/badge.svg"
          />

          <div v-if="newBadge.iconUrl" class="icon-preview">
            <img :src="newBadge.iconUrl" alt="Aperçu icône" />
          </div>
        </div>

        <div class="form-group">
          <label>Nom du badge</label>
          <input
            v-model="newBadge.name"
            type="text"
            placeholder="Ex : Web Developer"
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <input
            v-model="newBadge.description"
            type="text"
            placeholder="Courte description du badge"
          />
        </div>

        <div class="form-group">
          <label>Règle d'attribution</label>
          <textarea
            v-model="newBadge.rule"
            rows="4"
            placeholder="Décrivez les critères..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeCreateModal">Annuler</button>

          <button class="create-btn" @click="handleSaveBadge">
            {{ isEditMode ? "Enregistrer" : "+ Créer" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
