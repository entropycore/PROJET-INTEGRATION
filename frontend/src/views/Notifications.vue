<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

/*
BACKEND (a activer lorque api est pret )


import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotif,
} from "@/services/notificationsApi";

const route = useRoute();
const baseApi = route.meta.baseApi;

const fetchData = async () => {
  loading.value = true;

  try {
    const data = await getNotifications(baseApi);
    notifications.value = data.items;

    const unread = await getUnreadCount(baseApi);
    unreadCount.value = unread.count;
  } catch (e) {
    console.error(e);
    error.value = "Erreur chargement notifications";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
*/

import NotificationToolbar from "@/components/notifications/NotificationToolbar.vue";
import NotificationsList from "@/components/notifications/NotificationsList.vue";

/* FRONTEND (MOCK DATA) */

const notifications = ref([
  {
    id: 1,
    title: "Nouvelle demande professionnelle",
    message: "Sara Bensaid a demandé l'accès à la plateforme.",
    type: "INFO",
    read: false,
    createdAt: "2026-05-02T13:50:00.000Z",
  },
  {
    id: 2,
    title: "Validation en attente",
    message: "Une nouvelle attestation attend une validation.",
    type: "VALIDATION",
    read: true,
    createdAt: "2026-05-02T12:30:00.000Z",
  },
  {
    id: 3,
    title: "Nouveau signalement",
    message: "Un contenu a été signalé par un utilisateur.",
    type: "ALERT",
    read: false,
    createdAt: "2026-05-02T11:10:00.000Z",
  },
]);

const unreadCount = ref(
  notifications.value.filter((n) => !n.read).length
);

const loading = ref(false);
const error = ref(null);

/*ACTIONS (fonctionnent déjà)*/

const handleRead = async (notif) => {
  if (notif.read) return;

  // await markAsRead(baseApi, notif.id);

  notif.read = true;
  unreadCount.value--;
};

const handleReadAll = async () => {
  // await markAllAsRead(baseApi);

  notifications.value = notifications.value.map((n) => ({
    ...n,
    read: true,
  }));

  unreadCount.value = 0;
};

const handleDelete = async (id) => {
  // await deleteNotif(baseApi, id);

  notifications.value = notifications.value.filter((n) => n.id !== id);
};
</script>

<template>
  <section class="notifications-page">
    <header class="page-header">
      <span>ADMINISTRATION</span>
      <h1>Centre de Notifications</h1>
      <p>Surveillez et gérez les alertes de votre plateforme</p>
    </header>

    <NotificationToolbar
      :unread-count="unreadCount"
      @read-all="handleReadAll"
    />

    <div v-if="loading" class="state-box">
      Chargement...
    </div>

    <div v-else-if="error" class="state-box error">
      {{ error }}
    </div>

    <NotificationsList
      v-else
      :notifications="notifications"
      @read="handleRead"
      @delete="handleDelete"
    />
  </section>
</template>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-header span {
  display: block;
  margin-bottom: 6px;
  color: #8b8f8c;
  font-size: 0.8rem;
  font-style: italic;
  letter-spacing: 0.04em;
}

.page-header h1 {
  margin: 0;
  color: #0f2f3a;
  font-size: clamp(2rem, 3vw, 2.7rem);
  font-weight: 800;
  line-height: 1.1;
}

.page-header p {
  margin-top: 8px;
  color: #5f6f70;
  font-size: 1rem;
}

.state-box {
  padding: 20px;
  border-radius: 18px;
  background: #fbfaf7;
  border: 1px solid #e5e0d8;
  color: #6b7280;
}

.error {
  color: #dc2626;
}
</style>