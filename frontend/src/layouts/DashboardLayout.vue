<script setup>
import { ref } from 'vue'
import Sidebar from '../components/dashboard/Sidebar.vue'
import Topbar from '../components/dashboard/Topbar.vue'
import '../assets/styles/dashboard-layout.css'

const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<template>
  <div class="dashboard-layout">
    <Topbar />

    <div class="dashboard-body">
      <Sidebar :collapsed="isSidebarCollapsed"  @toggle-sidebar="toggleSidebar" />

      <main class="dashboard-content">
        <router-view />
      </main>
    </div>
  </div>
</template>