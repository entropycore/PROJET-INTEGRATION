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

  L'écran admin consomme uniquement le backend badges.
*/

const loading = ref(false);
const error = ref(null);

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
  green: "layers",
  red: "verified_user",
  orange: "psychology",
};

const normalizeBadge = (badge) => ({
  ...badge,
  iconUrl: badge.iconUrl || "",
  iconFallback: badge.iconFallback || FALLBACK_BADGE_ICON,
  tone: badge.tone || "blue",
  attributionCount: badge.attributionCount ?? 0,
});

const badges = ref([]);
const brokenIconIds = ref(new Set());

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

const getApiErrorMessage = (err) => {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Impossible de charger les badges depuis le backend."
  );
};

const fetchBadges = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getBadges();
    const items = extractBadgeItems(response);
    badges.value = items.map(normalizeBadge);
    brokenIconIds.value = new Set();
  } catch (e) {
    console.error("Erreur badges:", e);
    error.value = getApiErrorMessage(e);
    badges.value = [];
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

const isValidIconUrl = (value) => {
  const iconUrl = value.trim();

  if (!iconUrl) return true;
  if (iconUrl.startsWith("/")) return true;

  try {
    const url = new URL(iconUrl);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const buildBadgePayload = () => ({
  name: newBadge.value.name.trim(),
  description: newBadge.value.description.trim(),
  rule: newBadge.value.rule.trim(),
  iconUrl: newBadge.value.iconUrl.trim(),
  tone: newBadge.value.tone,
});

const handleSaveBadge = async () => {
  if (!newBadge.value.name.trim() || !newBadge.value.rule.trim()) {
    alert("Veuillez remplir au moins le nom et la règle d'attribution.");
    return;
  }

  if (!isValidIconUrl(newBadge.value.iconUrl)) {
    alert("L'icône doit être une URL valide ou rester vide.");
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
    alert(getApiErrorMessage(e));
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
    alert(getApiErrorMessage(e));
  }
};

const hasUsableIconImage = (badge) =>
  Boolean(badge.iconUrl) && !brokenIconIds.value.has(badge.id);

const markIconAsBroken = (badgeId) => {
  brokenIconIds.value = new Set([...brokenIconIds.value, badgeId]);
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
      <div v-if="badges.length" class="badges-grid">
        <article v-for="badge in badges" :key="badge.id" class="badge-card">
          <div class="badge-main">
            <div class="badge-icon">
              <img
                v-if="hasUsableIconImage(badge)"
                :src="badge.iconUrl"
                alt="Icone badge"
                @error="markIconAsBroken(badge.id)"
              />

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

      <div v-else class="state-box empty-state">
        Aucun badge n'est encore configuré.
      </div>
    </template>

    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditMode ? "Modifier le badge" : "Nouveau badge" }}</h2>

          <button class="close-btn" @click="closeCreateModal">x</button>
        </div>

        <div class="form-group">
          <label>URL de l'icône optionnelle</label>

          <input
            v-model="newBadge.iconUrl"
            type="text"
            placeholder="https://exemple.com/badge.svg"
          />

          <div v-if="isValidIconUrl(newBadge.iconUrl) && newBadge.iconUrl" class="icon-preview">
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
