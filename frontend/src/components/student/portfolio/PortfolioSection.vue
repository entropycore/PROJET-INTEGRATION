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
  theme: {
    type: String,
    default: "modern-academic",
  },
});
</script>

<template>
  <section class="portfolio-section" :class="`theme-${theme}`">
    <h2>
      <span class="material-icons-round">{{ icon }}</span>
      {{ title }}
    </h2>

    <slot />
  </section>
</template>
