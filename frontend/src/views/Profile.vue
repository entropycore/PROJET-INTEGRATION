<script setup>
import { computed, onMounted, ref } from "vue";
import { getMe } from "@/services/authService";
import { useAuthStore } from "@/stores/auth";
import { buildBackendUrl } from "@/services/backendUrl";

const authStore = useAuthStore();
const loading = ref(false);
const error = ref("");

const user = computed(() => authStore.user || {});

const loadProfile = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await getMe();
    authStore.setAuthSession(response.data?.data);
  } catch {
    error.value = "Impossible de charger le profil.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <section class="profile-page">
    <h1>Mon profil</h1>

    <p v-if="loading" class="state">Chargement...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>

    <div v-else class="profile-box">
      <img
        v-if="user.profilePicture"
        :src="buildBackendUrl(user.profilePicture)"
        alt=""
        class="avatar"
      />
      <div v-else class="avatar fallback">
        {{ user.firstName?.charAt(0).toUpperCase() || "U" }}
      </div>

      <div>
        <h2>{{ `${user.firstName || ""} ${user.lastName || ""}`.trim() }}</h2>
        <p>{{ user.email }}</p>
        <p>{{ user.role }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-page {
  padding: 32px;
}

.profile-page h1 {
  margin: 0 0 24px;
  color: #122033;
  font-size: 28px;
}

.profile-box {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar.fallback {
  display: grid;
  place-items: center;
  color: #ffffff;
  background: #2563eb;
  font-size: 24px;
  font-weight: 700;
}

.profile-box h2 {
  margin: 0 0 6px;
  color: #1e293b;
}

.profile-box p,
.state {
  margin: 0 0 4px;
  color: #64748b;
}

.error {
  color: #dc2626;
}

@media (max-width: 640px) {
  .profile-page {
    padding: 20px;
  }
}
</style>
