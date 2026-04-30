<template>
  <div class="not-authorized">
    <h1>403</h1>
    <p>Accès refusé — vous n'avez pas les permissions nécessaires.</p>
    <button @click="goBack">Retour</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.go(-1)
</script>