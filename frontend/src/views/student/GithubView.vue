<template>
  <div class="github-dashboard">
    
    <div class="header-title">
      <h1>Contributions GitHub</h1>
      <p>Connectez votre compte GitHub pour enrichir automatiquement votre portfolio</p>
    </div>

    <div v-if="!isConnected && !isLoading" class="connect-card text-center">
      <i class="fa-brands fa-github text-6xl"></i>
      <h2>Aucun compte GitHub lié</h2>
      <p>Liez votre compte pour importer vos projets directement dans Credencia.</p>
      <button @click="connectGitHub" class="btn-connect">
        Connecter GitHub
      </button>
    </div>

    <div v-if="isConnected && !isLoading" class="dashboard-content">
      
      <div class="card account-card">
        <div class="card-header-flex">
          <h3 class="card-title">Compte connecté</h3>
          <span class="status-badge">● Connecté</span>
        </div>
        <div class="account-details">
          <div class="avatar-info">
            <div class="avatar">
              <img :src="`https://github.com/${githubData.username}.png`" alt="Avatar" />
            </div>
            <div>
              <h4 class="username">github.com/{{ githubData.username }}</h4>
              <span class="sync-time">Synchronisé à l'instant</span>
            </div>
          </div>
          <button @click="fetchStats" class="btn-outline-sync" :disabled="isLoading">
            <i class="fa-solid fa-rotate-right" :class="{'fa-spin': isLoading}"></i> Synchroniser
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <span class="stat-label">DÉPÔTS PUBLICS</span>
          <span class="stat-number">{{ githubData.publicRepos }}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">CONTRIBUTIONS (1 AN)</span>
          <span class="stat-number">{{ githubData.totalContributions || '--' }}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">LANGAGES</span>
          <span class="stat-number">{{ githubData.languages?.length || 0 }}</span>
        </div>
      </div>

      <div class="card calendar-card">
        <div class="card-header-flex">
          <h3 class="card-title">Calendrier d'activité</h3>
        </div>
        <div class="heatmap-container" style="overflow-x: auto; padding: 10px 0; text-align: center;">
          <img 
            v-if="githubData.username" 
            :src="`https://ghchart.rshah.org/2F6151/${githubData.username}`" 
            alt="GitHub Contributions Calendar" 
            style="width: 100%; min-width: 600px; max-width: 800px; margin: 0 auto;" 
          />
        </div>
      </div>

      <div class="card table-card">
        <h3 class="card-title" style="margin-bottom: 20px;">Dépôts à inclure dans le portfolio</h3>
        <table class="repos-table">
          <thead>
            <tr>
              <th>DÉPÔT</th>
              <th>TECHNOLOGIES</th>
              <th>DERNIÈRE ACTIVITÉ</th>
              <th>PORTFOLIO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="repo in githubData.repositories" :key="repo.id">
              <td class="font-bold">{{ repo.name }}</td>
              <td class="text-gray">{{ repo.language || 'N/A' }}</td>
              <td class="text-gray">{{ formatDate(repo.updatedAt) }}</td>
              <td>
                <label class="switch">
                  <input type="checkbox" :checked="repo.isImported" @change="handleToggle(repo, $event)" :disabled="repo.isImporting">
                  <span class="slider round"></span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <div v-if="isLoading" class="loader-card text-center">
      <p>Chargement des données GitHub...</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import api from '../../services/api'; 

const route = useRoute();
const router = useRouter();

const isConnected = ref(false);
const isLoading = ref(true);
const githubData = ref({ 
  username: '', 
  publicRepos: 0, 
  totalContributions: 0, 
  languages: [], 
  repositories: [] 
});

const connectGitHub = async () => {
  try {
    const res = await api.get('/student/github/auth');
    if (res.data.success) window.location.href = res.data.data.url; 
  } catch (error) {
    alert("Erreur de connexion avec le serveur.");
  }
};

const fetchStats = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/student/github/stats');
    if (res.data.data && res.data.data.connected) {
      isConnected.value = true;
      githubData.value = res.data.data;
    } else {
      isConnected.value = false;
    }
  } catch (error) {
    isConnected.value = false;
  } finally {
    isLoading.value = false;
  }
};

const handleToggle = async (repo, event) => {
  const isChecked = event.target.checked;
  repo.isImporting = true;
  
  if (isChecked) {
    try {
      const payload = {
        repoName: repo.name,
        repoDescription: repo.description,
        repoUrl: repo.url,
        repoLanguage: repo.language
      };
      const res = await api.post('/student/github/import', payload);
      if (res.data.success) {
        repo.isImported = true;
      }
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'ajout");
      event.target.checked = false; 
    }
  } else {
    alert("La fonctionnalité pour retirer un projet est en cours de développement.");
    event.target.checked = true; 
  }
  
  repo.isImporting = false;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(() => {
  if (route.query.status === 'success') router.replace({ query: {} }); 
  else if (route.query.status === 'error') {
    alert("Authentification échouée.");
    router.replace({ query: {} });
  }
  fetchStats();
});
</script>

<style scoped>
/* TYPOGRAPHIE ET COULEURS DE BASE */
.github-dashboard { font-family: 'Inter', system-ui, sans-serif; padding: 20px; max-width: 1000px; margin: 0 auto; color: #1f2937; background: #fafafa; }
.header-title h1 { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; font-size: 26px; font-weight: 700; margin: 0; color: #111; }
.header-title p { color: #666; margin-top: 6px; font-size: 14px; margin-bottom: 30px;}

.card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eaeaea; margin-bottom: 24px; }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 20px; }
.card-title { font-family: ui-serif, Georgia, serif; font-size: 18px; font-weight: 700; margin: 0; color: #111; }

/* COMPTE CONNECTÉ */
.status-badge { background: #e6f4ea; color: #1e8e3e; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.account-details { display: flex; justify-content: space-between; align-items: center; }
.avatar-info { display: flex; align-items: center; gap: 15px; }
.avatar { width: 50px; height: 50px; border-radius: 50%; overflow: hidden; background: #24292e; display: flex; align-items: center; justify-content: center; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.username { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111; }
.sync-time { font-size: 13px; color: #888; }
.btn-outline-sync { background: white; border: 1px solid #ccc; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; color: #333; transition: 0.2s; }
.btn-outline-sync:hover { background: #f9f9f9; border-color: #999; }

/* STATS GRID */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
.stat-box { background: white; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); border-top: 3px solid #2F6151; }
.stat-label { display: block; font-size: 11px; color: #888; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; text-transform: uppercase; }
.stat-number { font-family: ui-serif, Georgia, serif; font-size: 32px; font-weight: 700; color: #111; }

/* TABLEAU & TOGGLE */
.table-card { padding: 30px; }
.repos-table { width: 100%; border-collapse: collapse; text-align: left; }
.repos-table th { padding: 12px 0; border-bottom: 1px solid #eaeaea; font-size: 11px; color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.repos-table td { padding: 16px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #333; }
.font-bold { font-weight: 600; color: #111; }
.text-gray { color: #777; }

/* TOGGLE SWITCH CSS */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
input:checked + .slider { background-color: #648f76; }
input:checked + .slider:before { transform: translateX(20px); }
input:disabled + .slider { opacity: 0.5; cursor: wait; }
</style>

