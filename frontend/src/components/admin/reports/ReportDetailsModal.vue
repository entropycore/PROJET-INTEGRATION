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

          <p class="modal-subtitle">
            Consultez les informations du contenu signalé.
          </p>
        </div>

        <button class="close-btn" @click="emit('close')">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <div class="modal-body">
        <section class="panel">
          <h3>
            <span class="material-icons-round">report_problem</span>
            Signalement
          </h3>

          <div class="detail-row">
            <span>Motif</span>
            <strong>{{ report.reason }}</strong>
          </div>

          <div class="detail-row">
            <span>Description</span>
            <p>{{ report.description }}</p>
          </div>


          <div class="detail-row">
            <span>Date</span>
            <strong>{{ formatDate(report.createdAt) }}</strong>
          </div>
        </section>

        <section class="panel">
          <h3>
            <span class="material-icons-round">description</span>
            Contenu signalé
          </h3>

          <div class="detail-row">
            <span>Type</span>

            <strong>
              {{ typeLabels[report.targetType] || report.targetType }}
            </strong>
          </div>

          <div class="detail-row">
            <span>ID contenu</span>
            <strong>#{{ report.targetId }}</strong>
          </div>
        </section>

        <section class="panel reporter-panel">
          <h3>
            <span class="material-icons-round">person</span>
            Signalé par
          </h3>

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
          Traiter
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
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 999;
}

.modal {
  width: min(55rem, 94vw);
  max-height: 92vh;
  overflow-y: auto;
  background: var(--app-surface);
  border-radius: 1.5rem;
  padding: 1.625rem;
  border: 1px solid var(--app-border);
  box-shadow: var(--app-shadow-popover);
  font-family: var(--app-font-body);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 1.125rem;
  margin-bottom: 1.375rem;
}

.modal-header h2 {
  margin: 0;
  color: var(--app-heading);
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.1;
}

.modal-subtitle {
  margin-top: 0.45rem;
  color: var(--app-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.close-btn {
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-muted);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: 0.2s ease;
}

.close-btn:hover {
  background: var(--app-surface-soft);
  color: var(--app-primary);
}

.close-btn .material-icons-round {
  font-size: 1.25rem;
}

.modal-body {
  display: grid;
  grid-template-columns: 1.25fr 1fr 0.9fr;
  gap: 1.125rem;
}

.panel {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 1.125rem;
  padding: 1.125rem;
}

.panel h3 {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0 0 1.15rem;
  color: var(--app-heading);
  font-size: 1rem;
  font-weight: 800;
}

.panel h3 .material-icons-round {
  color: var(--app-primary);
  font-size: 1.15rem;
}

.detail-row {
  margin-bottom: 1rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row span {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--app-subtle);
  font-size: 0.83rem;
  font-weight: 700;
}

.detail-row strong {
  display: block;
  color: var(--app-heading);
  font-size: 0.9rem;
  font-weight: 700;
}

.detail-row p {
  margin: 0;
  color: var(--app-muted);
  line-height: 1.5;
  font-size: 0.9rem;
}



.status-badge.pending {
  background: var(--app-warning-bg);
  color: var(--app-warning);
}

.status-badge.resolved {
  background: var(--app-active-bg, rgba(47, 87, 93, 0.12));
  color: var(--app-active, var(--app-primary));
}

.status-badge.rejected {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.reporter-panel {
  text-align: center;
}

.reporter-avatar {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 0.9rem;
  border-radius: 50%;
  background: var(--app-primary);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1rem;
}

.reporter-panel strong {
  display: block;
  color: var(--app-heading);
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.reporter-panel p {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.25rem;
  margin-top: 1.375rem;
  border-top: 1px solid var(--app-border);
}

.cancel-btn,
.resolve-btn,
.reject-btn,
.delete-btn {
  min-height: 2.5rem;
  padding: 0 1.1rem;
  border-radius: var(--app-radius-md);
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.cancel-btn {
  border: 1px solid var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-primary);
}

.cancel-btn:hover {
  background: var(--app-surface-soft);
}

.resolve-btn {
  border: 1px solid var(--app-primary);
  background: var(--app-primary);
  color: white;
}

.resolve-btn:hover {
  background: var(--app-primary-hover);
  border-color: var(--app-primary-hover);
}

.reject-btn,
.delete-btn {
  border: 1px solid transparent;
  background: var(--app-error-bg);
  color: var(--app-error);
}

.reject-btn:hover,
.delete-btn:hover {
  opacity: 0.9;
}

@media (max-width: 56.25rem) {
  .modal-body {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .resolve-btn,
  .reject-btn,
  .delete-btn {
    width: 100%;
  }
}
</style>