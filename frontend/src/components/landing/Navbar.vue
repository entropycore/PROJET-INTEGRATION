<template>
  <nav>
    <a href="#" class="nav-logo">
      <img src="../../assets/logo.png" alt="Logo Credencia" style="height: 32px;" />
      <span class="logo-text">Cred<span>encia</span></span>
    </a>

    <ul class="nav-links">
      <li><a href="#features">Fonctionnalités</a></li>
      <li><a href="#workflow">Processus</a></li>
      <li><a href="#roles">Acteurs</a></li>
      <li><a href="#scoring">Scoring</a></li>
      <li><a href="#demo">Démo</a></li>
    </ul>

    <div class="nav-cta">
      <router-link to="/login" class="btn-ghost">Connexion</router-link>
      <router-link to="/request-access" class="btn-primary">Demander un accès</router-link>
    </div>
  </nav>
</template>