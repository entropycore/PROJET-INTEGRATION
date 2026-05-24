<script setup>
import { computed, onMounted, ref } from "vue";
import {
  createStudentProject,
  getStudentProjectValidators,
  submitStudentProject,
  uploadStudentProjectMedia,
} from "@/services/studentProjectsApis";
import { RouterLink, useRouter } from "vue-router";

import "@/assets/styles/student-project-edit.css";

const router = useRouter();
const isSaving = ref(false);
const newTechnology = ref("");
const newLinkLabel = ref("");
const newLinkUrl = ref("");
const errorMessage = ref("");
const selectedScreenshots = ref([]);
const selectedAttachments = ref([]);
const validators = ref([]);
const isValidatorSuggestionsOpen = ref(false);

const projectTypes = [
  { label: "Module", value: "MODULE" },
  { label: "Intégration", value: "INTEGRATION" },
  { label: "Hackathon", value: "HACKATHON" },
  { label: "Personnel", value: "PERSONAL" },
  { label: "Stage", value: "INTERNSHIP" },
];

const projectForm = ref({
  title: "",
  type: "MODULE",
  description: "",
  role: "",
  teamSize: "",
  validationStatus: "DRAFT",

  technologies: [],

  githubUrl: "",
  demoUrl: "",
  documentationUrl: "",
  portfolioUrl: "",

  extraLinks: [],

  screenshots: [],
  attachments: [],

  validatorId: "",
  validatorName: "",
});

const canSubmit = computed(() => {
  return Boolean(
    projectForm.value.title.trim() &&
      projectForm.value.description.trim() &&
      projectForm.value.validatorId,
  );
});

const selectedValidator = computed(() => {
  return validators.value.find(
    (validator) => validator.id === projectForm.value.validatorId,
  );
});

