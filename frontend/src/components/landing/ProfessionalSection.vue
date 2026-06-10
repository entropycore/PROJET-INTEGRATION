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
      <article class="landing-profile-card">
        <header class="landing-profile-header">
          <div class="landing-profile-identity">
            <img
              src="/portfolio/student-professional-profile.png"
              alt="Mohamed Zaaboul"
            />
            <div>
              <h3>Mohamed Zaaboul</h3>
              <p>Génie Informatique · GINF1</p>
            </div>
          </div>

          <span class="landing-certified-badge">
            <span class="material-icons-round">verified</span>
            Portfolio certifié
          </span>
        </header>

        <p class="landing-profile-bio">
          Étudiant en 1ère année de Génie Informatique, je développe des solutions
          full-stack avec Laravel, React et Node.js. Rigoureux et curieux, j’accorde
          une importance particulière à la qualité.
        </p>

        <div class="landing-profile-details">
          <div class="landing-profile-line">
            <strong>Compétences techniques :</strong>
            <span class="landing-profile-tags">
              <small>CSS</small>
              <small>CI/CD</small>
            </span>
          </div>
          <div class="landing-profile-line">
            <strong>Soft Skills :</strong>
            <span class="landing-profile-tags">
              <small>Leadership</small>
              <small>Time management</small>
            </span>
          </div>
          <div class="landing-profile-line">
            <strong>Score crédibilité :</strong>
            <span>60/100</span>
          </div>
          <div class="landing-profile-line">
            <strong>Réalisations certifiées :</strong>
            <span>1 projet validé · 1 stage validé · 4 badges · 1 recommandation</span>
          </div>
        </div>

        <div class="landing-profile-actions">
          <span class="landing-profile-primary">
            <span class="material-icons-round">visibility</span>
            Ouvrir portfolio
          </span>
          <span class="landing-profile-secondary">
            <span class="material-icons-round">recommend</span>
            Recommander
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup></script>
