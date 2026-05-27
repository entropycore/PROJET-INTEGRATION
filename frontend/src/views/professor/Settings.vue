<script setup>
import { onMounted, ref } from "vue";

import {
  getProfessorProfile,
  getProfessorSettings,
  sendProfessorPasswordReset,
  updateProfessorNotifications,
  updateProfessorPassword,
  updateProfessorPrivacy,
} from "@/services/professorApi";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const isLoading = ref(true);
const loadingPassword = ref(false);
const loadingReset = ref(false);
const loadingPrivacy = ref(false);
const loadingNotifications = ref(false);

const accountEmail = ref("");
const passwordMsg = ref({ type: "", text: "" });
const resetMsg = ref({ type: "", text: "" });
const privacyMsg = ref({ type: "", text: "" });
const notificationMsg = ref({ type: "", text: "" });

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const privacyForm = ref({
  profileVisibility: "PUBLIC",
  showEmail: true,
  showPhone: false,
});

const notificationForm = ref({
  email: true,
  push: false,
  validationAssignments: true,
  validationUpdates: true,
  weeklyDigest: false,
});

const setMsg = (msgRef, type, text) => {
  msgRef.value = { type, text };
  window.setTimeout(() => {
    msgRef.value = { type: "", text: "" };
  }, 4500);
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const loadSettings = async () => {
  isLoading.value = true;

  try {
    const [profile, settings] = await Promise.all([
      getProfessorProfile(),
      getProfessorSettings(),
    ]);

    accountEmail.value = profile?.user?.email || authStore.user?.email || "";

    privacyForm.value = {
      profileVisibility: settings?.privacy?.profileVisibility || "PUBLIC",
      showEmail: settings?.privacy?.showEmail ?? true,
      showPhone: settings?.privacy?.showPhone ?? false,
    };

    notificationForm.value = {
      email: settings?.notifications?.email ?? true,
      push: settings?.notifications?.push ?? false,
      validationAssignments:
        settings?.notifications?.validationAssignments ?? true,
      validationUpdates: settings?.notifications?.validationUpdates ?? true,
      weeklyDigest: settings?.notifications?.weeklyDigest ?? false,
    };
  } catch (error) {
    setMsg(
      privacyMsg,
      "error",
      getErrorMessage(error, "Impossible de charger les paramètres."),
    );
  } finally {
    isLoading.value = false;
  }
};

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  showCurrent.value = false;
  showNew.value = false;
  showConfirm.value = false;
};

const savePassword = async () => {
  if (!passwordForm.value.currentPassword) {
    setMsg(passwordMsg, "error", "Veuillez entrer le mot de passe actuel.");
    return;
  }

  if (passwordForm.value.newPassword.length < 8) {
    setMsg(
      passwordMsg,
      "error",
      "Le nouveau mot de passe doit contenir au moins 8 caractères.",
    );
    return;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    setMsg(passwordMsg, "error", "Les mots de passe ne correspondent pas.");
    return;
  }

  loadingPassword.value = true;

  try {
    await updateProfessorPassword(passwordForm.value);
    resetPasswordForm();
    setMsg(
      passwordMsg,
      "success",
      "Mot de passe mis à jour. Les sessions ouvertes ont été révoquées.",
    );
  } catch (error) {
    setMsg(
      passwordMsg,
      "error",
      getErrorMessage(error, "Impossible de mettre à jour le mot de passe."),
    );
  } finally {
    loadingPassword.value = false;
  }
};

const sendResetLink = async () => {
  if (!accountEmail.value) return;

  loadingReset.value = true;

  try {
    await sendProfessorPasswordReset(accountEmail.value);
    setMsg(
      resetMsg,
      "success",
      "Un lien de réinitialisation a été envoyé à votre adresse email.",
    );
  } catch (error) {
    setMsg(
      resetMsg,
      "error",
      getErrorMessage(
        error,
        "Impossible d'envoyer le lien de réinitialisation.",
      ),
    );
  } finally {
    loadingReset.value = false;
  }
};

const savePrivacy = async () => {
  loadingPrivacy.value = true;

  try {
    await updateProfessorPrivacy(privacyForm.value);
    setMsg(privacyMsg, "success", "Confidentialité mise à jour.");
  } catch (error) {
    setMsg(
      privacyMsg,
      "error",
      getErrorMessage(error, "Impossible de mettre à jour la confidentialité."),
    );
  } finally {
    loadingPrivacy.value = false;
  }
};

const saveNotifications = async () => {
  loadingNotifications.value = true;

  try {
    await updateProfessorNotifications(notificationForm.value);
    setMsg(notificationMsg, "success", "Notifications mises à jour.");
  } catch (error) {
    setMsg(
      notificationMsg,
      "error",
      getErrorMessage(error, "Impossible de mettre à jour les notifications."),
    );
  } finally {
    loadingNotifications.value = false;
  }
};

