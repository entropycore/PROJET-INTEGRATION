<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="stats-grid">
    <article class="stat-card">
      <span>Total</span>
      <strong>{{ stats.total }}</strong>
    </article>

    <article class="stat-card">
      <span>En attente</span>
      <strong>{{ stats.pending }}</strong>
    </article>

    <article class="stat-card">
      <span>Traites</span>
      <strong>{{ stats.resolved }}</strong>
    </article>

    <article class="stat-card">
      <span>Rejetes</span>
      <strong>{{ stats.rejected }}</strong>
    </article>
  </div>
</template>

<style scoped>
.stats-grid {
  width: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: clamp(1rem, 1.6vw, 1.4rem);
}

.stat-card {
  position: relative;
  min-height: 5.8rem;
  padding: 1rem 1.35rem 0.95rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 0.8rem;
  box-shadow: var(--app-shadow-card);
  font-family: var(--app-font-body);
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 0.18rem;
  background: var(--app-primary);
}

.stat-card span {
  display: block;
  color: var(--app-muted);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-card strong {
  display: block;
  margin-top: 0.75rem;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

@media (max-width: 68.75rem) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 43.75rem) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
