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

// Plus tard, quand professor est prêt const MOCK_API_ROLES = ["PROFESSIONAL"];
// Quand tout est prêt const MOCK_API_ROLES = [];

const MOCK_API_ROLES = ["PROFESSOR", "PROFESSIONAL"];

const ROLE_NOTIFICATION_UI = {
  ADMINISTRATOR: {
    label: "ADMINISTRATION",
    description: "Surveillez et gérez les alertes de votre plateforme",
  },
  STUDENT: {
    label: "ÉTUDIANT",
    description: "Consultez les alertes liées à votre espace étudiant",
  },
  PROFESSOR: {
    label: "PROFESSEUR",
    description: "Consultez vos validations et interactions académiques",
  },
  PROFESSIONAL: {
    label: "PROFESSIONNEL",
    description: "Consultez vos accès, recommandations et interactions",
  },
};

const notificationUi = computed(
  () => ROLE_NOTIFICATION_UI[role.value] || ROLE_NOTIFICATION_UI.STUDENT,
);

const useMockNotifications = computed(() => MOCK_API_ROLES.includes(role.value));

const notifications = ref([]);
const unreadCount = ref(0);
const loading = ref(false);
const error = ref(null);
const selectedType = ref("ALL");

const mockNotificationsByRole = {
  PROFESSOR: [
    {
      id: "prof-1",
      type: "RECOMMENDATION_REQUEST",
      title: "Nouvelle demande de recommandation",
      message: "Un étudiant vous a envoyé une demande de recommandation.",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "prof-2",
      type: "ACADEMIC_INTERACTION",
      title: "Interaction académique",
      message: "Une interaction académique nécessite votre attention.",
      read: true,
      createdAt: new Date().toISOString(),
    },
  ],

  PROFESSIONAL: [
    {
      id: "pro-1",
      type: "ACCESS_REQUEST_APPROVED",
      title: "Accès professionnel validé",
      message: "Votre accès professionnel à la plateforme a été validé.",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "pro-2",
      type: "PORTFOLIO_INTERACTION",
      title: "Interaction portfolio",
      message: "Un étudiant a partagé son portfolio avec vous.",
      read: true,
      createdAt: new Date().toISOString(),
    },
  ],
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (useMockNotifications.value) {
      const mockNotifications = mockNotificationsByRole[role.value] || [];

      notifications.value = mockNotifications;
      unreadCount.value = mockNotifications.filter((n) => !n.read).length;
      return;
    }

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
    if (!useMockNotifications.value) {
      await markAsRead(baseApi, notif.id);
    }

    notif.read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  } catch (e) {
    console.error(e);
    error.value = "Erreur lors de la mise à jour de la notification";
  }
};

const handleReadAll = async () => {
  try {
    if (!useMockNotifications.value) {
      await markAllAsRead(baseApi);
    }

    notifications.value = notifications.value.map((n) => ({
      ...n,
      read: true,
    }));

    unreadCount.value = 0;
  } catch (e) {
    console.error(e);
    error.value = "Erreur lors de la mise à jour des notifications";
  }
};

const handleDelete = async (id) => {
  try {
    if (!useMockNotifications.value) {
      await deleteNotif(baseApi, id);
    }

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
