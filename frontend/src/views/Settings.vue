<script setup>
import { onMounted, ref } from "vue";
import api from "@/services/api";

const loading = ref(false);
const saving = ref(false);
const message = ref("");
const error = ref("");
const preferencesText = ref("{}");

const loadPreferences = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/settings/preferences");
    preferencesText.value = JSON.stringify(response.data?.data || {}, null, 2);
  } catch {
    error.value = "Impossible de charger les parametres.";
  } finally {
    loading.value = false;
  }
};

const savePreferences = async () => {
  saving.value = true;
  message.value = "";
  error.value = "";

  try {
    const payload = JSON.parse(preferencesText.value || "{}");
    const response = await api.patch("/settings/preferences", payload);
    preferencesText.value = JSON.stringify(response.data?.data || {}, null, 2);
    message.value = "Parametres enregistres.";
  } catch (err) {
    error.value =
      err instanceof SyntaxError
        ? "Le JSON n'est pas valide."
        : "Impossible d'enregistrer les parametres.";
  } finally {
    saving.value = false;
  }
};

onMounted(loadPreferences);
</script>

<template>
  <section class="settings-page">
    <h1>Parametres</h1>

    <p v-if="loading" class="state">Chargement...</p>
    <p v-if="message" class="state success">{{ message }}</p>
    <p v-if="error" class="state error">{{ error }}</p>

    <form class="settings-form" @submit.prevent="savePreferences">
      <label for="preferences">Preferences</label>
      <textarea
        id="preferences"
        v-model="preferencesText"
        rows="16"
        spellcheck="false"
      />

      <button type="submit" :disabled="saving">
        {{ saving ? "Enregistrement..." : "Enregistrer" }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.settings-page {
  padding: 32px;
}

.settings-page h1 {
  margin: 0 0 24px;
  color: #122033;
  font-size: 28px;
}

.settings-form {
  display: grid;
  gap: 12px;
  max-width: 760px;
}

.settings-form label {
  color: #1e293b;
  font-weight: 700;
}

.settings-form textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: Consolas, monospace;
  font-size: 14px;
  resize: vertical;
}

.settings-form button {
  justify-self: start;
  padding: 10px 16px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #2563eb;
  font-weight: 700;
  cursor: pointer;
}

.settings-form button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.state {
  color: #64748b;
}

.success {
  color: #15803d;
}

.error {
  color: #dc2626;
}

@media (max-width: 640px) {
  .settings-page {
    padding: 20px;
  }
}
</style>
