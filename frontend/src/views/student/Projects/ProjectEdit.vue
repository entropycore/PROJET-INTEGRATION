<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import {
  getStudentProjectById,
  updateStudentProject,
  submitStudentProject,
  uploadStudentProjectMedia,
} from "@/services/studentProjectsApis";

import "@/assets/styles/student-project-edit.css";

const route = useRoute();
const router = useRouter();

const isLoading = ref(false);
const projectForm = ref(null);

const newTechnology = ref("");
const newLinkLabel = ref("");
const newLinkUrl = ref("");
const isSaving = ref(false);
const errorMessage = ref("");
const selectedScreenshots = ref([]);
const selectedAttachments = ref([]);

const projectTypes = [
  { label: "Module", value: "MODULE" },
  { label: "Intégration", value: "INTEGRATION" },
  { label: "Hackathon", value: "HACKATHON" },
  { label: "Personnel", value: "PERSONAL" },
  { label: "Stage", value: "INTERNSHIP" },
];

const canSubmit = computed(() => {
  return Boolean(projectForm.value?.validatorName);
});

const buildProjectPayload = () => {
  const payload = { ...projectForm.value };

  delete payload.screenshots;
  delete payload.attachments;
  delete payload.validatorId;
  delete payload.validationHistory;
  delete payload.createdAt;
  delete payload.updatedAt;

  return payload;
};

const fetchProject = async () => {
  isLoading.value = true;

  try {
    const response = await getStudentProjectById(route.params.id);
    projectForm.value = structuredClone(response.data.data);
  } catch (error) {
    console.warn("API project detail indisponible.");
  } finally {
    isLoading.value = false;
  }
};

const addTechnology = () => {
  const value = newTechnology.value.trim();

  if (!value) return;

  if (!projectForm.value.technologies) {
    projectForm.value.technologies = [];
  }

  if (!projectForm.value.technologies.includes(value)) {
    projectForm.value.technologies.push(value);
  }

  newTechnology.value = "";
};

const removeTechnology = (tech) => {
  projectForm.value.technologies = projectForm.value.technologies.filter(
    (item) => item !== tech,
  );
};

const projectLinks = computed(() => {
  return [
    {
      key: "githubUrl",
      label: "GitHub Repository",
    },
    {
      key: "demoUrl",
      label: "Démo du projet",
    },
    {
      key: "documentationUrl",
      label: "Documentation",
    },
    {
      key: "portfolioUrl",
      label: "Portfolio",
    },
  ];
});

const addCustomLink = () => {
  const label = newLinkLabel.value.trim();
  const url = newLinkUrl.value.trim();

  if (!label || !url) return;

  if (!projectForm.value.extraLinks) {
    projectForm.value.extraLinks = [];
  }

  projectForm.value.extraLinks.push({
    id: Date.now(),
    label,
    url,
  });

  newLinkLabel.value = "";
  newLinkUrl.value = "";
};

const removeCustomLink = (id) => {
  projectForm.value.extraLinks = projectForm.value.extraLinks.filter(
    (link) => link.id !== id,
  );
};

const handleScreenshotsUpload = (event) => {
  const files = Array.from(event.target.files || []);

  if (!projectForm.value.screenshots) {
    projectForm.value.screenshots = [];
  }

  files.forEach((file) => {
    const id = `local-${Date.now()}-${Math.random()}`;

    projectForm.value.screenshots.push({
      id,
      title: file.name,
      isLocal: true,
    });

    file.localMediaId = id;
    selectedScreenshots.value.push(file);
  });

  event.target.value = "";
};

const handleAttachmentsUpload = (event) => {
  const files = Array.from(event.target.files || []);

  if (!projectForm.value.attachments) {
    projectForm.value.attachments = [];
  }

  files.forEach((file) => {
    const id = `local-${Date.now()}-${Math.random()}`;

    projectForm.value.attachments.push({
      id,
      name: file.name,
      type: file.type || "FICHIER",
      isLocal: true,
    });

    file.localMediaId = id;
    selectedAttachments.value.push(file);
  });

  event.target.value = "";
};

