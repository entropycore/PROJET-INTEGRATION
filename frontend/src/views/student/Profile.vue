<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { buildBackendUrl } from "../../services/backendUrl";
import {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentProfilePicture,
  getAcademicPaths,
  addAcademicPath,
  deleteAcademicPath,
  getSoftSkills,
  addSoftSkill,
  deleteSoftSkill,
  getCareerGoal,
  updateCareerGoal,
} from "../../services/studentProfileService";

const profile = ref(null);
const academicPaths = ref([]);
const softSkills = ref([]);
const authStore = useAuthStore();
const careerGoal = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const isEditing = ref(false);
const showAddPath = ref(false);
const showAddSkill = ref(false);
const newSkillName = ref("");
const pictureInput = ref(null);
const isUploadingPicture = ref(false);

const careerGoals = [
  { value: "WEB_DEVELOPER", label: "Développeur Web" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "DATA", label: "Data Science" },
  { value: "CYBERSECURITY", label: "Cybersécurité" },
];

const editForm = ref({
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  bio: "",
  linkedinUrl: "",
});

const newPath = ref({
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
});

const unwrapData = (response) => response?.data ?? response ?? null;

const normalizeSoftSkills = (payload) => {
  const items = Array.isArray(payload)
    ? payload
    : payload?.softSkills || payload?.items || [];

  return items
    .map((skill) => {
      if (typeof skill === "string") {
        return { id: skill, name: skill };
      }

      return {
        id: skill.id || skill.name || skill.skill?.id,
        name: skill.name || skill.label || skill.skill?.name || "",
      };
    })
    .filter((skill) => skill.name);
};

const formatProfileDate = (date) => {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
};

const formatDateRange = (startDate, endDate) => {
  const start = formatProfileDate(startDate) || "Date non renseignée";
  const end = formatProfileDate(endDate) || "Présent";

  return `${start} — ${end}`;
};

const loadAll = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const [profileRes, pathsRes, skillsRes, goalRes] = await Promise.all([
      getStudentProfile(),
      getAcademicPaths(),
      getSoftSkills(),
      getCareerGoal(),
    ]);
    profile.value = unwrapData(profileRes);
    academicPaths.value = unwrapData(pathsRes) || [];
    softSkills.value = normalizeSoftSkills(unwrapData(skillsRes));
    careerGoal.value = unwrapData(goalRes)?.careerGoal || "";
  } catch (err) {
    const user = authStore.user || {};
    profile.value = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: "",
      field: "",
      level: "",
      city: "",
      bio: "",
      linkedinUrl: "",
    };
    academicPaths.value = [];
    softSkills.value = [];
    careerGoal.value = "";
  } finally {
    isLoading.value = false;
  }
};

const startEdit = () => {
  editForm.value = {
    firstName: profile.value.firstName,
    lastName: profile.value.lastName,
    phone: profile.value.phone || "",
    city: profile.value.city || "",
    bio: profile.value.bio || "",
    linkedinUrl: profile.value.linkedinUrl || "",
  };
  isEditing.value = true;
};

const saveProfile = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  try {
    await updateStudentProfile(editForm.value);
    successMessage.value = "Profil mis à jour avec succès.";
    isEditing.value = false;
    await loadAll();
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Erreur de mise à jour.";
  }
};

const setCareerGoal = async (goal) => {
  try {
    await updateCareerGoal({ careerGoal: goal });
    careerGoal.value = goal;
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Erreur.";
  }
};

const addPath = async () => {
  try {
    await addAcademicPath(newPath.value);
    showAddPath.value = false;
    newPath.value = {
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
    };
    await loadAll();
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Erreur d'ajout.";
  }
};

const deletePath = async (id) => {
  try {
    await deleteAcademicPath(id);
    await loadAll();
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Erreur de suppression.";
  }
};

const handleAddSkill = async () => {
  if (!newSkillName.value.trim()) return;
  try {
    await addSoftSkill({ name: newSkillName.value });
    newSkillName.value = "";
    showAddSkill.value = false;
    await loadAll();
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Erreur.";
  }
};

const handleDeleteSkill = async (id) => {
  try {
    await deleteSoftSkill(id);
    await loadAll();
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Erreur.";
  }
};

const openPicturePicker = () => {
  pictureInput.value?.click();
};

const handleProfilePictureChange = async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  errorMessage.value = "";
  successMessage.value = "";

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    errorMessage.value = "Format image non autorisé. Utilisez JPG, PNG ou WebP.";
    event.target.value = "";
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    errorMessage.value = "La photo doit faire moins de 3 Mo.";
    event.target.value = "";
    return;
  }

  isUploadingPicture.value = true;

  try {
    const response = await uploadStudentProfilePicture(file);
    const data = unwrapData(response);

    profile.value = {
      ...profile.value,
      profilePicture: data?.profilePicture || profile.value.profilePicture,
    };

    successMessage.value = "Photo de profil mise à jour.";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Erreur upload photo de profil.";
  } finally {
    isUploadingPicture.value = false;
    event.target.value = "";
  }
};

