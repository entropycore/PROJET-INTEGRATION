<template>
  <section class="scoring credibility-section" id="scoring">
    <div class="credibility-copy reveal">
      <div class="section-label">Dashboard étudiant</div>
      <h2 class="section-title">La progression devient immédiatement lisible</h2>
      <p class="section-sub">
        Chaque validation enrichit le profil, débloque des badges et améliore
        les indicateurs de crédibilité.
      </p>

      <div class="credibility-list">
        <article>
          <span>01</span>
          <div>
            <h3>Suivre sa progression</h3>
            <p>Des statistiques alimentées par les réalisations validées.</p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h3>Comprendre les validations</h3>
            <p>Un statut clair et un retour académique contextualisé.</p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h3>Débloquer des badges</h3>
            <p>Des règles transparentes liées aux preuves réelles.</p>
          </div>
        </article>
      </div>
    </div>

    <div class="product-dashboard-preview reveal">
      <div class="dashboard-preview-topbar">
        <div>
          <span>VUE D’ENSEMBLE</span>
          <strong>Bonjour Amina</strong>
        </div>
        <span class="dashboard-live-status"><i></i>Profil à jour</span>
      </div>

      <div class="dashboard-preview-stats">
        <article><span>Projets validés</span><strong>6</strong><small>+2 ce semestre</small></article>
        <article><span>Score crédibilité</span><strong>82</strong><small>Niveau avancé</small></article>
        <article><span>Badges obtenus</span><strong>3</strong><small>1 en progression</small></article>
      </div>

      <div class="dashboard-preview-main">
        <article class="dashboard-preview-score">
          <header><span class="material-icons-round">verified</span><strong>Progression</strong></header>
          <div class="preview-ring"><strong>82</strong><span>/100</span></div>
          <div class="preview-progress-lines">
            <span><i style="width: 88%"></i></span>
            <span><i style="width: 76%"></i></span>
            <span><i style="width: 68%"></i></span>
          </div>
        </article>

        <div class="dashboard-preview-side">
          <article class="dashboard-validation-card">
            <header>
              <span class="material-icons-round">fact_check</span>
              <strong>Validation récente</strong>
            </header>
            <div>
              <span>Projet de suivi académique</span>
              <strong><span class="material-icons-round">verified</span> Approuvé</strong>
            </div>
            <small>Validé par Pr. Alami · aujourd’hui</small>
          </article>

          <article class="dashboard-badges-card">
            <header>
              <span class="material-icons-round">workspace_premium</span>
              <strong>Badges obtenus</strong>
            </header>
            <div class="dashboard-badge-row">
              <span><i class="material-icons-round">terminal</i><small>Web Developer</small></span>
              <span><i class="material-icons-round">cloud_sync</i><small>DevOps Explorer</small></span>
              <span><i class="material-icons-round">groups</i><small>Hackathon</small></span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>
