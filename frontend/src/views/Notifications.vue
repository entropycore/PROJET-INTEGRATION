<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import NotificationToolbar from "@/components/notifications/NotificationToolbar.vue";
import NotificationsList from "@/components/notifications/NotificationsList.vue";
import {
  deleteNotif,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/services/notificationsApi";

const route = useRoute();
const baseApi = route.meta.baseApi;
const role = computed(() => route.meta.role || "STUDENT");

const ROLE_NOTIFICATION_UI = {
  ADMINISTRATOR: {
    label: "ADMINISTRATION",
    description: "Surveillez et gerez les alertes de votre plateforme",
  },
  STUDENT: {
    label: "ETUDIANT",
    description: "Consultez les alertes liees a votre espace etudiant",
  },
  PROFESSOR: {
    label: "PROFESSEUR",
    description: "Consultez vos validations et interactions academiques",
  },
  PROFESSIONAL: {
    label: "PROFESSIONNEL",
    description: "Consultez vos acces, recommandations et interactions",
  },
};

const notificationUi = computed(
  () => ROLE_NOTIFICATION_UI[role.value] || ROLE_NOTIFICATION_UI.STUDENT,
);

const notifications = ref([]);
const unreadCount = ref(0);
const loading = ref(false);
const error = ref(null);
const selectedType = ref("ALL");

const fetchData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await getNotifications(baseApi);
    notifications.value = data?.items || [];

    const unread = await getUnreadCount(baseApi);
    unreadCount.value = unread?.count || 0;
  } catch (e) {
    console.error(e);
    error.value = "Erreur chargement notifications";
  } finally {
    loading.value = false;
  }
};

const handleRead = async (notif) => {
  if (notif.read) return;

  try {
    await markAsRead(baseApi, notif.id);
    notif.read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  } catch (e) {
    console.error(e);
    error.value = "Erreur lors de la mise a jour de la notification";
  }
};

const handleReadAll = async () => {
  try {
    await markAllAsRead(baseApi);

    notifications.value = notifications.value.map((n) => ({
      ...n,
      read: true,
    }));

    unreadCount.value = 0;
  } catch (e) {
    console.error(e);
    error.value = "Erreur lors de la mise a jour des notifications";
  }
};

const handleDelete = async (id) => {
  try {
    await deleteNotif(baseApi, id);

    const deletedNotification = notifications.value.find((n) => n.id === id);
    notifications.value = notifications.value.filter((n) => n.id !== id);

    if (deletedNotification && !deletedNotification.read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  } catch (e) {
    console.error(e);
    error.value = "Erreur lors de la suppression de la notification";
  }
};

const filteredNotifications = computed(() => {
  if (selectedType.value === "ALL") {
    return notifications.value;
  }

  return notifications.value.filter(
    (notification) => notification.type === selectedType.value,
  );
});

onMounted(fetchData);
</script>

<template>
  <section class="notifications-page">
    <header class="page-header">
      <span>{{ notificationUi.label }}</span>
      <h1>Centre de Notifications</h1>
      <p>{{ notificationUi.description }}</p>
    </header>

    <NotificationToolbar
      :unread-count="unreadCount"
      v-model:selected-type="selectedType"
      @read-all="handleReadAll"
    />

    <div v-if="loading" class="state-box">Chargement...</div>

    <div v-else-if="error" class="state-box error">
      {{ error }}
    </div>

    <NotificationsList
      v-else
      :notifications="filteredNotifications"
      @read="handleRead"
      @delete="handleDelete"
    />
  </section>
</template>

<style scoped>
.notifications-page {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 1.6vw, 1.4rem);
  color: var(--app-text);
  font-family: var(--app-font-body);
}

.page-header span {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--app-subtle);
  font-size: 0.8rem;
  font-style: italic;
}

.page-header h1 {
  margin: 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.6rem, 2.2vw, 2.1rem);
  font-weight: 300;
  line-height: var(--app-leading-tight);
}

.page-header p {
  margin: 0.5rem 0 0;
  color: var(--app-muted);
  font-size: clamp(0.85rem, 1vw, 1rem);
}

.state-box {
  padding: 2rem;
  border-radius: var(--app-radius-panel);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  box-shadow: var(--app-shadow-card);
  color: var(--app-muted);
  font-family: var(--app-font-body);
  font-size: var(--app-text-md);
  text-align: center;
}

.error {
  color: var(--app-error);
}
</style>
