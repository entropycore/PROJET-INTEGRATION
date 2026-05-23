<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "folder",
  },
});
</script>

<template>
  <section class="portfolio-section">
    <h2>
      <span class="material-icons-round">{{ icon }}</span>
      {{ title }}
    </h2>

    <slot />
  </section>
</template>

<style scoped>
.portfolio-section {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 1rem;
  padding: 1.35rem;
}

h2 {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #102a33;
  font-size: 1rem;
  font-weight: 900;
  margin: 0 0 1.15rem;
  text-transform: uppercase;
  letter-spacing: 0.04rem;
}

.material-icons-round {
  color: #2f575d;
  font-size: 1.25rem;
}
</style>