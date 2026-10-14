<template>
  <section class="roles" id="roles">
    <div class="section-label">Écosystème de confiance</div>
    <h2 class="section-title reveal">Quatre rôles, une même plateforme</h2>
    <p class="section-sub reveal">
      Credencia organise la collaboration entre ceux qui documentent, valident,
      supervisent et consultent les réalisations.
    </p>

    <div class="roles-grid">
      <div class="role-card reveal">
        <div class="role-avatar ra-student">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 10v6"></path>
            <path d="M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
        <div class="role-name">Étudiant</div>
        <div class="role-desc">
          Construit progressivement son identité académique et professionnelle.
        </div>
        <ul class="role-perms">
          <li>Gérer son profil</li>
          <li>Documenter ses réalisations</li>
          <li>Soumettre ses expériences à validation</li>
          <li>Générer son portfolio certifié</li>
          <li>Connecter GitHub et LinkedIn</li>
        </ul>
      </div>

      <div class="role-card reveal">
        <div class="role-avatar ra-prof">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
        <div class="role-name">Professeur</div>
        <div class="role-desc">
          Accompagne les étudiants et valide leurs acquis académiques.
        </div>
        <ul class="role-perms">
          <li>Consulter les profils étudiants</li>
          <li>Valider projets, stages et activités</li>
          <li>Rédiger des lettres de recommandation</li>
          <li>Recommander des portfolios</li>
          <li>Fournir des retours et commentaires</li>
        </ul>
      </div>

      <div class="role-card reveal">
        <div class="role-avatar ra-admin">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
        <div class="role-name">Administrateur</div>
        <div class="role-desc">
          Garantit la confiance et le bon fonctionnement de la plateforme.
        </div>
        <ul class="role-perms">
          <li>Gérer les utilisateurs</li>
          <li>Superviser la plateforme</li>
          <li>Valider les comptes professionnels</li>
          <li>Gérer les badges et modèles</li>
          <li>Assurer la cohérence institutionnelle</li>
        </ul>
      </div>

      <div class="role-card reveal">
        <div class="role-avatar ra-pro">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <div class="role-name">Professionnel</div>
        <div class="role-desc">
          Découvre et évalue des profils construits sur des preuves validées.
        </div>
        <ul class="role-perms">
          <li>Consulter les portfolios</li>
          <li>Explorer les réalisations validées</li>
          <li>Recommander des talents</li>
          <li>Commenter les portfolios</li>
          <li>Identifier de futurs collaborateurs</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup></script>