const getInitials = (fn, ln) =>
  `${fn?.[0] || ""}${ln?.[0] || ""}`.toUpperCase();

onMounted(loadAll);
</script>

<template>
  <div class="profile-page">
    <div class="page-header">
      
    </div>

    <p v-if="isLoading" class="text-muted">Chargement...</p>
    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

    <div v-if="profile">
      <div class="student-profile-header">
        <div class="profile-avatar">
          <img
            v-if="profile.profilePicture"
            :src="buildBackendUrl(profile.profilePicture)"
            alt=""
          />
          <span v-else>
            {{ getInitials(profile.firstName, profile.lastName) }}
          </span>
        </div>

        <div class="profile-identity">
          <span>PROFIL ÉTUDIANT</span>
          <div class="profile-name">
            {{ profile.firstName }} {{ profile.lastName }}
          </div>
          <div class="text-muted">{{ profile.email }}</div>
        </div>

        <div class="profile-header-actions">
          <input
            ref="pictureInput"
            class="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="handleProfilePictureChange"
          />
          <button
            class="btn btn-secondary"
            type="button"
            :disabled="isUploadingPicture"
            @click="openPicturePicker"
          >
            <span class="material-icons-round">photo_camera</span>
            {{ isUploadingPicture ? "Upload..." : "Changer la photo" }}
          </button>
          <button
            v-if="!isEditing"
            class="btn btn-primary"
            type="button"
            @click="startEdit"
          >
            <span class="material-icons-round">edit</span>
            Modifier le profil
          </button>
        </div>
      </div>

      <div class="section-row">
        <!-- Colonne gauche -->
        <div class="content-card">
          <div v-if="!isEditing">
            <h3 class="card-title">Informations personnelles</h3>
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="info-label">Filière</td>
                  <td class="info-value">{{ profile.field || "—" }}</td>
                </tr>
                <tr>
                  <td class="info-label">Niveau</td>
                  <td class="info-value">{{ profile.level || "—" }}</td>
                </tr>
                <tr>
                  <td class="info-label">Téléphone</td>
                  <td class="info-value">{{ profile.phone || "—" }}</td>
                </tr>
                <tr>
                  <td class="info-label">Ville</td>
                  <td class="info-value">{{ profile.city || "—" }}</td>
                </tr>
                <tr>
                  <td class="info-label">LinkedIn</td>
                  <td class="info-value link">
                    {{ profile.linkedinUrl || "—" }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="profile.bio" class="profile-bio">
              <h3 class="card-title">Bio</h3>
              <p>{{ profile.bio }}</p>
            </div>
          </div>

          <div v-else>
            <div class="form-row">
              <div class="form-group">
                <label>Prénom</label>
                <input v-model="editForm.firstName" type="text" />
              </div>
              <div class="form-group">
                <label>Nom</label>
                <input v-model="editForm.lastName" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Téléphone</label>
                <input v-model="editForm.phone" type="text" />
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input v-model="editForm.city" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>Bio</label>
              <textarea v-model="editForm.bio"></textarea>
            </div>
            <div class="form-group">
              <label>LinkedIn URL</label>
              <input v-model="editForm.linkedinUrl" type="text" />
            </div>
            <div class="flex-gap mt-12">
              <button class="btn btn-primary" @click="saveProfile">
                Enregistrer
              </button>
              <button class="btn btn-secondary" @click="isEditing = false">
                Annuler
              </button>
            </div>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="profile-side-column">
          <div class="content-card">
            <h3 class="card-title">Objectif professionnel</h3>
            <div class="chips-row">
              <span
                v-for="goal in careerGoals"
                :key="goal.value"
                class="filter-chip"
                :class="{ active: careerGoal === goal.value }"
                @click="setCareerGoal(goal.value)"
              >
                {{ goal.label }}
              </span>
            </div>
            <p class="hint-text">
              Votre portfolio sera adapté selon l'objectif sélectionné pour
              mettre en avant les compétences pertinentes.
            </p>
          </div>

          <div class="content-card">
            <h3 class="card-title">Compétences comportementales</h3>
            <div v-if="softSkills.length" class="skills-row">
              <span
                v-for="skill in softSkills"
                :key="skill.id"
                class="skill-badge"
                @click="handleDeleteSkill(skill.id)"
                title="Cliquer pour supprimer"
              >
                <span class="material-icons-round" style="font-size: 12px"
                  >check</span
                >
                {{ skill.name }}
              </span>
            </div>
            <div v-else class="soft-skills-empty">
              Aucune compétence comportementale ajoutée.
            </div>
            <div v-if="showAddSkill" class="flex-gap mt-12">
              <input
                v-model="newSkillName"
                type="text"
                placeholder="Ex: Leadership"
                class="skill-input"
              />
              <button class="btn btn-primary btn-sm" @click="handleAddSkill">
                OK
              </button>
              <button
                class="btn btn-secondary btn-sm"
                @click="showAddSkill = false"
              >
                ✕
              </button>
            </div>
            <button
              v-else
              class="btn btn-secondary btn-sm mt-12"
              @click="showAddSkill = true"
            >
              <span class="material-icons-round">add</span>
              Ajouter
            </button>
          </div>
        </div>
      </div>

      <!-- Parcours académique -->
      <div class="content-card">
        <div class="flex-between mb-8">
          <h3 class="card-title" style="margin: 0">Parcours académique</h3>
          <button
            class="btn btn-secondary btn-sm"
            @click="showAddPath = !showAddPath"
          >
            <span class="material-icons-round">add</span>
            Ajouter
          </button>
        </div>

        <div v-if="showAddPath" class="add-form">
          <div class="form-row">
            <div class="form-group">
              <label>Établissement</label>
              <input
                v-model="newPath.institution"
                type="text"
                placeholder="Ex: ENSA Tanger"
              />
            </div>
            <div class="form-group">
              <label>Diplôme</label>
              <input
                v-model="newPath.degree"
                type="text"
                placeholder="Ex: Cycle Ingénieur"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Filière</label>
              <input
                v-model="newPath.field"
                type="text"
                placeholder="Ex: Génie Informatique"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date de début</label>
              <input v-model="newPath.startDate" type="date" />
            </div>
            <div class="form-group">
              <label>Date de fin</label>
              <input v-model="newPath.endDate" type="date" />
            </div>
          </div>
          <div class="flex-gap">
            <button class="btn btn-primary btn-sm" @click="addPath">
              Ajouter
            </button>
            <button
              class="btn btn-secondary btn-sm"
              @click="showAddPath = false"
            >
              Annuler
            </button>
          </div>
          <div class="divider"></div>
        </div>

        <div v-if="academicPaths.length > 0" class="timeline">
          <div
            v-for="path in academicPaths"
            :key="path.id"
            class="timeline-item"
          >
            <div class="t-date">
              {{ formatDateRange(path.startDate, path.endDate) }}
            </div>
            <div class="t-title">{{ path.degree }}</div>
            <div class="t-desc">
              {{ path.institution
              }}<span v-if="path.field"> — {{ path.field }}</span>
            </div>
            <button
              class="btn btn-danger btn-sm mt-12"
              @click="deletePath(path.id)"
            >
              <span class="material-icons-round">delete</span>
              Supprimer
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="material-icons-round">school</span>
          <h4>Aucune formation ajoutée</h4>
          <p>Ajoutez votre parcours académique pour enrichir votre profil.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  font-family: "DM Sans", sans-serif;
  color: #28363d;
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
  font-family: "Times New Roman", Times, serif !important;
  margin-bottom: 0.4rem;
  color: #a8aca8;
  font-size: clamp(0.7rem, 0.8vw, 0.85rem);
  font-style: italic;
  font-weight: 400;
}

