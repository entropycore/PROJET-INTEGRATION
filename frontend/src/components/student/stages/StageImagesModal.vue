<script setup>
defineProps({
  images: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2>Captures d’écran</h2>
          <p>{{ images.length }} image(s) ajoutée(s)</p>
        </div>

        <button class="close-btn" @click="closeModal">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <div class="images-grid">
        <div v-for="image in images" :key="image.id" class="image-card">
          <img :src="image.url" :alt="image.title" />
          <span>{{ image.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;

  background: rgba(40, 54, 61, 0.55);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 1.5rem;
}

.modal-card {
  width: min(62rem, 100%);
  max-height: 88vh;
  overflow: auto;

  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid #dee1dd;

  padding: 1.4rem;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  margin-bottom: 1.2rem;
}

.modal-header h2 {
  color: #28363d;
  font-size: 1.45rem;
  font-weight: 800;
  margin: 0 0 0.3rem;
}

.modal-header p {
  color: #6d9197;
  font-size: 0.95rem;
  margin: 0;
}

.close-btn {
  width: 2.4rem;
  height: 2.4rem;

  border-radius: 0.7rem;
  border: 1px solid #c4cdc1;

  background: #ffffff;
  color: #2f575d;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.close-btn:hover {
  background: #f8f9f8;
}

.close-btn .material-icons-round {
  font-size: 1.25rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.image-card {
  overflow: hidden;

  background: #f8f9f8;
  border: 1px solid #dee1dd;
  border-radius: 0.85rem;
}

.image-card img {
  width: 100%;
  height: 12rem;

  object-fit: cover;
  display: block;
}

.image-card span {
  display: block;

  padding: 0.8rem;

  color: #28363d;
  font-size: 0.9rem;
  font-weight: 700;
}

@media (max-width: 900px) {
  .images-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .modal-overlay {
    padding: 1rem;
  }

  .images-grid {
    grid-template-columns: 1fr;
  }

  .modal-card {
    max-height: 92vh;
  }
}
</style>