const removeScreenshot = (id) => {
  projectForm.value.screenshots = projectForm.value.screenshots.filter(
    (screenshot) => screenshot.id !== id,
  );
  selectedScreenshots.value = selectedScreenshots.value.filter(
    (file) => file.localMediaId !== id,
  );
};

const removeAttachment = (id) => {
  projectForm.value.attachments = projectForm.value.attachments.filter(
    (attachment) => attachment.id !== id,
  );
  selectedAttachments.value = selectedAttachments.value.filter(
    (file) => file.localMediaId !== id,
  );
};

const uploadPendingMedia = async () => {
  if (!selectedScreenshots.value.length && !selectedAttachments.value.length) {
    return;
  }

  await uploadStudentProjectMedia(route.params.id, {
    screenshots: selectedScreenshots.value,
    attachments: selectedAttachments.value,
  });
};

const saveProject = async () => {
  isSaving.value = true;
  errorMessage.value = "";

  try {
    await updateStudentProject(route.params.id, buildProjectPayload());
    await uploadPendingMedia();

    router.push(`/student/projects/${route.params.id}`);
  } catch (error) {
    console.error("Erreur mise à jour projet :", error);
    errorMessage.value =
      error.response?.data?.message || "Impossible de modifier le projet.";
  } finally {
    isSaving.value = false;
  }
};

const submitProject = async () => {
  if (!canSubmit.value) return;

  isSaving.value = true;
  errorMessage.value = "";

  try {
    await updateStudentProject(route.params.id, buildProjectPayload());
    await uploadPendingMedia();
    await submitStudentProject(route.params.id);
    router.push(`/student/projects/${route.params.id}`);
  } catch (error) {
    console.error("Erreur soumission projet :", error);
    errorMessage.value =
      error.response?.data?.message || "Impossible de soumettre le projet.";
  } finally {
    isSaving.value = false;
  }
};

onMounted(fetchProject);
</script>

