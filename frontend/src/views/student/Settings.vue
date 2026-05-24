<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";
import {
  updatePassword,
  updatePrivacy,
  updateNotifications,
} from "../../services/settingsService";

const loadingPassword = ref(false);
const loadingPrivacy = ref(false);
const loadingNotifs = ref(false);

// Messages par section
const passwordMsg = ref({ type: "", text: "" });
const privacyMsg  = ref({ type: "", text: "" });
const notifMsg    = ref({ type: "", text: "" });

// Afficher/masquer mot de passe
const showCurrent = ref(false);
const showNew     = ref(false);
const showConfirm = ref(false);

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const privacyForm = ref({
  profileVisibility: "PUBLIC",
  showEmail: false,
  showPhone: false,
});

const notifForm = ref({
  email: true,
  push: false,
  validationUpdates: true,
  recommendations: true,
});

// Chargement des préférences sauvegardées au démarrage
onMounted(async () => {
  try {
    const res = await api.get("/auth/me"); // route valide pour tous les rôles
    const prefs = res.data?.data?.preferences;
    if (prefs?.privacy) {
      privacyForm.value = {
        profileVisibility: prefs.privacy.profileVisibility ?? "PUBLIC",
        showEmail: prefs.privacy.showEmail ?? false,
        showPhone: prefs.privacy.showPhone ?? false,
      };
    }
    if (prefs?.notifications) {
      notifForm.value = {
        email: prefs.notifications.email ?? true,
        push: prefs.notifications.push ?? false,
        validationUpdates: prefs.notifications.validationUpdates ?? true,
        recommendations: prefs.notifications.recommendations ?? true,
      };
    }
  } catch {
    // garde les valeurs par défaut
  }
});

const setMsg = (msgRef, type, text) => {
  msgRef.value = { type, text };
  setTimeout(() => (msgRef.value = { type: "", text: "" }), 4000);
};

const PASSWORD_ERRORS = {
  CURRENT_PASSWORD_INVALID: "Le mot de passe actuel est incorrect.",
  NEW_PASSWORD_TOO_SHORT: "Le nouveau mot de passe est trop court (8 caractères min).",
  NEW_PASSWORD_SAME_AS_CURRENT: "Le nouveau mot de passe doit être différent de l'actuel.",
  PASSWORD_CONFIRMATION_MISMATCH: "Les mots de passe ne correspondent pas.",
};

const PRIVACY_ERRORS = {
  INVALID_PROFILE_VISIBILITY: "Valeur de visibilité invalide.",
  INVALID_PRIVACY_BOOLEAN_VALUE: "Valeur booléenne invalide.",
};

const NOTIF_ERRORS = {
  INVALID_NOTIFICATION_BOOLEAN_VALUE: "Valeur booléenne invalide.",
};

const getErrorMsg = (err, map, fallback) => {
  const code = err?.response?.data?.error?.code;
  return map[code] || fallback;
};

const savePassword = async () => {
  if (!passwordForm.value.currentPassword)
    return setMsg(passwordMsg, "error", "Veuillez entrer votre mot de passe actuel.");
  if (!passwordForm.value.newPassword)
    return setMsg(passwordMsg, "error", "Veuillez entrer un nouveau mot de passe.");
  if (passwordForm.value.newPassword.length < 8)
    return setMsg(passwordMsg, "error", "Le nouveau mot de passe doit contenir au moins 8 caractères.");
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword)
    return setMsg(passwordMsg, "error", "Les mots de passe ne correspondent pas.");

  loadingPassword.value = true;
  try {
    await updatePassword(passwordForm.value);
    passwordForm.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
    showCurrent.value = false;
    showNew.value = false;
    showConfirm.value = false;
    setMsg(passwordMsg, "success", "✓ Mot de passe mis à jour. Vos autres sessions ont été déconnectées.");
  } catch (err) {
    setMsg(passwordMsg, "error", getErrorMsg(err, PASSWORD_ERRORS, "Erreur lors de la mise à jour du mot de passe."));
  } finally {
    loadingPassword.value = false;
  }
};

