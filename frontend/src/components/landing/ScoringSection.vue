<template>
  <section class="scoring" id="scoring">
    <div class="score-visual reveal">
      <div class="score-ring-container">
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="100" fill="none" stroke="var(--lightest)" stroke-width="8"/>
          <circle cx="120" cy="120" r="100" fill="none" stroke="var(--accent)" stroke-width="8"
            stroke-dasharray="628" stroke-dashoffset="114" stroke-linecap="round"/>
          <circle cx="120" cy="120" r="76" fill="none" stroke="var(--paper2)" stroke-width="6"/>
          <circle cx="120" cy="120" r="76" fill="none" stroke="var(--accent2)" stroke-width="6"
            stroke-dasharray="478" stroke-dashoffset="96" stroke-linecap="round" opacity="0.6"/>
        </svg>
        <div class="score-center">
          <div class="score-big">82</div>
          <div class="score-denom">/ 100</div>
          <div class="score-level">Avancé</div>
        </div>
      </div>

      <div class="score-breakdown">
        <div class="score-row">
          <div class="score-row-label">Projets validés (20%)</div>
          <div class="score-bar-bg"><div class="score-bar-fill" style="width:85%"></div></div>
          <div class="score-bar-val">17/20</div>
        </div>
        <div class="score-row">
          <div class="score-row-label">Stages validés (20%)</div>
          <div class="score-bar-bg"><div class="score-bar-fill" style="width:75%"></div></div>
          <div class="score-bar-val">15/20</div>
        </div>
        <div class="score-row">
          <div class="score-row-label">Contributions Git (15%)</div>
          <div class="score-bar-bg"><div class="score-bar-fill" style="width:80%"></div></div>
          <div class="score-bar-val">12/15</div>
        </div>
        <div class="score-row">
          <div class="score-row-label">Recommandations (15%)</div>
          <div class="score-bar-bg"><div class="score-bar-fill" style="width:67%"></div></div>
          <div class="score-bar-val">10/15</div>
        </div>
        <div class="score-row">
          <div class="score-row-label">Certifications (15%)</div>
          <div class="score-bar-bg"><div class="score-bar-fill" style="width:60%"></div></div>
          <div class="score-bar-val">9/15</div>
        </div>
        <div class="score-row">
          <div class="score-row-label">Complétude profil (15%)</div>
          <div class="score-bar-bg"><div class="score-bar-fill" style="width:60%"></div></div>
          <div class="score-bar-val">9/15</div>
        </div>
      </div>
    </div>

    <div class="reveal">
      <div class="section-label">Score & Badges</div>
      <div class="badges-section-title">Valorisez chaque compétence acquise</div>
      <p style="font-size:14px;color:#6a7a7e;line-height:1.7;font-weight:300;margin-bottom:8px;">
        Le score de crédibilité donne aux recruteurs une vision synthétique et fiable de votre profil. Les badges numériques valorisent chaque domaine de compétence.
      </p>

      <div class="badges-grid">
        <div class="badge-card">
          <div style="margin-bottom: 12px; display: flex; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <div class="badge-title">Web Developer</div>
          <div class="badge-crit">3+ projets web validés</div>
        </div>
        <div class="badge-card">
          <div style="margin-bottom: 12px; display: flex; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
          </div>
          <div class="badge-title">DevOps Explorer</div>
          <div class="badge-crit">Docker + pipeline CI/CD</div>
        </div>
        <div class="badge-card">
          <div style="margin-bottom: 12px; display: flex; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <div class="badge-title">Hackathon</div>
          <div class="badge-crit">Participation confirmée</div>
        </div>
        <div class="badge-card">
          <div style="margin-bottom: 12px; display: flex; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="badge-title">Collaboration</div>
          <div class="badge-crit">Projets en équipe + Git</div>
        </div>
        <div class="badge-card">
          <div style="margin-bottom: 12px; display: flex; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
          </div>
          <div class="badge-title">AI / Data</div>
          <div class="badge-crit">Projets IA ou data science</div>
        </div>
        <div class="badge-card">
          <div style="margin-bottom: 12px; display: flex; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div class="badge-title">Security Aware</div>
          <div class="badge-crit">Bonnes pratiques sécurité</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>