<template>
  <section class="hero" id="hero">
    <div class="hero-left">
      <div class="hero-badge">Plateforme académique certifiée</div>

      <h1 class="hero-title">
        Votre portfolio,<br>
        <em>certifié</em> &amp;<br>
        <span class="line2">reconnu.</span>
      </h1>

      <p class="hero-desc">
        Créez un portfolio numérique adaptatif validé par vos enseignants. 
        Présentez vos projets, compétences et contributions avec une crédibilité institutionnelle.
      </p>

      <div class="hero-actions">
        <!-- Redirection vers la page de connexion -->
        <router-link to="/login" class="btn-lg">
          Créer mon portfolio
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </router-link>
        <a href="#demo" class="btn-outline">Voir la démo</a>
      </div>

      <div class="hero-stats">
        <div>
          <span class="hero-stat-num">4</span>
          <span class="hero-stat-label">Rôles utilisateurs</span>
        </div>
        <div>
          <span class="hero-stat-num">10+</span>
          <span class="hero-stat-label">Modules fonctionnels</span>
        </div>
        <div>
          <span class="hero-stat-num">100</span>
          <span class="hero-stat-label">Score de crédibilité</span>
        </div>
      </div>
    </div>

    <div class="hero-right">
      <!-- Indicateurs visuels flottants -->
      <div class="float-card float-card-1">
        <div class="float-dot"></div>
        Projet validé par l'institution
      </div>

      <div class="float-card float-card-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(153,174,173,0.8)" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <div>
          <div style="font-size:11.5px;color:rgba(255,255,255,0.7);font-weight:500;">Nouveau commentaire</div>
          <div style="font-size:10.5px;color:rgba(153,174,173,0.6);">Pr. Alami a validé votre stage</div>
        </div>
      </div>

      <!-- Image de prévisualisation principale -->
      <img src="../../assets/hero.png" alt="Aperçu du portfolio Credencia" class="portfolio-image-demo" />
    </div>
  </section>
</template>

<script setup>
</script>