const savePrivacy = async () => {
  loadingPrivacy.value = true;
  try {
    await updatePrivacy(privacyForm.value);
    setMsg(privacyMsg, "success", "✓ Préférences de confidentialité mises à jour.");
  } catch (err) {
    setMsg(privacyMsg, "error", getErrorMsg(err, PRIVACY_ERRORS, "Erreur lors de la mise à jour de la confidentialité."));
  } finally {
    loadingPrivacy.value = false;
  }
};

const saveNotifications = async () => {
  loadingNotifs.value = true;
  try {
    await updateNotifications(notifForm.value);
    setMsg(notifMsg, "success", "✓ Préférences de notifications mises à jour.");
  } catch (err) {
    setMsg(notifMsg, "error", getErrorMsg(err, NOTIF_ERRORS, "Erreur lors de la mise à jour des notifications."));
  } finally {
    loadingNotifs.value = false;
  }
};
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1>Paramètres</h1>
        <div class="sub">Confidentialité et sécurité du compte</div>
      </div>
    </div>

    <!-- Mot de passe -->
    <div class="content-card">
      <h3 class="card-title">Changer le mot de passe</h3>

      <transition name="fade">
        <p v-if="passwordMsg.text" :class="passwordMsg.type === 'error' ? 'error-msg' : 'success-msg'">
          {{ passwordMsg.text }}
        </p>
      </transition>

      <div class="form-group">
        <label>Mot de passe actuel</label>
        <div class="input-eye">
          <input
            v-model="passwordForm.currentPassword"
            :type="showCurrent ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="new-password"
          />
          <span class="material-icons-round eye-icon" @click="showCurrent = !showCurrent">
            {{ showCurrent ? 'visibility' : 'visibility_off' }}
          </span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <div class="input-eye">
            <input
              v-model="passwordForm.newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="new-password"
            />
            <span class="material-icons-round eye-icon" @click="showNew = !showNew">
              {{ showNew ? 'visibility' : 'visibility_off' }}
            </span>
          </div>
        </div>
        <div class="form-group">
          <label>Confirmer le mot de passe</label>
          <div class="input-eye">
            <input
              v-model="passwordForm.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="new-password"
            />
            <span class="material-icons-round eye-icon" @click="showConfirm = !showConfirm">
              {{ showConfirm ? 'visibility' : 'visibility_off' }}
            </span>
          </div>
        </div>
      </div>

      <button type="button" class="btn btn-primary btn-sm" @click="savePassword" :disabled="loadingPassword">
        <span class="material-icons-round">lock</span>
        {{ loadingPassword ? "Mise à jour..." : "Mettre à jour" }}
      </button>
    </div>

    <!-- Confidentialité -->
    <div class="content-card">
      <h3 class="card-title">Confidentialité</h3>

      <transition name="fade">
        <p v-if="privacyMsg.text" :class="privacyMsg.type === 'error' ? 'error-msg' : 'success-msg'">
          {{ privacyMsg.text }}
        </p>
      </transition>

      <div class="form-group">
        <label>Visibilité du profil</label>
        <div class="chips-row">
          <span class="filter-chip" :class="{ active: privacyForm.profileVisibility === 'PUBLIC' }" @click="privacyForm.profileVisibility = 'PUBLIC'">Public</span>
          <span class="filter-chip" :class="{ active: privacyForm.profileVisibility === 'PRIVATE' }" @click="privacyForm.profileVisibility = 'PRIVATE'">Privé</span>
          <span class="filter-chip" :class="{ active: privacyForm.profileVisibility === 'CONNECTIONS' }" @click="privacyForm.profileVisibility = 'CONNECTIONS'">Connexions uniquement</span>
        </div>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Afficher l'email</div>
          <div class="toggle-desc">Votre email sera visible sur votre profil public</div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="privacyForm.showEmail" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Afficher le téléphone</div>
          <div class="toggle-desc">Votre numéro sera visible sur votre profil public</div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="privacyForm.showPhone" />
          <span class="slider"></span>
        </label>
      </div>

      <button type="button" class="btn btn-primary btn-sm mt-16" @click="savePrivacy" :disabled="loadingPrivacy">
        <span class="material-icons-round">shield</span>
        {{ loadingPrivacy ? "Enregistrement..." : "Enregistrer" }}
      </button>
    </div>

    <!-- Notifications -->
    <div class="content-card">
      <h3 class="card-title">Notifications</h3>

      <transition name="fade">
        <p v-if="notifMsg.text" :class="notifMsg.type === 'error' ? 'error-msg' : 'success-msg'">
          {{ notifMsg.text }}
        </p>
      </transition>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Notifications par email</div>
          <div class="toggle-desc">Recevoir des emails pour les mises à jour importantes</div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="notifForm.email" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Notifications push</div>
          <div class="toggle-desc">Recevoir des notifications dans le navigateur</div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="notifForm.push" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Mises à jour de validation</div>
          <div class="toggle-desc">Être notifié quand un projet ou stage est validé</div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="notifForm.validationUpdates" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Recommandations</div>
          <div class="toggle-desc">Être notifié des nouvelles recommandations reçues</div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="notifForm.recommendations" />
          <span class="slider"></span>
        </label>
      </div>

      <button type="button" class="btn btn-primary btn-sm mt-16" @click="saveNotifications" :disabled="loadingNotifs">
        <span class="material-icons-round">notifications</span>
        {{ loadingNotifs ? "Enregistrement..." : "Enregistrer" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-page { font-family: "DM Sans", sans-serif; color: #28363d; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-family: "DM Serif Display", serif; font-size: 26px; font-weight: 400; color: #28363d; line-height: 1.2; }
.sub { font-size: 13px; color: #99aead; margin-top: 3px; font-style: italic; }
.content-card { background: #fff; border: 1px solid #dee1dd; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.card-title { font-size: 15px; color: #28363d; font-family: "DM Serif Display", serif; font-weight: 400; margin-bottom: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 12.5px; font-weight: 500; color: #6d9197; margin-bottom: 5px; }

/* Input avec icone oeil */
.input-eye { position: relative; }
.input-eye input { width: 100%; padding: 9px 38px 9px 12px; border: 1px solid #c4cdc1; border-radius: 8px; background: #fff; font-family: "DM Sans", sans-serif; font-size: 13.5px; color: #28363d; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.input-eye input:focus { border-color: #2f575d; }
.eye-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #99aead; cursor: pointer; user-select: none; transition: color 0.15s; }
.eye-icon:hover { color: #2f575d; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chips-row { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-chip { padding: 6px 14px; border-radius: 20px; border: 1px solid #c4cdc1; font-size: 12.5px; cursor: pointer; color: #6d9197; transition: all 0.15s; }
.filter-chip:hover { border-color: #6d9197; }
.filter-chip.active { background: #2f575d; color: #fff; border-color: #2f575d; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #dee1dd; }
.toggle-row:last-of-type { border-bottom: none; }
.toggle-label { font-size: 13.5px; font-weight: 500; color: #28363d; }
.toggle-desc { font-size: 12px; color: #99aead; margin-top: 2px; }
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #c4cdc1; border-radius: 24px; transition: 0.3s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.3s; }
.toggle input:checked + .slider { background: #2f575d; }
.toggle input:checked + .slider:before { transform: translateX(20px); }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-family: "DM Sans", sans-serif; font-size: 13.5px; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
.btn-primary { background: #2f575d; color: #fff; border-color: #2f575d; }
.btn-primary:hover:not(:disabled) { background: #245055; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-sm { padding: 6px 12px; font-size: 12.5px; }
.btn .material-icons-round { font-size: 16px; }
.mt-16 { margin-top: 16px; }

/* Messages */
.error-msg { color: #c0392b; background: #fdf2f2; border: 1px solid #f5c6cb; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
.success-msg { color: #2d6a4f; background: #f0faf4; border: 1px solid #b7dfc8; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }

/* Animation */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Bloquer le fond jaune du password manager */
.input-eye input:-webkit-autofill,
.input-eye input:-webkit-autofill:hover,
.input-eye input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px #fff inset;
  box-shadow: 0 0 0px 1000px #fff inset;
  -webkit-text-fill-color: #28363d;
}
</style>