.page-header h1 {
  font-family: "Times New Roman", Times, serif !important;
  color: #28363d;
  font-size: 2rem;
  line-height: 1.15;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.page-header p {
  font-family: "Times New Roman", Times, serif !important;
  margin: 0;
  color: #6d9197;
  font-size: 0.875rem;
  font-style: italic;
  font-weight: 400;
}

.section-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: stretch;
  margin-bottom: 1rem;
}

.content-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
  padding: 1.25rem;
  margin-bottom: 16px;
}

.section-row > .content-card,
.profile-side-column .content-card {
  margin-bottom: 0;
}

.profile-side-column {
  display: grid;
  gap: 1rem;
}

.student-profile-header {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.35rem;
  margin-bottom: 1rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.profile-identity {
  min-width: 0;
}

.profile-identity > span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
}

.profile-header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.card-title {
  font-size: 1rem;
  color: var(--app-primary);
  font-family: var(--app-font-body);
  font-weight: 900;
  margin-bottom: 12px;
}

.card-title::after {
  content: "";
  display: block;
  width: 2.7rem;
  height: 3px;
  margin-top: 0.45rem;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--app-primary), var(--app-accent));
}

.profile-avatar {
  width: 5.2rem;
  height: 5.2rem;
  border-radius: 50%;
  border: 2px solid var(--app-active-border);
  background: var(--app-primary);
  box-shadow: 0 0.75rem 1.5rem rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-family: "DM Serif Display", serif;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
}
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.profile-name {
  margin: 0.25rem 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.7rem, 2.4vw, 2.3rem);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
}
.badge-info {
  background: #e3f2fd;
  color: #1565c0;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}
.info-label {
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  font-weight: 600;
  padding: 0.65rem 0;
  width: 140px;
  vertical-align: top;
  border-bottom: 1px solid var(--app-neutral-bg);
}
.info-value {
  color: var(--app-heading);
  font-size: var(--app-text-md);
  font-weight: 700;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--app-neutral-bg);
}
.info-value.link {
  color: #2f575d;
}

