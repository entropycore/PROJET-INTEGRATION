<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  value: {
    type: [String, Number],
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <article class="stat-card-ui" :aria-busy="loading">
    <template v-if="loading">
      <span class="skeleton skeleton-icon"></span>
      <div class="stat-card-content">
        <span class="skeleton skeleton-value"></span>
        <span class="skeleton skeleton-title"></span>
        <span class="skeleton skeleton-subtitle"></span>
      </div>
    </template>

    <template v-else>
      <span v-if="icon" class="stat-card-icon material-icons-round">
        {{ icon }}
      </span>
      <div class="stat-card-content">
        <strong class="stat-card-value">{{ value }}</strong>
        <h2 class="stat-card-title">{{ title }}</h2>
        <p v-if="subtitle" class="stat-card-subtitle">{{ subtitle }}</p>
      </div>
    </template>
  </article>
</template>

<style scoped>
.stat-card-ui {
  min-width: 0;
  min-height: 8.5rem;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 1.15rem;
  padding: 1.25rem 1.45rem;
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 1rem;
  box-shadow: 0 0.75rem 1.8rem rgba(47, 87, 93, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.stat-card-ui:hover {
  transform: translateY(-0.2rem);
  border-color: rgba(47, 87, 93, 0.35);
  box-shadow: 0 1rem 2rem rgba(47, 87, 93, 0.09);
}

.stat-card-icon {
  width: 3.6rem;
  height: 3.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgba(47, 87, 93, 0.12);
  color: #2f575d;
  font-size: 1.65rem;
  box-shadow: inset 0 0 0 1px rgba(47, 87, 93, 0.06);
}

.stat-card-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-card-title {
  order: 1;
  margin: 0 0 0.5rem;
  color: #2f575d;
  font-family: var(--app-font-body);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.2;
}

.stat-card-value {
  order: 2;
  margin: 0 0 0.35rem;
  color: #102a33;
  font-family: var(--app-font-display);
  font-size: clamp(2rem, 2.6vw, 2.7rem);
  font-weight: 50;
  line-height: 0.95;
}

.stat-card-subtitle {
  order: 3;
  margin: 0;
  color: #6d9197;
  font-size: 0.9rem;
  line-height: 1.4;
}

.skeleton {
  display: block;
  border-radius: 8px;
  background: linear-gradient(90deg, #edf0ef 25%, #f7f8f7 50%, #edf0ef 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.2s ease-in-out infinite;
}

.skeleton-icon {
  width: 3.6rem;
  height: 3.6rem;
  flex-shrink: 0;
  border-radius: 999px;
}

.skeleton-value {
  width: 35%;
  height: 2.25rem;
}

.skeleton-title {
  width: 62%;
  height: 1rem;
}

.skeleton-subtitle {
  width: 82%;
  height: 0.8rem;
}

@keyframes skeleton-loading {
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat-card-ui,
  .skeleton {
    transition: none;
    animation: none;
  }
}
</style>
