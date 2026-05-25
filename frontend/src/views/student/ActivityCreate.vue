<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import ActivityForm from "@/components/student/activities/ActivityForm.vue";
import {
  createStudentActivity,
  uploadStudentActivityCertificate,
} from "@/services/studentActivitiesService";

const router = useRouter();
const isSaving = ref(false);
const errorMessage = ref("");

const goBack = () => {
  router.push("/student/activities");
};

const buildActivityPayload = (payload) => {
  const activityPayload = { ...payload };
  delete activityPayload.certificate;
  delete activityPayload.certificateName;
  delete activityPayload.certificateUrl;
  return activityPayload;
};

const handleSaveActivity = async (payload) => {
  isSaving.value = true;
  errorMessage.value = "";

  try {
    const response = await createStudentActivity(buildActivityPayload(payload));
    const createdActivity = response.data?.data || response.data;

    if (payload.certificate instanceof File) {
      await uploadStudentActivityCertificate(
        createdActivity.id,
        payload.certificate,
      );
    }

    router.push(`/student/activities/${createdActivity.id}`);
  } catch (error) {
    console.error("Erreur création activité :", error);
    errorMessage.value =
      error?.response?.data?.message || "Impossible de créer l’activité.";
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <section class="activity-form-page">
    <div class="page-header">
      <div>
        <span class="page-label">PARASCOLAIRE</span>
        <h1>Nouvelle activité</h1>
        <p>
          Renseignez les informations et ajoutez une attestation de
          participation.
        </p>
      </div>

      <button type="button" class="back-btn" @click="goBack">
        <span class="material-icons-round">arrow_back</span>
        Retour
      </button>
    </div>

    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

    <ActivityForm
      :submit-label="isSaving ? 'Création...' : 'Créer l’activité'"
      @save-activity="handleSaveActivity"
      @cancel="goBack"
    />
  </section>
</template>

<style scoped>
.activity-form-page {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1.125rem;
}

.page-label {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #a8aca8;
  font-size: 0.8rem;
  font-style: italic;
}

.page-header h1 {
  color: #28363d;
  font-size: 2rem;
  line-height: 1.15;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.page-header p {
  color: #6d9197;
  font-size: 0.875rem;
  font-style: italic;
  margin: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
  border-radius: 0.5625rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.back-btn:hover {
  background: #f8f9f8;
}

.back-btn .material-icons-round {
  color: #2f575d;
  font-size: 1.25rem;
}

.error-msg {
  margin: 0 0 1rem;
  color: #c62828;
  font-weight: 700;
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