<template>
  <section class="project-edit-page">
    <div v-if="isLoading" class="edit-state">Chargement du projet...</div>

    <template v-else-if="projectForm">
      <div class="edit-header">
        <div>
          <RouterLink
            :to="`/student/projects/${route.params.id}`"
            class="back-link"
          >
            <span class="material-icons-round">arrow_back</span>
            Retour au détail
          </RouterLink>

          <h1>Modifier le projet</h1>

          <p>
            Complétez les informations du projet avant de le soumettre à un
            validateur.
          </p>
        </div>

        <div class="edit-header-actions">
          <button type="button" class="secondary-action" @click="saveProject">
            Enregistrer
          </button>

          <button
            type="button"
            class="primary-action"
            :disabled="!canSubmit"
            @click="submitProject"
          >
            Soumettre
          </button>
        </div>
      </div>

      <div class="edit-layout">
        <div class="edit-main-column">
          <section class="edit-card">
            <h2>Informations principales</h2>

            <div class="form-grid">
              <label class="form-field full">
                <span>Titre du projet</span>
                <input
                  v-model="projectForm.title"
                  type="text"
                  placeholder="Titre du projet"
                />
              </label>

              <label class="form-field">
                <span>Type</span>
                <select v-model="projectForm.type">
                  <option
                    v-for="type in projectTypes"
                    :key="type.value"
                    :value="type.value"
                  >
                    {{ type.label }}
                  </option>
                </select>
              </label>

              <label class="form-field">
                <span>Validateur</span>
                <input
                  v-model="projectForm.validatorName"
                  type="text"
                  placeholder="Nom du validateur"
                />
              </label>

              <label class="form-field full">
                <span>À propos du projet</span>
                <textarea
                  v-model="projectForm.description"
                  rows="5"
                  placeholder="Décrivez le projet, son objectif et sa valeur académique..."
                ></textarea>
              </label>

              <label class="form-field">
                <span>Rôle</span>
                <input
                  v-model="projectForm.role"
                  type="text"
                  placeholder="Ex: Dev Fullstack"
                />
              </label>

              <label class="form-field">
                <span>Équipe</span>
                <input
                  v-model="projectForm.teamSize"
                  type="text"
                  placeholder="Ex: 4 membres"
                />
              </label>
            </div>
          </section>

          <section class="edit-card">
            <h2>Technologies utilisées</h2>

            <div class="project-tech-list">
              <span
                v-for="tech in projectForm.technologies"
                :key="tech"
                class="project-tech-pill editable"
              >
                {{ tech }}
                <button type="button" @click="removeTechnology(tech)">×</button>
              </span>
            </div>

            <div class="inline-add-form">
              <input
                v-model="newTechnology"
                type="text"
                placeholder="Ajouter une technologie"
                @keyup.enter="addTechnology"
              />

              <button
                type="button"
                class="secondary-action"
                @click="addTechnology"
              >
                Ajouter
              </button>
            </div>
          </section>

          <section class="edit-card">
            <h2>Liens du projet</h2>

            <div class="form-grid">
              <label
                v-for="link in projectLinks"
                :key="link.key"
                class="form-field full"
              >
                <span>{{ link.label }}</span>
                <input
                  v-model="projectForm[link.key]"
                  type="url"
                  placeholder="https://..."
                />
              </label>
            </div>

            <div class="inline-add-form two-inputs">
              <input
                v-model="newLinkLabel"
                type="text"
                placeholder="Nom du lien"
              />

              <input
                v-model="newLinkUrl"
                type="url"
                placeholder="https://..."
              />

              <button
                type="button"
                class="secondary-action"
                @click="addCustomLink"
              >
                Ajouter
              </button>
            </div>

            <div v-if="projectForm.extraLinks?.length" class="extra-links-list">
              <div
                v-for="link in projectForm.extraLinks"
                :key="link.id"
                class="extra-link-item"
              >
                <span>{{ link.label }}</span>
                <button type="button" @click="removeCustomLink(link.id)">
                  Supprimer
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside class="edit-side-column">
          <section class="edit-card">
            <h2>Captures d’écran</h2>

            <label class="file-upload-box">
              <span class="material-icons-round">add_photo_alternate</span>
              <strong>Ajouter des captures</strong>
              <small>PNG, JPG ou WEBP</small>

              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleScreenshotsUpload"
              />
            </label>

            <div v-if="projectForm.screenshots?.length" class="uploaded-list">
              <div
                v-for="screenshot in projectForm.screenshots"
                :key="screenshot.id"
                class="uploaded-item"
              >
                <span>{{ screenshot.title }}</span>

                <button type="button" @click="removeScreenshot(screenshot.id)">
                  Supprimer
                </button>
              </div>
            </div>
          </section>

          <section class="edit-card">
            <h2>Pièces jointes</h2>

            <label class="file-upload-box">
              <span class="material-icons-round">attach_file</span>
              <strong>Ajouter des fichiers</strong>
              <small>PDF, image ou document</small>

              <input type="file" multiple @change="handleAttachmentsUpload" />
            </label>

            <div v-if="projectForm.attachments?.length" class="uploaded-list">
              <div
                v-for="attachment in projectForm.attachments"
                :key="attachment.id"
                class="uploaded-item"
              >
                <span>{{ attachment.name }}</span>

                <button type="button" @click="removeAttachment(attachment.id)">
                  Supprimer
                </button>
              </div>
            </div>
          </section>

          <section v-if="!canSubmit" class="edit-warning-card">
            Choisissez un validateur avant de soumettre le projet.
          </section>
        </aside>
      </div>
    </template>
  </section>
</template>
