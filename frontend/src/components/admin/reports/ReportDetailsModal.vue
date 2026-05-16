<script setup>
defineProps({
  report: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "resolve", "reject", "delete-target"]);

const typeLabels = {
  PROJECT: "Projet",
  PORTFOLIO: "Portfolio",
  COMMENT: "Commentaire",
  USER: "Utilisateur",
};

const statusLabels = {
  PENDING: "En attente",
  RESOLVED: "Traité",
  REJECTED: "Rejeté",
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Détail du signalement</h2>
          <span class="type-badge" :class="report.targetType.toLowerCase()">
            {{ typeLabels[report.targetType] || report.targetType }}
          </span>
        </div>

        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="modal-body">
        <section class="panel">
          <h3>Signalement</h3>

          <div class="detail-row">
            <span>Motif</span>
            <strong>{{ report.reason }}</strong>
          </div>

          <div class="detail-row">
            <span>Description</span>
            <p>{{ report.description }}</p>
          </div>

          <div class="detail-row">
            <span>Statut</span>
            <strong>{{ statusLabels[report.status] }}</strong>
          </div>

          <div class="detail-row">
            <span>Date</span>
            <strong>{{ formatDate(report.createdAt) }}</strong>
          </div>
        </section>

        <section class="panel">
          <h3>Contenu signalé</h3>

          <div class="detail-row">
            <span>Type</span>
            <strong>{{ typeLabels[report.targetType] || report.targetType }}</strong>
          </div>

          <div class="detail-row">
            <span>ID contenu</span>
            <strong>#{{ report.targetId }}</strong>
          </div>
        </section>

        <section class="panel reporter-panel">
          <h3>Signalé par</h3>

          <div class="reporter-avatar">
            {{ report.reportedBy.fullName?.slice(0, 2).toUpperCase() }}
          </div>

          <strong>{{ report.reportedBy.fullName }}</strong>
          <p>{{ report.reportedBy.email }}</p>
        </section>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="emit('close')">
          Fermer
        </button>

        <button
          v-if="report.status === 'PENDING'"
          class="resolve-btn"
          @click="emit('resolve', report)"
        >
          Marquer traité
        </button>

        <button
          v-if="report.status === 'PENDING'"
          class="reject-btn"
          @click="emit('reject', report)"
        >
          Rejeter
        </button>

        <button
          v-if="report.status === 'PENDING'"
          class="delete-btn"
          @click="emit('delete-target', report)"
        >
          Supprimer contenu
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  width: min(880px, 94vw);
  max-height: 92vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.modal-header h2 {
  margin: 0 0 8px;
  color: #0f2f3a;
  font-size: 1.55rem;
  font-weight: 800;
}

.close-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #cfd8cc;
  border-radius: 12px;
  background: #ffffff;
  color: #6b8a91;
  font-size: 1.8rem;
  cursor: pointer;
}

.type-badge {
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.type-badge.project,
.type-badge.portfolio {
  background: #e8f5f1;
  color: #2f5d62;
}

.type-badge.comment,
.type-badge.user {
  background: #fff4e6;
  color: #ea580c;
}

.modal-body {
  display: grid;
  grid-template-columns: 1.3fr 1fr 0.9fr;
  gap: 18px;
}

.panel {
  background: #ffffff;
  border: 1px solid #dfe3dd;
  border-radius: 18px;
  padding: 18px;
}

.panel h3 {
  margin: 0 0 16px;
  color: #0f2f3a;
  font-size: 1rem;
  font-weight: 800;
}

.detail-row {
  margin-bottom: 14px;
}

.detail-row span {
  display: block;
  color: #8aa0a3;
  font-size: 0.83rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.detail-row strong {
  color: #0f2f3a;
}

.detail-row p {
  margin: 0;
  color: #5f6f70;
  line-height: 1.5;
}

.reporter-panel {
  text-align: center;
}

.reporter-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  background: #2f5d62;
  color: #ffffff;
  font-weight: 800;
}

.reporter-panel p {
  color: #7f9699;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  margin-top: 22px;
  border-top: 1px solid #dfe3dd;
}

.cancel-btn,
.resolve-btn,
.reject-btn,
.delete-btn {
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 800;
  cursor: pointer;
}

.cancel-btn {
  background: #ffffff;
  color: #2f5d62;
  border: 1px solid #cfd8cc;
}

.resolve-btn {
  background: #e8f5f1;
  color: #2f5d62;
}

.reject-btn,
.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

@media (max-width: 900px) {
  .modal-body {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>