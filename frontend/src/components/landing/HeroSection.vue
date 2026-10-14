<template>
  <section class="hero" id="hero">
    <div class="hero-left">
      <div class="hero-badge">Plateforme académique certifiée</div>

      <h1 class="hero-title">
        Votre portfolio,<br />
        <em>certifié</em> &amp;<br />
        <span class="line2">reconnu.</span>
      </h1>

      <p class="hero-desc">
        Centralisez vos projets, stages et activités. Faites valider vos
        réalisations par votre institution, puis générez un portfolio crédible
        et consultable par les professionnels.
      </p>

      <div class="hero-actions">
        <router-link to="/login" class="btn-lg">
          Accéder à Credencia
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </router-link>
        <a href="#workflow" class="btn-outline">Comprendre la validation</a>
      </div>

      <div class="hero-proof-line">
        <span>Réalisations documentées</span>
        <span>Validation institutionnelle</span>
        <span>Portfolio certifié</span>
      </div>
    </div>

    <div class="hero-right">
      <div class="hero-validation-notice">
        <span class="material-icons-round">verified</span>
        <div>
          <strong>Validation effectuée</strong>
          <small>Votre réalisation a été validée par l’institution.</small>
        </div>
      </div>

      <article class="hero-product-preview">
        <header class="hero-product-profile">
          <img
            class="hero-product-avatar"
            src="/portfolio/profile.jpg"
            alt="Photo de profil d’Amina Berrada"
          />
          <div class="hero-product-identity">
            <span>Hello ! Je suis</span>
            <h2>Amina Berrada</h2>
            <p>Étudiante Ingénieure · Génie Informatique</p>
            <small>ENSA Tanger</small>
          </div>
          <div class="hero-product-score">
            <strong>96</strong>
            <span>/100</span>
            <small>Crédibilité</small>
          </div>
        </header>

        <div class="hero-product-stats">
          <span><i class="material-icons-round">emoji_events</i><strong>12</strong>Réalisations validées</span>
          <span><i class="material-icons-round">workspace_premium</i><strong>6</strong>Badges obtenus</span>
          <span><i class="material-icons-round">star</i><strong>4</strong>Recommandations</span>
          <span><i class="material-icons-round">analytics</i><strong>96</strong>Score de crédibilité</span>
        </div>

        <section class="hero-product-project">
          <img src="/portfolio/project-1.jpg" alt="Aperçu du projet Plateforme Credencia" />
          <div class="hero-product-project-copy">
            <header>
              <span>Projet mis en avant</span>
              <strong><i class="material-icons-round">verified</i>Validé</strong>
            </header>
            <h3>Plateforme Credencia</h3>
            <p>
              Application web de gestion académique permettant la documentation,
              la validation et la valorisation des réalisations.
            </p>
            <div class="hero-product-technologies">
              <span>Vue.js</span><span>Node.js</span><span>PostgreSQL</span>
            </div>
            <div class="hero-product-proofs">
              <span><i class="material-icons-round">verified_user</i>Validation institutionnelle</span>
              <span><i class="material-icons-round">language</i>Visible publiquement</span>
            </div>
          </div>
        </section>

        <div class="hero-product-bottom">
          <section>
            <header><span class="material-icons-round">code</span>Compétences principales</header>
            <div class="hero-product-tags">
              <span>Vue.js</span><span>JavaScript</span><span>Node.js</span>
              <span>PostgreSQL</span><span>Docker</span><span>GitHub</span>
            </div>
          </section>

          <section>
            <header><span class="material-icons-round">workspace_premium</span>Badges obtenus</header>
            <div class="hero-product-badges">
              <span><i class="material-icons-round">terminal</i><small>Web Developer</small></span>
              <span><i class="material-icons-round">developer_mode</i><small>Full Stack</small></span>
              <span><i class="material-icons-round">cloud_sync</i><small>DevOps</small></span>
              <span><i class="material-icons-round">groups</i><small>Hackathon</small></span>
            </div>
          </section>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup></script>
