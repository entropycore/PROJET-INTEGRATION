<script setup>
import { onMounted, ref } from "vue";

import { buildBackendUrl } from "@/services/backendUrl";
import { getProfessorProfile } from "@/services/professorApi";

const profile = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

const getInitials = (name) => {
  if (!name) return "?";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    profile.value = await getProfessorProfile();
  } catch (error) {
    console.error("Erreur profil professeur :", error);
    errorMessage.value = "Impossible de charger le profil professeur.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="professor-profile-page">
    <div v-if="isLoading" class="state-card">Chargement du profil...</div>

    <div v-else-if="errorMessage" class="state-card error">
      {{ errorMessage }}
    </div>

    <template v-else-if="profile">
      <header class="profile-header">
        <img
          v-if="profile.user.profilePicture"
          :src="buildBackendUrl(profile.user.profilePicture)"
          alt="Photo professeur"
        />
        <div v-else class="profile-avatar">
          {{ getInitials(profile.user.fullName) }}
        </div>

        <div>
          <span>PROFIL PROFESSEUR</span>
          <h1>{{ profile.user.fullName }}</h1>
          <p>{{ profile.user.email }}</p>
        </div>
      </header>

      <div class="profile-grid">
        <section class="profile-panel">
          <h2>Informations academiques</h2>

          <div class="info-list">
            <div>
              <span>Matricule</span>
              <strong>{{ profile.profile.employeeId || "-" }}</strong>
            </div>
            <div>
              <span>Grade</span>
              <strong>{{ profile.profile.grade || "-" }}</strong>
            </div>
            <div>
              <span>Specialite</span>
              <strong>{{ profile.profile.specialty || "-" }}</strong>
            </div>
            <div>
              <span>Departement</span>
              <strong>{{ profile.profile.department || "-" }}</strong>
            </div>
          </div>
        </section>

        <section class="profile-panel">
          <h2>Compte</h2>

          <div class="info-list">
            <div>
              <span>Telephone</span>
              <strong>{{ profile.user.phone || "-" }}</strong>
            </div>
            <div>
              <span>Statut</span>
              <strong>{{ profile.user.accountStatus }}</strong>
            </div>
            <div>
              <span>Derniere connexion</span>
              <strong>{{ formatDate(profile.user.lastLoginAt) }}</strong>
            </div>
            <div>
              <span>Creation</span>
              <strong>{{ formatDate(profile.user.createdAt) }}</strong>
            </div>
          </div>
        </section>

        <section class="profile-panel wide">
          <h2>Stages supervises</h2>

          <div v-if="profile.supervisedInternships.length" class="table-list">
            <article
              v-for="internship in profile.supervisedInternships"
              :key="internship.id"
              class="table-row"
            >
              <div>
                <strong>{{ internship.hostOrganization }}</strong>
                <p>
                  {{ internship.student?.fullName || "Etudiant non renseigne" }}
                </p>
              </div>
              <span>{{ internship.validationStatus }}</span>
              <small>
                {{ formatDate(internship.startDate) }} -
                {{ formatDate(internship.endDate) }}
              </small>
            </article>
          </div>

          <p v-else class="empty-text">Aucun stage supervise.</p>
        </section>

        <section class="profile-panel wide">
          <h2>Dernieres validations</h2>

          <div
            v-if="
              profile.recentProjectValidations.length ||
              profile.recentInternshipValidations.length
            "
            class="table-list"
          >
            <article
              v-for="validation in profile.recentProjectValidations"
              :key="`project-${validation.id}`"
              class="table-row"
            >
              <div>
                <strong>{{ validation.project?.title || "Projet" }}</strong>
                <p>
                  {{
                    validation.project?.studentName || "Etudiant non renseigne"
                  }}
                </p>
              </div>
              <span>{{ validation.decision }}</span>
              <small>{{ formatDate(validation.decisionDate) }}</small>
            </article>

            <article
              v-for="validation in profile.recentInternshipValidations"
              :key="`internship-${validation.id}`"
              class="table-row"
            >
              <div>
                <strong>{{
                  validation.internship?.hostOrganization || "Stage"
                }}</strong>
                <p>
                  {{
                    validation.internship?.studentName ||
                    "Etudiant non renseigne"
                  }}
                </p>
              </div>
              <span>{{ validation.decision }}</span>
              <small>{{ formatDate(validation.decisionDate) }}</small>
            </article>
          </div>

          <p v-else class="empty-text">Aucune validation recente.</p>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.professor-profile-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-header,
.profile-panel,
.state-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.profile-header img,
.profile-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
}

.profile-header img {
  object-fit: cover;
}

.profile-avatar {
  display: grid;
  place-items: center;
  background: var(--app-primary);
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 800;
}

.profile-header span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
}

.profile-header h1 {
  margin: 0.25rem 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.7rem, 2.4vw, 2.3rem);
  font-weight: 500;
}

.profile-header p {
  margin: 0;
  color: var(--app-muted);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.profile-panel {
  padding: 1.1rem;
}

.profile-panel.wide {
  grid-column: 1 / -1;
}

.profile-panel h2 {
  margin: 0 0 1rem;
  color: var(--app-heading);
  font-size: var(--app-text-lg);
}

.info-list {
  display: grid;
  gap: 0.85rem;
}

.info-list span {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.info-list strong {
  color: var(--app-text);
}

.table-list {
  display: grid;
  gap: 0.65rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.8rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
}

.table-row strong {
  color: var(--app-heading);
}

.table-row p {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
}

.table-row span {
  color: var(--app-primary);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.table-row small,
.empty-text,
.state-card {
  color: var(--app-muted);
}

.state-card {
  padding: 1.4rem;
}

.state-card.error {
  color: var(--app-error);
}

@media (max-width: 760px) {
  .profile-header,
  .table-row {
    align-items: flex-start;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
