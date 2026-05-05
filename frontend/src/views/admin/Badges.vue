<script setup>
import { ref } from "vue";
// import { onMounted } from "vue";

/*
  =====================================================
  PARTIE BACKEND — À ACTIVER QUAND L’API SERA PRÊTE
  =====================================================

  Quand le backend aura créé les routes :
  GET    /api/admin/badges
  POST   /api/admin/badges
  PUT    /api/admin/badges/:id
  DELETE /api/admin/badges/:id

  Tu pourras décommenter les imports ci-dessous.
*/

/*
import {
  getBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} from "@/services/adminBadgesApi";
*/

/*
  Ces variables serviront pour afficher :
  - un message de chargement
  - une erreur si l’API ne répond pas
*/

const loading = ref(false);
const error = ref(null);

/*
  =====================================================
  MOCK DATA — DONNÉES TEMPORAIRES POUR LE FRONTEND
  =====================================================

  Pour le moment, on utilise ces données pour construire le design.
  Quand le backend sera prêt, tu remplaceras cette liste par :

  const badges = ref([]);

  Puis tu activeras fetchBadges().
*/

const badges = ref([
  {
    id: 1,
    name: "Web Developer",
    rule: "3 projets web validés (HTML, CSS, JS, PHP, Node.js)",
    icon: "🌐",
    tone: "blue",
    attributionCount: 89,
  },
  {
    id: 2,
    name: "DevOps Explorer",
    rule: "Projet avec Docker + pipeline CI/CD + dépôt GitHub",
    icon: "☁️",
    tone: "cyan",
    attributionCount: 34,
  },
  {
    id: 3,
    name: "Hackathon Participant",
    rule: "Participation à un hackathon avec attestation vérifiée",
    icon: "👥",
    tone: "purple",
    attributionCount: 67,
  },
  {
    id: 4,
    name: "Full Stack Developer",
    rule: "Projets frontend ET backend validés",
    icon: "💠",
    tone: "green",
    attributionCount: 45,
  },
  {
    id: 5,
    name: "Security Aware",
    rule: "Projet avec bonnes pratiques OWASP documentées",
    icon: "🛡️",
    tone: "red",
    attributionCount: 22,
  },
  {
    id: 6,
    name: "AI / Data",
    rule: "Projet en IA ou Data Science validé",
    icon: "📊",
    tone: "orange",
    attributionCount: 18,
  },
]);

/*
  =====================================================
  CHARGER LES BADGES DEPUIS LE BACKEND
  =====================================================

  Quand l’API sera prête :
  1. Décommente fetchBadges()
  2. Décommente onMounted(fetchBadges)
  3. Remplace les mock data par const badges = ref([]);

  Cette fonction va récupérer les badges depuis PostgreSQL via le backend.
*/

/*
const fetchBadges = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getBadges();

    // Le backend doit retourner data.items
    // Exemple : { success: true, data: { items: [...] } }
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

/*
  =====================================================
  ACTION : CRÉER UN NOUVEAU BADGE
  =====================================================

  Pour le moment, on affiche seulement un console.log.
  Plus tard, ce bouton ouvrira une modal avec un formulaire.

  Quand le backend sera prêt :
  - récupérer les données du formulaire
  - appeler createBadge(formData)
  - puis recharger la liste avec fetchBadges()
*/

const handleNewBadge = () => {
  console.log("Ouvrir modal création badge");
};

/*
Exemple backend futur :

const handleCreateBadge = async (formData) => {
  try {
    await createBadge(formData);
    await fetchBadges(); // recharge les badges depuis le backend
  } catch (e) {
    console.error("Erreur création badge:", e);
  }
};
*/

/*
  =====================================================
  ACTION : MODIFIER UN BADGE
  =====================================================

  Pour le moment, on affiche le badge dans la console.
  Plus tard, ce bouton ouvrira une modal pré-remplie.

  Quand le backend sera prêt :
  - modifier les champs dans le formulaire
  - appeler updateBadge(badge.id, formData)
  - puis recharger la liste avec fetchBadges()
*/

