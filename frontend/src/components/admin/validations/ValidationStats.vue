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
      <div class="stat-icon main">☑</div>
      <div>
        <strong>{{ stats.count }}</strong>
        <p>Total en attente</p>
      </div>
    </article>

    <article class="stat-card">
      <div class="stat-icon blue">⌘</div>
      <div>
        <strong>{{ stats.projects }}</strong>
        <p>Projets</p>
      </div>
    </article>

    <article class="stat-card">
      <div class="stat-icon green">▣</div>
      <div>
        <strong>{{ stats.internships }}</strong>
        <p>Stages</p>
      </div>
    </article>

    <article class="stat-card">
      <div class="stat-icon purple">▤</div>
      <div>
        <strong>{{ stats.certificates }}</strong>
        <p>Certificats</p>
      </div>
    </article>

    <article class="stat-card">
      <div class="stat-icon orange">✦</div>
      <div>
        <strong>{{ stats.activities }}</strong>
        <p>Activités</p>
      </div>
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
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
  background: #ffffff;
  border: 1px solid #dfe3dd;
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.main {
  background: #e8efed;
  color: #2f5d62;
}

.blue {
  background: #eef6ff;
  color: #2563eb;
}

.green {
  background: #eef8ef;
  color: #15803d;
}

.purple {
  background: #f3eafa;
  color: #7e22ce;
}

.orange {
  background: #fff0e6;
  color: #ea580c;
}

.stat-card strong {
  display: block;
  color: #0f2f3a;
  font-size: 1.6rem;
  font-weight: 800;
}

.stat-card p {
  margin: 4px 0 0;
  color: #5f6f70;
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