<script setup>
import Sidebar from '../components/dashboard/Sidebar.vue'
import Topbar from '../components/dashboard/Topbar.vue'
import '../assets/styles/dashboard-layout.css'
</script>

<template>
  <div class="dashboard-layout">
    <Topbar />

    <div class="dashboard-body">
      <Sidebar />

      <main class="dashboard-content">
        <router-view />
      </main>
    </div>
  </div>
</template>