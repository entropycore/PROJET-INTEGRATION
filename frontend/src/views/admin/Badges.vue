<script setup>
import { ref } from "vue";
// import { onMounted } from "vue";
import '../../assets/styles/admin-badges.css'

/*
  BACKEND À ACTIVER QUAND L’API SERA PRÊTE

  APIs nécessaires :
  GET    /api/admin/badges
  POST   /api/admin/badges
  PUT    /api/admin/badges/:id
  DELETE /api/admin/badges/:id

  Quand le backend sera prêt :
  - décommenter les imports
  - remplacer les mock data par const badges = ref([])
  - décommenter fetchBadges() + onMounted(fetchBadges)
  - dans handleSaveBadge(), activer createBadge/updateBadge
  - dans handleDeleteBadge(), activer deleteBadge
*/

/*
import {
  getBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} from "@/services/adminBadgesApi";
*/

const loading = ref(false);
const error = ref(null);

const badges = ref([
  {
    id: 1,
    name: "Web Developer",
    description: "Badge pour les étudiants actifs en développement web.",
    rule: "3 projets web validés (HTML, CSS, JS, PHP, Node.js)",
    iconUrl: "",
    iconFallback: "🌐",
    tone: "blue",
    attributionCount: 89,
  },
  {
    id: 2,
    name: "DevOps Explorer",
    description: "Badge lié aux outils DevOps.",
    rule: "Projet avec Docker + pipeline CI/CD + dépôt GitHub",
    iconUrl: "",
    iconFallback: "☁️",
    tone: "cyan",
    attributionCount: 34,
  },
  {
    id: 3,
    name: "Hackathon Participant",
    description: "Badge pour participation aux événements.",
    rule: "Participation à un hackathon avec attestation vérifiée",
    iconUrl: "",
    iconFallback: "👥",
    tone: "purple",
    attributionCount: 67,
  },
  {
    id: 4,
    name: "Full Stack Developer",
    rule: "Projets frontend ET backend validés",
    iconUrl: "",
    iconFallback: "💠",
    tone: "green",
    attributionCount: 45,
  },
  {
    id: 5,
    name: "Security Aware",
    rule: "Projet avec bonnes pratiques OWASP documentées",
    iconUrl: "",
    iconFallback: "🛡️",
    tone: "red",
    attributionCount: 22,
  },
  {
    id: 6,
    name: "AI / Data",
    rule: "Projet en IA ou Data Science validé",
    iconUrl: "",
    iconFallback: "📊",
    tone: "orange",
    attributionCount: 18,
  },
]);

/*
const fetchBadges = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getBadges();
    badges.value = response.items || [];
  } catch (e) {
    console.error("Erreur badges:", e);
    error.value = "Impossible de charger les badges.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBadges);
*/

const showCreateModal = ref(false);
const isEditMode = ref(false);
const selectedBadgeId = ref(null);

const newBadge = ref({
  name: "",
  description: "",
  rule: "",
  iconFile: null,
  iconPreview: "",
  tone: "blue",
});

