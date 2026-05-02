<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLogo from '../components/AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const dashboardMap = {
  ADMINISTRATOR: '/admin',
  STUDENT: '/student',
  PROFESSOR: '/professor',
  PROFESSIONAL: '/professional',
}

const homePath = computed(() => dashboardMap[authStore.user?.role] || '/login')
const homeLabel = computed(() =>
  authStore.isAuthenticated ? 'Aller à mon espace' : 'Se connecter'
)

const goBack = () => router.back()
const goHome = () => router.push(homePath.value)
</script>

<template>
  <main class="forbidden-page">
    <section class="forbidden-panel" aria-labelledby="forbidden-title">
      <div class="brand-row">
        <AppLogo />
      </div>

      <span class="status-badge">Erreur 403</span>

      <h1 id="forbidden-title">Accès refusé</h1>

      <p class="forbidden-message">
        Votre compte est bien reconnu, mais cette page appartient à un espace
        auquel votre rôle ne donne pas accès.
      </p>

      <div class="forbidden-actions">
        <button class="secondary-button" type="button" @click="goBack">
          Retour
        </button>

        <button class="primary-button" type="button" @click="goHome">
          {{ homeLabel }}
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.forbidden-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(47, 90, 96, 0.16), transparent 34%),
    linear-gradient(135deg, #f5f5f0, #ece9df);
}

.forbidden-panel {
  width: min(100%, 560px);
  padding: 44px;
  border: 1px solid #ded8cf;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 28px 70px rgba(36, 54, 58, 0.16);
  animation: fade-up 0.35s ease;
}

.brand-row {
  margin-bottom: 34px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 13px;
  border-radius: 999px;
  background: #f8e7e3;
  color: #9f2f24;
  font-size: 0.86rem;
  font-weight: 700;
}

h1 {
  margin: 18px 0 14px;
  color: #24363a;
  font-size: clamp(2.2rem, 4vw, 2.85rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.forbidden-message {
  max-width: 455px;
  color: #656b68;
  font-size: 1.02rem;
  line-height: 1.7;
}

.forbidden-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

button {
  min-height: 48px;
  border-radius: 10px;
  padding: 0 20px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

.primary-button {
  border: 1px solid #2f5a60;
  background: #2f5a60;
  color: white;
}

.primary-button:hover {
  background: #204a52;
}

.secondary-button {
  border: 1px solid #d2c8bb;
  background: white;
  color: #24363a;
}

.secondary-button:hover {
  border-color: #2f5a60;
  color: #2f5a60;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .forbidden-page {
    padding: 20px;
  }

  .forbidden-panel {
    padding: 30px 22px;
  }

  .forbidden-actions {
    flex-direction: column-reverse;
  }

  button {
    width: 100%;
  }
}
</style>