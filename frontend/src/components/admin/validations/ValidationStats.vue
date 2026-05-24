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
    <article class="stat-card total">
      <span>Total en attente</span>
      <strong>{{ stats.count }}</strong>
      <p>Validations à traiter</p>
    </article>

    <article class="stat-card project">
      <span>Projets</span>
      <strong>{{ stats.projects }}</strong>
      <p>À valider</p>
    </article>

    <article class="stat-card internship">
      <span>Stages</span>
      <strong>{{ stats.internships }}</strong>
      <p>Soumis cette semaine</p>
    </article>

    <article class="stat-card certificate">
      <span>Certificats</span>
      <strong>{{ stats.certificates }}</strong>
      <p>En attente</p>
    </article>

    <article class="stat-card activity">
      <span>Activités</span>
      <strong>{{ stats.activities }}</strong>
      <p>À vérifier</p>
    </article>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: clamp(1rem, 1.6vw, 1.4rem);
}

.stat-card {
  position: relative;
  min-height: clamp(7.5rem, 12vw, 9rem);
  padding: clamp(1rem, 1.6vw, 1.4rem);
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
  font-size: clamp(0.7rem, 0.75vw, 0.85rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-card strong {
  display: block;
  margin-top: 0.9rem;
  color: var(--app-heading);
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  font-weight: 700;
  line-height: 1;
}

.stat-card p {
  margin: 0.35rem 0 0;
  color: var(--app-muted);
  font-size: clamp(0.7rem, 0.75vw, 0.85rem);
  font-weight: 500;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
