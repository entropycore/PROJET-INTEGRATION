<template>
  <section class="portfolio-demo portfolio-generation" id="demo">
    <div class="portfolio-showcase-copy">
      <div class="section-label">Portfolio certifié</div>
      <h2 class="section-title reveal">
        Le portfolio est le résultat de tout le parcours
      </h2>
      <p class="section-sub reveal">
        Credencia génère automatiquement un portfolio structuré à partir des
        informations validées de l’étudiant : profil, compétences, badges,
        projets, stages, activités et recommandations.
      </p>

      <div class="portfolio-source-list reveal">
        <span><i class="material-icons-round">verified</i>Informations validées</span>
        <span><i class="material-icons-round">auto_awesome</i>Génération automatique</span>
        <span><i class="material-icons-round">language</i>Portfolio public</span>
      </div>
    </div>

    <article class="compact-portfolio-window reveal">
      <header class="compact-window-bar">
        <div class="window-controls"><i></i><i></i><i></i></div>
        <span>portfolio.credencia.ma/amina-berrada</span>
        <strong><span class="material-icons-round">verified</span>Certifié</strong>
      </header>

      <div class="compact-portfolio-content">
        <section class="compact-profile">
          <div class="compact-avatar">AB</div>
          <div>
            <span>Bonjour, je suis</span>
            <h3>Amina Berrada</h3>
            <p>Étudiante ingénieure · Développement Full Stack</p>
          </div>
          <div class="compact-score">
            <strong>82</strong>
            <span>/100</span>
            <small>Crédibilité</small>
          </div>
        </section>

        <section class="compact-portfolio-grid">
          <article class="compact-bio">
            <header><span class="material-icons-round">format_quote</span>Biographie</header>
            <p>
              Étudiante en génie informatique, engagée dans des projets web et
              des expériences validées.
            </p>
          </article>

          <article class="compact-skills">
            <header><span class="material-icons-round">code</span>Compétences</header>
            <div><span>Vue.js</span><span>Node.js</span><span>PostgreSQL</span><span>Leadership</span></div>
          </article>

          <article class="compact-badges">
            <header><span class="material-icons-round">workspace_premium</span>Badges obtenus</header>
            <div>
              <span><i class="material-icons-round">terminal</i>Web Developer</span>
              <span><i class="material-icons-round">groups</i>Hackathon</span>
            </div>
          </article>

          <article class="compact-achievements">
            <header>
              <span><i class="material-icons-round">verified</i>Réalisations validées</span>
              <small>Voir le portfolio</small>
            </header>
            <div class="compact-achievement-stats">
              <span><strong>6</strong>Projets</span>
              <span><strong>2</strong>Stages</span>
              <span><strong>4</strong>Activités</span>
            </div>
            <div class="compact-achievement-list">
              <span>Plateforme de suivi académique</span>
              <span>Stage chez Capgemini</span>
            </div>
          </article>
        </section>
      </div>
    </article>
  </section>
</template>

<script setup></script>
