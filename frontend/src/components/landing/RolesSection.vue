<template>
  <section class="roles" id="roles">
    <div class="section-label">Acteurs du système</div>
    <h2 class="section-title reveal">Quatre rôles, une plateforme</h2>
    <p class="section-sub reveal">Chaque utilisateur dispose d'un espace adapté à ses responsabilités et permissions.</p>

    <div class="roles-grid">
      
      <!-- ÉTUDIANT -->
      <div class="role-card reveal">
        <div class="role-avatar ra-student">
          <!-- Graduation Cap Icon -->
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6"></path>
            <path d="M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
        <div class="role-name">Étudiant</div>
        <div class="role-desc">Crée et gère son profil, soumet ses projets et génère son portfolio certifié.</div>
        <ul class="role-perms">
          <li>Créer et gérer son profil</li>
          <li>Soumettre des projets</li>
          <li>Générer son portfolio</li>
          <li>Connecter GitHub</li>
          <li>Gérer la visibilité</li>
        </ul>
      </div>

      <!-- PROFESSEUR -->
      <div class="role-card reveal">
        <div class="role-avatar ra-prof">
          <!-- Open Book Icon -->
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
        <div class="role-name">Professeur</div>
        <div class="role-desc">Valide les projets, les stages et rédige des lettres de recommandation.</div>
        <ul class="role-perms">
          <li>Valider les projets</li>
          <li>Encadrer les stages</li>
          <li>Rédiger des lettres</li>
          <li>Commenter les portfolios</li>
          <li>Recommander un profil</li>
        </ul>
      </div>

      <!-- ADMINISTRATEUR -->
      <div class="role-card reveal">
        <div class="role-avatar ra-admin">
          <!-- Shield Check Icon -->
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
        <div class="role-name">Administrateur</div>
        <div class="role-desc">Supervise la plateforme, gère les utilisateurs et les modèles de portfolio.</div>
        <ul class="role-perms">
          <li>Gérer les utilisateurs</li>
          <li>Gérer les modèles</li>
          <li>Valider les pros</li>
          <li>Créer des badges</li>
          <li>Superviser la plateforme</li>
        </ul>
      </div>

      <!-- PROFESSIONNEL -->
      <div class="role-card reveal">
        <div class="role-avatar ra-pro">
          <!-- Briefcase Icon -->
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <div class="role-name">Professionnel</div>
        <div class="role-desc">Consulte les portfolios publics et recommande les profils après validation du compte.</div>
        <ul class="role-perms">
          <li>Consulter les portfolios</li>
          <li>Commenter les projets</li>
          <li>Recommander un portfolio</li>
          <li>Compte validé par l'admin</li>
        </ul>
      </div>

    </div>
  </section>
</template>

<script setup>
</script>