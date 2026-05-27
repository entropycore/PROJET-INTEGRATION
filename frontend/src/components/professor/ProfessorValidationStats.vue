<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="professor-stats-grid">
    <article class="professor-stat-card">
      <span>Total en attente</span>
      <strong>{{ stats.count || 0 }}</strong>
    </article>

    <article class="professor-stat-card">
      <span>Projets</span>
      <strong>{{ stats.projects || 0 }}</strong>
    </article>

    <article class="professor-stat-card">
      <span>Stages</span>
      <strong>{{ stats.internships || 0 }}</strong>
    </article>

    <article class="professor-stat-card">
      <span>Corrections</span>
      <strong>{{ stats.changesRequested || 0 }}</strong>
    </article>
  </div>
</template>

<style scoped>
.professor-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 1rem;
}

.professor-stat-card {
  min-height: 6.75rem;
  padding: 1.1rem 1.25rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.professor-stat-card span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.professor-stat-card strong {
  display: block;
  margin-top: 0.8rem;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}
</style>
