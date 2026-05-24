<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  initialActivity: {
    type: Object,
    default: null,
  },
  submitLabel: {
    type: String,
    default: "Enregistrer",
  },
});

const emit = defineEmits(["save-activity", "cancel"]);

const form = reactive({
  title: props.initialActivity?.title || "",
  type: props.initialActivity?.type || "CLUB",
  organization: props.initialActivity?.organization || "",
  date: props.initialActivity?.date || props.initialActivity?.startDate || "",
  duration: props.initialActivity?.duration || "",
  location: props.initialActivity?.location || "",
  description: props.initialActivity?.description || "",
  certificate: props.initialActivity?.certificate || null,
  certificateName: props.initialActivity?.certificateName || "",
  certificateUrl: props.initialActivity?.certificateUrl || "",
});

watch(
  () => props.initialActivity,
  (activity) => {
    form.title = activity?.title || "";
    form.type = activity?.type || "CLUB";
    form.organization = activity?.organization || "";
    form.date = activity?.date || activity?.startDate || "";
    form.duration = activity?.duration || "";
    form.location = activity?.location || "";
    form.description = activity?.description || "";
    form.certificate = activity?.certificate || null;
    form.certificateName = activity?.certificateName || "";
    form.certificateUrl = activity?.certificateUrl || "";
  },
);

const handleCertificateUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  form.certificate = file;
  form.certificateName = file.name;
  form.certificateUrl = URL.createObjectURL(file);
};

const resetForm = () => {
  form.title = "";
  form.type = "CLUB";
  form.organization = "";
  form.date = "";
  form.duration = "";
  form.location = "";
  form.description = "";
  form.certificate = null;
  form.certificateName = "";
  form.certificateUrl = "";
};

const submitForm = () => {
  emit("save-activity", {
    title: form.title,
    type: form.type,
    organization: form.organization,
    date: form.date,
    duration: form.duration,
    location: form.location,
    description: form.description,
    certificate: form.certificate,
    certificateName: form.certificateName,
    certificateUrl: form.certificateUrl,
  })

  resetForm();
};
</script>

<template>
  <form class="activity-form" @submit.prevent="submitForm">
    <section class="form-card">

      <div class="form-grid">
        <div class="form-group">
          <label>Titre de l’activité</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Ex : Hackathon ENSA"
          />
        </div>

        <div class="form-group">
          <label>Type</label>
          <select v-model="form.type" required>
            <option value="CLUB">Club</option>
            <option value="EVENT">Événement</option>
            <option value="VOLUNTEERING">Bénévolat</option>
            <option value="COMPETITION">Compétition</option>
            <option value="TRAINING">Formation</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>

        <div class="form-group">
          <label>Organisme / Club</label>
          <input
            v-model="form.organization"
            type="text"
            required
            placeholder="Ex : Club Informatique"
          />
        </div>

        <div class="form-group">
          <label>Date</label>
          <input v-model="form.date" type="date" required />
        </div>

        <div class="form-group">
          <label>Durée</label>
          <input
            v-model="form.duration"
            type="text"
            required
            placeholder="Ex : 2 jours"
          />
        </div>

        <div class="form-group">
          <label>Lieu</label>
          <input
            v-model="form.location"
            type="text"
            required
            placeholder="Ex : Casablanca"
          />
        </div>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea
          v-model="form.description"
          required
          placeholder="Décrivez votre participation..."
        ></textarea>
      </div>

      <label class="upload-box">
        <span class="material-icons-round">upload_file</span>
        <strong>Ajouter une attestation</strong>
        <small>PDF, PNG ou JPG</small>

        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          @change="handleCertificateUpload"
        />
      </label>

      <p v-if="form.certificateName" class="file-info">
        {{ form.certificateName }}
      </p>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="emit('cancel')">
          Annuler
        </button>

        <button type="submit" class="btn btn-primary">
          <span class="material-icons-round">save</span>
          {{ submitLabel }}
        </button>
      </div>
    </section>
  </form>
</template>

<style scoped>
.activity-form {
  margin-bottom: 1rem;
}

.form-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.875rem;
  padding: 1.25rem;
}

.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28363d;
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

h2 .material-icons-round {
  color: #2f575d;
  font-size: 1.2rem;
}

.form-header p {
  color: #6d9197;
  font-size: 0.875rem;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.95rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  display: block;
  color: #2f575d;
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #c4cdc1;
  border-radius: 0.7rem;
  background: #f8f9f8;
  color: #28363d;
  font-size: 0.93rem;
  outline: none;
}

input,
select {
  height: 2.75rem;
  padding: 0 0.95rem;
}

textarea {
  min-height: 7rem;
  padding: 0.85rem 0.95rem;
  line-height: 1.7;
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2f575d;
  background: #ffffff;
  box-shadow: 0 0 0 0.18rem rgba(47, 87, 93, 0.08);
}

.upload-box {
  min-height: 8rem;
  border: 1.5px dashed #c4cdc1;
  border-radius: 0.875rem;
  background: #f8f9f8;
  color: #6d9197;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  text-align: center;
  cursor: pointer;
  padding: 1rem;
}

.upload-box:hover {
  background: #ffffff;
  border-color: #2f575d;
}

.upload-box .material-icons-round {
  color: #2f575d;
  font-size: 1.9rem;
}

.upload-box strong {
  color: #2f575d;
  font-size: 0.92rem;
}

.upload-box small {
  color: #8ba0a3;
  font-size: 0.78rem;
}

.upload-box input {
  display: none;
}

.file-info {
  margin: 0.75rem 0 0;
  color: #6d9197;
  font-size: 0.85rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.85rem;
  padding: 0 1.35rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: #2f575d;
  color: #ffffff;
  border-color: #2f575d;
}

.btn-primary .material-icons-round {
  color: #ffffff;
  font-size: 1.1rem;
}

.btn-primary:hover {
  background: #26494d;
}

.btn-secondary {
  background: #ffffff;
  color: #2f575d;
  border-color: #c4cdc1;
}

.btn-secondary:hover {
  background: #f8f9f8;
}

@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
