<script setup>
import { computed, ref, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter, useRoute } from "vue-router";
import { logout } from "../../services/authService";
import { sidebarConfig } from "../../config/sidebarConfig";
import { buildBackendUrl } from "../../services/backendUrl";

import "../../assets/styles/sidebar.css";

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-sidebar"]);

const authStore = useAuthStore();
const router = useRouter();
//pour les routes enfqnts de gestions utilisateurs
const route = useRoute();
const isChildActive = (child) => {
  return route.fullPath === child.path;
};

const user = computed(() => authStore.user);
const avatarFailed = ref(false);

const sections = computed(() => {
  return sidebarConfig[user.value?.role] || [];
});

const profilePath = computed(() => {
  const paths = {
    ADMINISTRATOR: "/admin/profile",
    STUDENT: "/student/profile",
    PROFESSOR: "/professor/profile",
    PROFESSIONAL: "/professional/profile",
  };

  return paths[user.value?.role] || "/profile";
});

const userDisplayName = computed(() => {
  const fullName = `${user.value?.firstName || ""} ${
    user.value?.lastName || ""
  }`.trim();

  return fullName || user.value?.email || "Utilisateur";
});

const userInitial = computed(() => {
  return user.value?.firstName?.charAt(0).toUpperCase() || "A";
});

const userProfilePicture = computed(() => user.value?.profilePicture || "");

const userProfilePictureUrl = computed(() => {
  if (!userProfilePicture.value || avatarFailed.value) return "";

  return buildBackendUrl(userProfilePicture.value);
});

watch(userProfilePicture, () => {
  avatarFailed.value = false;
});

const handleLogout = async () => {
  try {
    await logout();
  } catch (err) {
    console.error(err);
  }

  authStore.clearAuthSession();
  router.push("/login");
};
const openDropdown = ref(null);

const toggleDropdown = (label) => {
  openDropdown.value = openDropdown.value === label ? null : label;
};
</script>

<template>
  <aside :class="['sidebar', { 'sidebar-collapsed': collapsed }]">
    <div>
      <!-- USER -->
      <div class="sidebar-user">
        <RouterLink :to="profilePath" class="sidebar-user-profile">
          <img
            v-if="userProfilePictureUrl"
            :src="userProfilePictureUrl"
            alt="Photo de profil"
            class="sidebar-avatar-img"
            @error="avatarFailed = true"
          />
          <div v-else class="sidebar-avatar">{{ userInitial }}</div>

          <div class="sidebar-user-info">
            <h3>{{ userDisplayName }}</h3>
            <p>{{ user?.role }}</p>
          </div>
        </RouterLink>

        <button
          class="sidebar-collapse-btn"
          type="button"
          @click="emit('toggle-sidebar')"
        >
          <span class="material-icons-round sidebar-control-icon">
            {{ collapsed ? "menu_open" : "menu" }}
          </span>
        </button>
      </div>

      <!-- NAV -->
      <nav>
        <div v-for="section in sections" :key="section.section">
          <p class="sidebar-section">{{ section.section }}</p>

          <div v-for="item in section.items" :key="item.label">
            <button
              v-if="item.children"
              type="button"
              class="sidebar-link sidebar-dropdown-trigger"
              @click="toggleDropdown(item.label)"
            >
              <span class="sidebar-link-left">
                <span class="sidebar-icon material-icons-round">
                  {{ item.icon }}
                </span>
                <span class="sidebar-label">{{ item.label }}</span>
              </span>

              <span class="sidebar-chevron material-icons-round">
                {{ openDropdown === item.label ? "expand_less" : "expand_more" }}
              </span>
            </button>

            <div
              v-if="item.children && openDropdown === item.label"
              class="sidebar-submenu"
            >
              <RouterLink
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="sidebar-sublink"
                :class="{ 'sidebar-sublink-active': isChildActive(child) }"
              >
                <span class="sidebar-icon material-icons-round">
                  {{ child.icon }}
                </span>
                <span class="sidebar-label">{{ child.label }}</span>
              </RouterLink>
            </div>

            <RouterLink
              v-else-if="!item.children"
              :to="item.path"
              class="sidebar-link"
              active-class="sidebar-link-active"
              exact-active-class="sidebar-link-exact-active"
            >
              <span class="sidebar-icon material-icons-round">
                {{ item.icon }}
              </span>
              <span class="sidebar-label">{{ item.label }}</span>
            </RouterLink>
          </div>
        </div>
      </nav>
    </div>

    <!-- LOGOUT -->
    <button class="logout-btn" @click="handleLogout">
      <span class="sidebar-icon material-icons-round">logout</span>
      <span class="sidebar-label">Déconnexion</span>
    </button>
  </aside>
</template>