const handleEditBadge = (badge) => {
  console.log("Ouvrir modal modification badge:", badge);
};

/*
Exemple backend futur :

const handleUpdateBadge = async (badgeId, formData) => {
  try {
    await updateBadge(badgeId, formData);
    await fetchBadges();
  } catch (e) {
    console.error("Erreur modification badge:", e);
  }
};
*/

/*
  =====================================================
  ACTION : SUPPRIMER UN BADGE
  =====================================================

  Pour l’instant, cette action n’est pas affichée dans l’UI.
  Tu peux l’ajouter plus tard si tu veux un bouton supprimer.

  Quand le backend sera prêt :
  - demander confirmation
  - appeler deleteBadge(id)
  - puis recharger la liste
*/

/*
const handleDeleteBadge = async (id) => {
  const confirmed = confirm("Voulez-vous vraiment supprimer ce badge ?");

  if (!confirmed) return;

  try {
    await deleteBadge(id);
    await fetchBadges();
  } catch (e) {
    console.error("Erreur suppression badge:", e);
  }
};
*/
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
      <article
        v-for="badge in badges"
        :key="badge.id"
        class="badge-card"
      >
        <div class="card-top">
          <div class="badge-identity">
            <div class="badge-icon" :class="badge.tone">
              {{ badge.icon }}
            </div>

            <h3>{{ badge.name }}</h3>
          </div>

          <button
            class="edit-btn"
            title="Modifier ce badge"
            @click="handleEditBadge(badge)"
          >
            ✎
          </button>
        </div>

        <p class="rule">
          <strong>Règle :</strong> {{ badge.rule }}
        </p>

        <div class="divider"></div>

        <p class="count">
          🏆 {{ badge.attributionCount }} attributions
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.badges-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-header span {
  display: block;
  margin-bottom: 6px;
  color: #8b8f8c;
  font-size: 0.8rem;
  font-style: italic;
  letter-spacing: 0.04em;
}

.page-header h1 {
  margin: 0;
  color: #0f2f3a;
  font-size: clamp(2rem, 3vw, 2.7rem);
  font-weight: 800;
  line-height: 1.1;
}

.page-header p {
  margin-top: 8px;
  color: #8aa0a3;
  font-size: 1.05rem;
  font-style: italic;
}

.primary-btn {
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  background: #2f5d62;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-btn:hover {
  background: #274f53;
  transform: translateY(-1px);
}

.state-box {
  padding: 22px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #dfe3dd;
  color: #6b7280;
}

.error {
  color: #dc2626;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 24px;
}

.badge-card {
  padding: 28px;
  background: #ffffff;
  border: 1px solid #dfe3dd;
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
  transition: 0.2s ease;
}

.badge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.badge-identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.badge-icon {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.65rem;
}

.badge-icon.blue {
  background: #eef6ff;
}

.badge-icon.cyan {
  background: #e9f7f7;
}

.badge-icon.purple {
  background: #f3eafa;
}

.badge-icon.green {
  background: #eef8ef;
}

.badge-icon.red {
  background: #fdecec;
}

.badge-icon.orange {
  background: #fff0e6;
}

.badge-card h3 {
  margin: 0;
  color: #0f2f3a;
  font-size: 1.2rem;
  font-weight: 800;
}

.edit-btn {
  width: 58px;
  height: 44px;
  border: 1px solid #cfd8cc;
  border-radius: 12px;
  background: #ffffff;
  color: #2f5d62;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.edit-btn:hover {
  background: #e8efed;
}

.rule {
  margin: 22px 0 0;
  min-height: 52px;
  color: #6b8a91;
  line-height: 1.45;
  font-size: 0.98rem;
}

.rule strong {
  color: #5d7f86;
}

.divider {
  height: 1px;
  margin: 18px 0 14px;
  background: #dfe3dd;
}

.count {
  margin: 0;
  color: #8aa0a3;
  font-size: 0.95rem;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .badges-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
  }

  .primary-btn {
    width: 100%;
  }

  .badges-grid {
    grid-template-columns: 1fr;
  }
}
</style>