.profile-bio {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #dee1dd;
}

.profile-bio p {
  margin: 0;
  color: #5f777b;
  font-size: 13.5px;
  line-height: 1.6;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #c4cdc1;
  font-size: 12.5px;
  cursor: pointer;
  color: #6d9197;
  transition: all 0.15s;
}
.filter-chip:hover {
  border-color: #6d9197;
}
.filter-chip.active {
  background: #2f575d;
  color: #fff;
  border-color: #2f575d;
}
.hint-text {
  font-size: 13px;
  color: #6d9197;
  margin: 0;
}

.skills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.skill-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: #f8f9f8;
  border: 1px solid #c4cdc1;
  color: #2f575d;
  cursor: pointer;
}
.skill-badge:hover {
  border-color: #6d9197;
}
.soft-skills-empty {
  padding: 12px;
  border: 1px dashed #c4cdc1;
  border-radius: 8px;
  background: #f8f9f8;
  color: #99aead;
  font-size: 13px;
}
.skill-input {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid #c4cdc1;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  font-family: "DM Sans", sans-serif;
  color: #28363d;
  background: #fff;
}
.skill-input:focus {
  border-color: #2f575d;
}

.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 12.5px;
  font-weight: 500;
  color: #6d9197;
  margin-bottom: 5px;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #c4cdc1;
  border-radius: 8px;
  background: #fff;
  font-family: "DM Sans", sans-serif;
  font-size: 13.5px;
  color: #28363d;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-group input:focus,
.form-group textarea:focus {
  border-color: #2f575d;
}
.form-group textarea {
  resize: vertical;
  min-height: 90px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.add-form {
  background: #f8f9f8;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #dee1dd;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  font-family: "DM Sans", sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}
.btn-primary {
  background: #2f575d;
  color: #fff;
  border-color: #2f575d;
}
.btn-primary:hover {
  background: #245055;
}
.btn-secondary {
  background: #fff;
  color: #2f575d;
  border-color: #c4cdc1;
}
.btn-secondary:hover {
  background: #f8f9f8;
}
.btn-danger {
  background: #fff;
  color: #c0392b;
  border-color: #f5c6c6;
}
.btn-danger:hover {
  background: #fff5f5;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-sm {
  padding: 6px 12px;
  font-size: 12.5px;
}
.btn .material-icons-round {
  font-size: 16px;
}

.timeline {
  padding-left: 20px;
  border-left: 2px solid #dee1dd;
}
.timeline-item {
  position: relative;
  padding: 0 0 20px 20px;
}
.timeline-item::before {
  content: "";
  position: absolute;
  left: -6px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2f575d;
  border: 2px solid #fff;
}
.t-date {
  font-size: 11.5px;
  color: #99aead;
  margin-bottom: 3px;
}
.t-title {
  font-size: 14px;
  font-weight: 500;
  color: #28363d;
}
.t-desc {
  font-size: 13px;
  color: #6d9197;
  margin-top: 3px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #99aead;
}
.empty-state .material-icons-round {
  font-size: 48px;
  color: #c4cdc1;
  margin-bottom: 12px;
  display: block;
}
.empty-state h4 {
  font-size: 16px;
  color: #6d9197;
  font-weight: 500;
  margin-bottom: 6px;
}
.empty-state p {
  font-size: 13px;
}

.divider {
  height: 1px;
  background: #dee1dd;
  margin: 16px 0;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flex-gap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mt-12 {
  margin-top: 12px;
}
.mb-8 {
  margin-bottom: 8px;
}
.text-muted {
  color: #99aead;
  font-size: 13px;
}
.error-msg {
  color: #c0392b;
  font-size: 13px;
  margin-bottom: 12px;
}
.success-msg {
  color: #658b6f;
  font-size: 13px;
  margin-bottom: 12px;
}

@media (max-width: 900px) {
  .section-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .student-profile-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-header-actions {
    width: 100%;
    margin-left: 0;
  }

  .profile-header-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header,
  .flex-between {
    align-items: stretch;
    flex-direction: column;
  }

  .profile-header-actions {
    flex-direction: column;
  }

  .profile-header-actions .btn {
    width: 100%;
  }

  .info-label,
  .info-value {
    display: block;
    width: 100%;
  }

  .info-label {
    padding-bottom: 0.15rem;
    border-bottom: 0;
  }

  .info-value {
    padding-top: 0;
  }
}
</style>
