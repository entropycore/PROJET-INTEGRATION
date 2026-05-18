<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import AppLogo from "../AppLogo.vue";
import "../../assets/styles/topbar.css";
import notificationIcon from "../../assets/icons/notification.svg";

const authStore = useAuthStore();

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
        {{ avatarLetter }}
      </RouterLink>
    </div>
  </header>
</template>
