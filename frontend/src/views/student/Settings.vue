<script setup>
import { ref } from "vue";

const successMessage = ref("");
const errorMessage = ref("");

// Mot de passe
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Confidentialité
const privacyForm = ref({
  profileVisibility: "PUBLIC",
  showEmail: false,
  showPhone: false,
});

// Notifications
const notifForm = ref({
  email: true,
  push: false,
  validationUpdates: true,
  recommendations: true,
});

const savePassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    return;
  }
  try {
    // await api.put('/settings/me/password', passwordForm.value)
    successMessage.value = "Mot de passe mis à jour.";
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  } catch {
    errorMessage.value = "Erreur lors de la mise à jour.";
  }
};

const savePrivacy = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  try {
    // await api.put('/api/student/settings/privacy', privacyForm.value)
    successMessage.value = "Préférences de confidentialité mises à jour.";
  } catch {
    errorMessage.value = "Erreur lors de la mise à jour.";
  }
};

const saveNotifications = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  try {
    // await api.put('/api/student/settings/notifications', notifForm.value)
    successMessage.value = "Préférences de notifications mises à jour.";
  } catch {
    errorMessage.value = "Erreur lors de la mise à jour.";
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

    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

    <!-- Mot de passe -->
    <div class="content-card">
      <h3 class="card-title">Changer le mot de passe</h3>
      <div class="form-group">
        <label>Mot de passe actuel</label>
        <input
          v-model="passwordForm.currentPassword"
          type="password"
          placeholder="••••••••"
        />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="••••••••"
          />
        </div>
        <div class="form-group">
          <label>Confirmer le mot de passe</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button class="btn btn-primary btn-sm" @click="savePassword">
        <span class="material-icons-round">lock</span>
        Mettre à jour
      </button>
    </div>

    <!-- Confidentialité -->
    <div class="content-card">
      <h3 class="card-title">Confidentialité</h3>

      <div class="form-group">
        <label>Visibilité du profil</label>
        <div class="chips-row">
          <span
            class="filter-chip"
            :class="{ active: privacyForm.profileVisibility === 'PUBLIC' }"
            @click="privacyForm.profileVisibility = 'PUBLIC'"
            >Public</span
          >
          <span
            class="filter-chip"
            :class="{ active: privacyForm.profileVisibility === 'PRIVATE' }"
            @click="privacyForm.profileVisibility = 'PRIVATE'"
            >Privé</span
          >
          <span
            class="filter-chip"
            :class="{ active: privacyForm.profileVisibility === 'CONNECTIONS' }"
            @click="privacyForm.profileVisibility = 'CONNECTIONS'"
            >Connexions uniquement</span
          >
        </div>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Afficher l'email</div>
          <div class="toggle-desc">
            Votre email sera visible sur votre profil public
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="privacyForm.showEmail" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Afficher le téléphone</div>
          <div class="toggle-desc">
            Votre numéro sera visible sur votre profil public
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="privacyForm.showPhone" />
          <span class="slider"></span>
        </label>
      </div>

      <button class="btn btn-primary btn-sm mt-16" @click="savePrivacy">
        <span class="material-icons-round">shield</span>
        Enregistrer
      </button>
    </div>

    <!-- Notifications -->
    <div class="content-card">
      <h3 class="card-title">Notifications</h3>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Notifications par email</div>
          <div class="toggle-desc">
            Recevoir des emails pour les mises à jour importantes
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="notifForm.email" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Notifications push</div>
          <div class="toggle-desc">
            Recevoir des notifications dans le navigateur
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="notifForm.push" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Mises à jour de validation</div>
          <div class="toggle-desc">
            Être notifié quand un projet ou stage est validé
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="notifForm.validationUpdates" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Recommandations</div>
          <div class="toggle-desc">
            Être notifié des nouvelles recommandations reçues
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="notifForm.recommendations" />
          <span class="slider"></span>
        </label>
      </div>

      <button class="btn btn-primary btn-sm mt-16" @click="saveNotifications">
        <span class="material-icons-round">notifications</span>
        Enregistrer
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  font-family: "DM Sans", sans-serif;
  color: #28363d;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-header h1 {
  font-family: "DM Serif Display", serif;
  font-size: 26px;
  font-weight: 400;
  color: #28363d;
  line-height: 1.2;
}
.sub {
  font-size: 13px;
  color: #99aead;
  margin-top: 3px;
  font-style: italic;
}

.content-card {
  background: #fff;
  border: 1px solid #dee1dd;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}
.card-title {
  font-size: 15px;
  color: #28363d;
  font-family: "DM Serif Display", serif;
  font-weight: 400;
  margin-bottom: 16px;
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
.form-group input {
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
.form-group input:focus {
  border-color: #2f575d;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #dee1dd;
}
.toggle-row:last-of-type {
  border-bottom: none;
}
.toggle-label {
  font-size: 13.5px;
  font-weight: 500;
  color: #28363d;
}
.toggle-desc {
  font-size: 12px;
  color: #99aead;
  margin-top: 2px;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}
.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #c4cdc1;
  border-radius: 24px;
  transition: 0.3s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}
.toggle input:checked + .slider {
  background: #2f575d;
}
.toggle input:checked + .slider:before {
  transform: translateX(20px);
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
.btn-sm {
  padding: 6px 12px;
  font-size: 12.5px;
}
.btn .material-icons-round {
  font-size: 16px;
}

.mt-16 {
  margin-top: 16px;
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
</style>
