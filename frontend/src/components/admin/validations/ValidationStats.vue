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
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  gap: 18px;
}

.stat-card {
  position: relative;
  padding: 20px 24px;
  background: #ffffff;
  border: 1px solid #dfe3dd;
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 5px;
  background: #2f5d62;
}

.stat-card span {
  display: block;
  color: #8aa0a3;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-card strong {
  display: block;
  margin-top: 14px;
  color: #0f2f3a;
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}

.stat-card p {
  margin: 10px 0 0;
  color: #4f7d68;
  font-size: 0.95rem;
  font-weight: 500;
}

.stat-card.total::before,
.stat-card.project::before {
  background: #2f5d62;
}

.stat-card.internship::before {
  background: #8bbf9f;
}

.stat-card.certificate::before {
  background: #d89a2b;
}

.stat-card.activity::before {
  background: #ea7a2f;
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