const filteredValidators = computed(() => {
  const query = projectForm.value.validatorName.trim().toLowerCase();

  if (!query) return validators.value.slice(0, 6);

  return validators.value
    .filter((validator) => {
      return [validator.fullName, validator.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    })
    .slice(0, 6);
});

const buildProjectPayload = () => {
  const payload = { ...projectForm.value };

  delete payload.screenshots;
  delete payload.attachments;

  return payload;
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

const addTechnology = () => {
  const value = newTechnology.value.trim();

  if (!value) return;

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

const addCustomLink = () => {
  const label = newLinkLabel.value.trim();
  const url = newLinkUrl.value.trim();

  if (!label || !url) return;

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

  files.forEach((file) => {
    selectedScreenshots.value.push(file);
    projectForm.value.screenshots.push({
      title: file.name,
    });
  });

  event.target.value = "";
};

const handleAttachmentsUpload = (event) => {
  const files = Array.from(event.target.files || []);

  files.forEach((file) => {
    selectedAttachments.value.push(file);
    projectForm.value.attachments.push({
      name: file.name,
      type: file.type || "FICHIER",
    });
  });

  event.target.value = "";
};

const removeScreenshot = (index) => {
  projectForm.value.screenshots.splice(index, 1);
  selectedScreenshots.value.splice(index, 1);
};

const removeAttachment = (index) => {
  projectForm.value.attachments.splice(index, 1);
  selectedAttachments.value.splice(index, 1);
};

const fetchValidators = async () => {
  try {
    const response = await getStudentProjectValidators();
    validators.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error("Erreur chargement validateurs projet :", error);
    validators.value = [];
  }
};

const openValidatorSuggestions = () => {
  isValidatorSuggestionsOpen.value = true;
};

const closeValidatorSuggestions = () => {
  window.setTimeout(() => {
    isValidatorSuggestionsOpen.value = false;
  }, 120);
};

const handleValidatorInput = () => {
  if (
    selectedValidator.value &&
    projectForm.value.validatorName.trim() !== selectedValidator.value.fullName
  ) {
    projectForm.value.validatorId = "";
  }

  openValidatorSuggestions();
};

const selectValidator = (validator) => {
  projectForm.value.validatorId = validator.id;
  projectForm.value.validatorName = validator.fullName || "";
  isValidatorSuggestionsOpen.value = false;
};

const uploadPendingMedia = async (projectId) => {
  if (
    !selectedScreenshots.value.length &&
    !selectedAttachments.value.length
  ) {
    return;
  }

  await uploadStudentProjectMedia(projectId, {
    screenshots: selectedScreenshots.value,
    attachments: selectedAttachments.value,
  });
};

const createDraftProject = async () => {
  isSaving.value = true;
  errorMessage.value = "";

  try {
    const response = await createStudentProject(buildProjectPayload());
    const createdProject = response.data.data;

    await uploadPendingMedia(createdProject.id);

    router.push(`/student/projects/${createdProject.id}`);
  } catch (error) {
    console.error("Erreur création projet :", error);
    errorMessage.value =
      error.response?.data?.message || "Impossible de créer le projet.";
  } finally {
    isSaving.value = false;
  }
};

const createAndSubmitProject = async () => {
  if (!canSubmit.value) return;

  isSaving.value = true;
  errorMessage.value = "";

  try {
    const response = await createStudentProject(buildProjectPayload());
    const createdProject = response.data.data;

    await uploadPendingMedia(createdProject.id);
    await submitStudentProject(createdProject.id);

    router.push(`/student/projects/${createdProject.id}`);
  } catch (error) {
    console.error("Erreur création/soumission projet :", error);
    errorMessage.value =
      error.response?.data?.message ||
      "Impossible de créer et soumettre le projet.";
  } finally {
    isSaving.value = false;
  }
};

onMounted(fetchValidators);
</script>

<template>
  <section class="project-edit-page">
    <div class="edit-header">
      <div>
        <RouterLink to="/student/projects" class="back-link">
          <span class="material-icons-round"> arrow_back </span>

          Retour aux projets
        </RouterLink>

        <h1>Nouveau projet</h1>

        <p>Ajoutez un nouveau projet à votre portfolio académique.</p>
      </div>
      <p v-if="errorMessage" class="edit-error-message">
  {{ errorMessage }}
</p>
      <div class="edit-header-actions">
        <button
          type="button"
          class="secondary-action"
          :disabled="isSaving"
          @click="createDraftProject"
        >
          Enregistrer
        </button>

        <button
          type="button"
          class="primary-action"
          :disabled="!canSubmit || isSaving"
          @click="createAndSubmitProject"
        >
          Créer et soumettre
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

              <div class="autocomplete-field">
                <input
                  v-model="projectForm.validatorName"
                  type="text"
                  autocomplete="off"
                  placeholder="Tapez le nom du validateur"
                  :disabled="!validators.length"
                  @focus="openValidatorSuggestions"
                  @blur="closeValidatorSuggestions"
                  @input="handleValidatorInput"
                />

                <div
                  v-if="
                    isValidatorSuggestionsOpen &&
                    validators.length &&
                    filteredValidators.length
                  "
                  class="suggestions-list"
                >
                  <button
                    v-for="validator in filteredValidators"
                    :key="validator.id"
                    type="button"
                    class="suggestion-item"
                    @mousedown.prevent="selectValidator(validator)"
                  >
                    <span class="suggestion-avatar">
                      {{ validator.fullName?.charAt(0) || "V" }}
                    </span>
                    <span>
                      <strong>{{ validator.fullName }}</strong>
                      <small>
                        {{ validator.department || "Département non renseigné" }}
                        <template v-if="validator.specialty">
                          · {{ validator.specialty }}
                        </template>
                      </small>
                    </span>
                  </button>
                </div>
              </div>
            </label>

            <label class="form-field full">
              <span>À propos du projet</span>

              <textarea
                v-model="projectForm.description"
                rows="5"
                placeholder="Décrivez le projet..."
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

            <input v-model="newLinkUrl" type="url" placeholder="https://..." />

            <button
              type="button"
              class="secondary-action"
              @click="addCustomLink"
            >
              Ajouter
            </button>
          </div>

          <div v-if="projectForm.extraLinks.length" class="extra-links-list">
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
            <span class="material-icons-round"> add_photo_alternate </span>

            <strong> Ajouter des captures </strong>

            <small> PNG, JPG ou WEBP </small>

            <input
  type="file"
  accept="image/*"
  multiple
  @change="handleScreenshotsUpload"
/>
          </label>

          <div v-if="projectForm.screenshots.length" class="uploaded-list">
            <div
              v-for="(screenshot, index) in projectForm.screenshots"
              :key="`${screenshot.title}-${index}`"
              class="uploaded-item"
            >
              <span>{{ screenshot.title }}</span>

              <button type="button" @click="removeScreenshot(index)">
                Supprimer
              </button>
            </div>
          </div>
        </section>

        <section class="edit-card">
          <h2>Pièces jointes</h2>

          <label class="file-upload-box">
            <span class="material-icons-round"> attach_file </span>

            <strong> Ajouter des fichiers </strong>

            <small> PDF, ZIP, DOC, DOCX ou TXT </small>

            <input type="file" multiple @change="handleAttachmentsUpload" />
          </label>

          <div v-if="projectForm.attachments.length" class="uploaded-list">
            <div
              v-for="(attachment, index) in projectForm.attachments"
              :key="`${attachment.name}-${index}`"
              class="uploaded-item"
            >
              <span>{{ attachment.name }}</span>

              <button type="button" @click="removeAttachment(index)">
                Supprimer
              </button>
            </div>
          </div>
        </section>

        <section v-if="!canSubmit" class="edit-warning-card">
          Complétez le titre, la description et le validateur avant de soumettre le projet.
        </section>
      </aside>
    </div>
  </section>
</template>