onMounted(loadSettings);
</script>

<template>
  <section class="professor-settings-page">
    <header class="page-header">
      <div>
        <span>ESPACE PROFESSEUR</span>
        <h1>Paramètres</h1>
        <p>Gérez la sécurité, la confidentialité et les notifications.</p>
      </div>
    </header>

    <div v-if="isLoading" class="state-card">Chargement des paramètres...</div>

    <template v-else>
      <div class="settings-grid">
        <section class="settings-panel wide">
          <h2>Sécurité du compte</h2>

          <p
            v-if="passwordMsg.text"
            :class="
              passwordMsg.type === 'error' ? 'error-text' : 'success-text'
            "
          >
            {{ passwordMsg.text }}
          </p>

          <div class="form-grid">
            <label>
              <span>Mot de passe actuel</span>
              <div class="password-field">
                <input
                  v-model="passwordForm.currentPassword"
                  :type="showCurrent ? 'text' : 'password'"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  :aria-label="
                    showCurrent
                      ? 'Masquer le mot de passe actuel'
                      : 'Afficher le mot de passe actuel'
                  "
                  @click="showCurrent = !showCurrent"
                >
                  <span class="material-icons-round">
                    {{ showCurrent ? "visibility_off" : "visibility" }}
                  </span>
                </button>
              </div>
            </label>
            <label>
              <span>Nouveau mot de passe</span>
              <div class="password-field">
                <input
                  v-model="passwordForm.newPassword"
                  :type="showNew ? 'text' : 'password'"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  :aria-label="
                    showNew
                      ? 'Masquer le nouveau mot de passe'
                      : 'Afficher le nouveau mot de passe'
                  "
                  @click="showNew = !showNew"
                >
                  <span class="material-icons-round">
                    {{ showNew ? "visibility_off" : "visibility" }}
                  </span>
                </button>
              </div>
            </label>
            <label>
              <span>Confirmation</span>
              <div class="password-field">
                <input
                  v-model="passwordForm.confirmPassword"
                  :type="showConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  :aria-label="
                    showConfirm
                      ? 'Masquer la confirmation'
                      : 'Afficher la confirmation'
                  "
                  @click="showConfirm = !showConfirm"
                >
                  <span class="material-icons-round">
                    {{ showConfirm ? "visibility_off" : "visibility" }}
                  </span>
                </button>
              </div>
            </label>
          </div>

          <button
            type="button"
            class="primary-btn"
            :disabled="loadingPassword"
            @click="savePassword"
          >
            <span class="material-icons-round">lock_reset</span>
            {{ loadingPassword ? "Mise à jour..." : "Changer le mot de passe" }}
          </button>
        </section>

        <section class="settings-panel compact">
          <div>
            <h2>Réinitialisation par email</h2>
            <p>{{ accountEmail || "Email du compte non disponible" }}</p>
          </div>

          <p
            v-if="resetMsg.text"
            :class="resetMsg.type === 'error' ? 'error-text' : 'success-text'"
          >
            {{ resetMsg.text }}
          </p>

          <button
            type="button"
            class="secondary-btn"
            :disabled="loadingReset || !accountEmail"
            @click="sendResetLink"
          >
            <span class="material-icons-round">mail</span>
            {{ loadingReset ? "Envoi..." : "Envoyer un lien" }}
          </button>
        </section>

        <section class="settings-panel">
          <h2>Confidentialité</h2>

          <p
            v-if="privacyMsg.text"
            :class="privacyMsg.type === 'error' ? 'error-text' : 'success-text'"
          >
            {{ privacyMsg.text }}
          </p>

          <div class="segmented-control">
            <button
              type="button"
              :class="{ active: privacyForm.profileVisibility === 'PUBLIC' }"
              @click="privacyForm.profileVisibility = 'PUBLIC'"
            >
              Public
            </button>
            <button
              type="button"
              :class="{
                active: privacyForm.profileVisibility === 'CONNECTIONS',
              }"
              @click="privacyForm.profileVisibility = 'CONNECTIONS'"
            >
              Connexions
            </button>
            <button
              type="button"
              :class="{ active: privacyForm.profileVisibility === 'PRIVATE' }"
              @click="privacyForm.profileVisibility = 'PRIVATE'"
            >
              Privé
            </button>
          </div>

          <label class="toggle-row">
            <span>Afficher l'email</span>
            <input v-model="privacyForm.showEmail" type="checkbox" />
          </label>

          <label class="toggle-row">
            <span>Afficher le téléphone</span>
            <input v-model="privacyForm.showPhone" type="checkbox" />
          </label>

          <button
            type="button"
            class="primary-btn"
            :disabled="loadingPrivacy"
            @click="savePrivacy"
          >
            {{ loadingPrivacy ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </section>

        <section class="settings-panel">
          <h2>Notifications</h2>

          <p
            v-if="notificationMsg.text"
            :class="
              notificationMsg.type === 'error' ? 'error-text' : 'success-text'
            "
          >
            {{ notificationMsg.text }}
          </p>

          <label class="toggle-row">
            <span>Notifications par email</span>
            <input v-model="notificationForm.email" type="checkbox" />
          </label>

          <label class="toggle-row">
            <span>Notifications navigateur</span>
            <input v-model="notificationForm.push" type="checkbox" />
          </label>

          <label class="toggle-row">
            <span>Nouvelles validations assignées</span>
            <input
              v-model="notificationForm.validationAssignments"
              type="checkbox"
            />
          </label>

          <label class="toggle-row">
            <span>Mises à jour de validation</span>
            <input
              v-model="notificationForm.validationUpdates"
              type="checkbox"
            />
          </label>

          <label class="toggle-row">
            <span>Résumé hebdomadaire</span>
            <input v-model="notificationForm.weeklyDigest" type="checkbox" />
          </label>

          <button
            type="button"
            class="primary-btn"
            :disabled="loadingNotifications"
            @click="saveNotifications"
          >
            {{ loadingNotifications ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.professor-settings-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--app-text);
}

.page-header span {
  display: block;
  color: var(--app-subtle);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}

.page-header h1 {
  margin: 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.8rem, 2.4vw, 2.3rem);
  font-weight: 500;
}

.page-header p {
  margin: 0.45rem 0 0;
  color: var(--app-muted);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.settings-panel,
.state-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
  padding: 1.15rem;
}

.settings-panel.wide,
.settings-panel.compact {
  grid-column: 1 / -1;
}

.settings-panel.compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.settings-panel h2 {
  margin: 0 0 1rem;
  color: var(--app-heading);
  font-size: var(--app-text-lg);
}

.settings-panel.compact h2 {
  margin-bottom: 0.25rem;
}

.settings-panel.compact p {
  margin: 0;
  color: var(--app-muted);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-grid label {
  display: grid;
  gap: 0.4rem;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.password-field {
  display: grid;
  grid-template-columns: 1fr 2.7rem;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
  overflow: hidden;
}

.password-field input {
  min-width: 0;
  border: 0;
  background: var(--app-surface);
  color: var(--app-text);
  font: inherit;
  padding: 0 0.85rem;
  outline: none;
}

.password-field button {
  display: grid;
  place-items: center;
  border: 0;
  border-left: 1px solid var(--app-border);
  background: var(--app-surface-soft);
  color: var(--app-muted);
  cursor: pointer;
}

.segmented-control {
  display: inline-flex;
  gap: 0.3rem;
  padding: 0.25rem;
  margin-bottom: 1rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.segmented-control button {
  min-height: 2.25rem;
  border: 0;
  border-radius: var(--app-radius-sm);
  background: transparent;
  color: var(--app-muted);
  font-weight: 800;
  padding: 0 0.85rem;
  cursor: pointer;
}

.segmented-control button.active {
  background: var(--app-primary);
  color: #ffffff;
}

.toggle-row {
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--app-border);
  color: var(--app-heading);
  font-weight: 700;
}

.toggle-row input {
  position: relative;
  width: 2.45rem;
  height: 1.35rem;
  appearance: none;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-pill);
  background: var(--app-surface-soft);
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.toggle-row input::before {
  content: "";
  position: absolute;
  top: 0.14rem;
  left: 0.14rem;
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 50%;
  background: var(--app-muted);
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.toggle-row input:checked {
  border-color: var(--app-primary);
  background: var(--app-active-bg);
}

.toggle-row input:checked::before {
  background: var(--app-primary);
  transform: translateX(1.1rem);
}

.toggle-row input:focus-visible {
  outline: 3px solid var(--app-active-bg);
  outline-offset: 2px;
}

.primary-btn,
.secondary-btn {
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: var(--app-radius-md);
  padding: 0 1rem;
  font-weight: 800;
  cursor: pointer;
}

.primary-btn {
  border: 1px solid var(--app-primary);
  background: var(--app-primary);
  color: #ffffff;
}

.secondary-btn {
  border: 1px solid var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-primary);
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.success-text,
.error-text {
  border-radius: var(--app-radius-md);
  padding: 0.8rem 1rem;
  font-size: var(--app-text-sm);
}

.success-text {
  background: #ecfdf3;
  color: #26734d;
}

.error-text {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.state-card {
  color: var(--app-muted);
}

@media (max-width: 860px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .settings-panel.compact {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>