const resetForm = () => {
  newBadge.value = {
    name: "",
    description: "",
    rule: "",
    iconFile: null,
    iconPreview: "",
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

const handleIconUpload = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  newBadge.value.iconFile = file;
  newBadge.value.iconPreview = URL.createObjectURL(file);
};

const handleEditBadge = (badge) => {
  isEditMode.value = true;
  selectedBadgeId.value = badge.id;
  showCreateModal.value = true;

  newBadge.value = {
    name: badge.name,
    description: badge.description || "",
    rule: badge.rule,
    iconFile: null,
    iconPreview: badge.iconUrl || "",
    tone: badge.tone || "blue",
  };
};

const handleSaveBadge = async () => {
  if (!newBadge.value.name || !newBadge.value.rule) {
    alert("Veuillez remplir au moins le nom et la règle d’attribution.");
    return;
  }

  /*
    BACKEND À ACTIVER PLUS TARD :

    const formData = new FormData();

    formData.append("name", newBadge.value.name);
    formData.append("description", newBadge.value.description);
    formData.append("rule", newBadge.value.rule);
    formData.append("tone", newBadge.value.tone);

    if (newBadge.value.iconFile) {
      formData.append("icon", newBadge.value.iconFile);
    }

    if (isEditMode.value) {
      await updateBadge(selectedBadgeId.value, formData);
    } else {
      await createBadge(formData);
    }

    await fetchBadges();
    closeCreateModal();
    return;
  */

  if (isEditMode.value) {
    badges.value = badges.value.map((badge) =>
      badge.id === selectedBadgeId.value
        ? {
            ...badge,
            name: newBadge.value.name,
            description: newBadge.value.description,
            rule: newBadge.value.rule,
            iconUrl: newBadge.value.iconPreview,
            tone: newBadge.value.tone,
          }
        : badge
    );
  } else {
    badges.value.unshift({
      id: Date.now(),
      name: newBadge.value.name,
      description: newBadge.value.description,
      rule: newBadge.value.rule,
      iconUrl: newBadge.value.iconPreview,
      iconFallback: "🏅",
      tone: newBadge.value.tone,
      attributionCount: 0,
    });
  }

  closeCreateModal();
};

const handleDeleteBadge = async (id) => {
  const confirmed = confirm("Voulez-vous vraiment supprimer ce badge ?");

  if (!confirmed) return;

  /*
    BACKEND À ACTIVER PLUS TARD :

    await deleteBadge(id);
    await fetchBadges();
    return;
  */

  badges.value = badges.value.filter((badge) => badge.id !== id);
};
</script>

<template>
  <section class="badges-page">
    <header class="page-header">
      <div>
        <span>ADMINISTRATION</span>
        <h1>Système de badges</h1>
        <p>Configurez les règles d’attribution automatique des badges</p>
      </div>

      <button class="primary-btn" @click="handleNewBadge">
        + Nouveau badge
      </button>
    </header>

    <div v-if="loading" class="state-box">
      Chargement des badges...
    </div>

    <div v-else-if="error" class="state-box error">
      {{ error }}
    </div>

    <div v-else class="badges-grid">
      <article v-for="badge in badges" :key="badge.id" class="badge-card">
        <div class="card-top">
          <div class="badge-identity">
            <div class="badge-icon" :class="badge.tone">
              <img
                v-if="badge.iconUrl"
                :src="badge.iconUrl"
                alt="Icône badge"
              />
              <span v-else>{{ badge.iconFallback }}</span>
            </div>

            <h3>{{ badge.name }}</h3>
          </div>

          <div class="card-actions">
            <button
              class="edit-btn"
              title="Modifier ce badge"
              @click="handleEditBadge(badge)"
            >
              ✎
            </button>

            <button
              class="delete-btn"
              title="Supprimer ce badge"
              @click="handleDeleteBadge(badge.id)"
            >
              🗑
            </button>
          </div>
        </div>

        <p class="description">
          {{ badge.description }}
        </p>

        <p class="rule">
          <strong>Règle :</strong> {{ badge.rule }}
        </p>

        <div class="divider"></div>

        <p class="count">
          🏆 {{ badge.attributionCount }} attributions
        </p>
      </article>
    </div>

    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditMode ? "Modifier le badge" : "Nouveau badge" }}</h2>

          <button class="close-btn" @click="closeCreateModal">
            ×
          </button>
        </div>

        <div class="form-group">
          <label>Importer l’icône</label>

          <input
            type="file"
            accept=".svg,.png,.jpg,.jpeg"
            @change="handleIconUpload"
          />

          <div v-if="newBadge.iconPreview" class="icon-preview">
            <img :src="newBadge.iconPreview" alt="Aperçu icône" />
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
          <label>Règle d’attribution</label>
          <textarea
            v-model="newBadge.rule"
            rows="4"
            placeholder="Décrivez les critères..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeCreateModal">
            Annuler
          </button>

          <button class="create-btn" @click="handleSaveBadge">
            {{ isEditMode ? "Enregistrer" : "+ Créer" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>