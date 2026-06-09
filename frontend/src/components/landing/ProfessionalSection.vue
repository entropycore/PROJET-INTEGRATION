<template>
  <section class="professional-section" id="professionals">
    <div class="professional-copy reveal">
      <div class="section-label">Pour les professionnels</div>
      <h2 class="section-title">
        Identifiez les talents à partir de preuves vérifiées
      </h2>
      <p class="section-sub">
        Ne vous fiez plus uniquement aux CV. Consultez des profils qui réunissent
        expériences validées, compétences démontrées, badges et recommandations.
      </p>

      <ul class="professional-benefits">
        <li>Comprendre rapidement le parcours d’un candidat</li>
        <li>Consulter les détails de ses projets, stages et activités</li>
        <li>Identifier les validations et recommandations associées</li>
      </ul>

      <router-link to="/request-access" class="btn-lg">
        Demander un accès professionnel
      </router-link>
    </div>

    <div class="professional-preview reveal">
      <header class="talent-search-header">
        <div>
          <span>PROFILS CERTIFIÉS</span>
          <h3>Talents correspondant à votre recherche</h3>
        </div>
        <span class="talent-result-count">24 profils</span>
      </header>

      <div class="talent-filter-row">
        <span>Développement web</span>
        <span>Stage validé</span>
        <span>Score 70+</span>
      </div>

      <article class="talent-card featured">
        <div class="talent-avatar">AB</div>
        <div class="talent-copy">
          <strong>Amina Berrada</strong>
          <span>Développeuse web · Génie informatique</span>
          <div class="talent-tags">
            <small>Vue.js</small><small>Node.js</small><small>DevOps</small>
          </div>
        </div>
        <div class="talent-score"><strong>82</strong><span>/100</span></div>
      </article>

      <div class="talent-proof-grid">
        <div><strong>6</strong><span>Projets validés</span></div>
        <div><strong>2</strong><span>Stages</span></div>
        <div><strong>4</strong><span>Recommandations</span></div>
      </div>

      <div class="talent-validation-note">
        <span class="material-icons-round">verified</span>
        Profil enrichi par des validations institutionnelles
      </div>
    </div>
  </section>
</template>

<script setup></script>
