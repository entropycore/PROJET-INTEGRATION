<script setup>
defineProps({
  validation: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "approve", "reject"]);

const typeLabels = {
  PROJECT: "Projet",
  INTERNSHIP: "Stage",
  CERTIFICATE: "Certificat",
  ACTIVITY: "Activité",
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
        <h2>Détail de validation</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="modal-content">
        <p class="modal-type">
          {{ typeLabels[validation.targetType] }}
        </p>

        <h3>{{ validation.title }}</h3>

        <p class="modal-description">
          {{ validation.description }}
        </p>

        <div class="details-grid">
          <div>
            <span>Étudiant</span>
            <strong>{{ validation.student.fullName }}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{{ validation.student.email }}</strong>
          </div>

          <div>
            <span>Soumis le</span>
            <strong>{{ formatDate(validation.submittedAt) }}</strong>
          </div>

          <div>
            <span>Statut</span>
            <strong>En attente</strong>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="emit('close')">
          Fermer
        </button>

        <button class="approve-btn" @click="emit('approve', validation)">
          ✓ Approuver
        </button>

        <button class="reject-btn" @click="emit('reject', validation)">
          × Refuser
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
  width: min(720px, 92vw);
  background: #fbfaf7;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.modal-header h2 {
  margin: 0;
  color: #0f2f3a;
  font-size: 1.5rem;
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

.modal-type {
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: #e8efed;
  color: #2f5d62;
  font-weight: 800;
  font-size: 0.78rem;
}

.modal-content h3 {
  color: #0f2f3a;
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.modal-description {
  color: #5f6f70;
  line-height: 1.5;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 20px;
}

.details-grid div {
  padding: 14px;
  background: #ffffff;
  border: 1px solid #dfe3dd;
  border-radius: 14px;
}

.details-grid span {
  display: block;
  color: #8aa0a3;
  font-size: 0.82rem;
  margin-bottom: 4px;
}

.details-grid strong {
  color: #0f2f3a;
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
.approve-btn,
.reject-btn {
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

.approve-btn {
  background: #ecfdf5;
  color: #059669;
}

.reject-btn {
  background: #fef2f2;
  color: #dc2626;
}

@media (max-width: 700px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>