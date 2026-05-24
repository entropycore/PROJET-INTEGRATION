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
      <span>Total</span>
      <strong>{{ stats.total }}</strong>
      <p>Signalements reçus</p>
    </article>

    <article class="stat-card pending">
      <span>En attente</span>
      <strong>{{ stats.pending }}</strong>
      <p>À traiter</p>
    </article>

    <article class="stat-card resolved">
      <span>Traités</span>
      <strong>{{ stats.resolved }}</strong>
      <p>Résolus</p>
    </article>

    <article class="stat-card rejected">
      <span>Rejetés</span>
      <strong>{{ stats.rejected }}</strong>
      <p>Non retenus</p>
    </article>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
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
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-card strong {
  display: block;
  margin-top: 14px;
  color: #0f2f3a;
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1;
}

.stat-card p {
  margin: 10px 0 0;
  color: #4f7d68;
  font-size: 0.92rem;
  font-weight: 500;
}

.stat-card.total::before,
.stat-card.resolved::before {
  background: #2f5d62;
}

.stat-card.pending::before {
  background: #d89a2b;
}

.stat-card.rejected::before {
  background: #dc2626;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 650px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
