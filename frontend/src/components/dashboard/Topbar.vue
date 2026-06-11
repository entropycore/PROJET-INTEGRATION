<script setup>
import { computed, ref, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import AppLogo from "../AppLogo.vue";
import { buildBackendUrl } from "../../services/backendUrl";
import "../../assets/styles/topbar.css";
import notificationIcon from "../../assets/icons/notification.svg";

const authStore = useAuthStore();
const avatarFailed = ref(false);

const roleBasePath = computed(() => {
  const map = {
    ADMINISTRATOR: "/admin",
    STUDENT: "/student",
    PROFESSOR: "/professor",
    PROFESSIONAL: "/professional",
  };

  return map[authStore.user?.role] || "";
});

const notificationPath = computed(() => `${roleBasePath.value}/notifications`);
const profilePath = computed(() => `${roleBasePath.value}/profile`);

const roleLabel = computed(() => {
  const map = {
    ADMINISTRATOR: "Administrateur",
    STUDENT: "Étudiant",
    PROFESSOR: "Professeur",
    PROFESSIONAL: "Professionnel",
  };

  return map[authStore.user?.role] || "";
});

const avatarLetter = computed(() => {
  return authStore.user?.firstName?.charAt(0)?.toUpperCase() || "A";
});

const profilePicture = computed(() => authStore.user?.profilePicture || "");

const avatarUrl = computed(() => {
  if (!profilePicture.value || avatarFailed.value) return "";

  return buildBackendUrl(profilePicture.value);
});

watch(profilePicture, () => {
  avatarFailed.value = false;
});
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <img
        src="../../assets/logo.png"
        alt="Logo Credencia"
        style="height: 37px"
      />
      <span class="logo-text">Cred<span>encia</span></span>
    </div>

    <div class="topbar-right">
      <span class="role">{{ roleLabel }}</span>

      <RouterLink :to="notificationPath" class="notification-link">
        <img :src="notificationIcon" />
      </RouterLink>

      <RouterLink :to="profilePath" class="avatar">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Photo de profil"
          class="avatar-img"
          @error="avatarFailed = true"
        />
        <span v-else>{{ avatarLetter }}</span>
      </RouterLink>
    </div>
  </header>
</template>
