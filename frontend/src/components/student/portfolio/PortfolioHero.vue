<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const initials = computed(() => {
  const first = props.data.student?.firstName?.charAt(0) || "";
  const last = props.data.student?.lastName?.charAt(0) || "";
  return `${first}${last}`.toUpperCase();
});
</script>

<template>
  <section class="portfolio-hero">
    <div class="hero-pattern"></div>

    <div class="hero-main">
      <div class="profile-block">
        <div class="avatar-box">
          <img
            v-if="data.student.profilePicture"
            :src="data.student.profilePicture"
            :alt="data.student.fullName"
          />

          <span v-else>{{ initials }}</span>
        </div>

        <div>
          <h1>{{ data.student.fullName }}</h1>

          <p class="subtitle">
            {{ data.student.role }} — {{ data.student.major }} ·
            {{ data.student.school }}
          </p>

          <div class="contact-list">
            <span>
              <span class="material-icons-round">mail</span>
              {{ data.student.email }}
            </span>

            <span>
              <span class="material-icons-round">phone</span>
              {{ data.student.phone }}
            </span>

            <span>
              <span class="material-icons-round">location_on</span>
              {{ data.student.city }}
            </span>
          </div>

          <div class="links-row">
            <a :href="data.student.githubUrl" target="_blank">
              <span class="material-icons-round">code</span>
              GitHub
            </a>

            <a :href="data.student.linkedinUrl" target="_blank">
              <span class="material-icons-round">work</span>
              LinkedIn
            </a>
          </div>

          <span class="certified-pill">
            <span class="material-icons-round">verified</span>
            Portfolio certifié
          </span>
        </div>
      </div>

      <div class="score-card">
        <div class="score-circle">
          <strong>{{ data.credibilityScore.score }}</strong>
          <span>/100</span>
        </div>

        <p>{{ data.credibilityScore.label }}</p>
        <small>Score crédibilité</small>
      </div>
    </div>
  </section>
</template>

<style scoped>
.portfolio-hero {
  position: relative;
  overflow: hidden;
  border-radius: 1.4rem;
  padding: 2.4rem;
  background:
    radial-gradient(circle at 85% 20%, rgba(47, 87, 93, 0.13), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #edf7f5 100%);
  border: 1px solid #dee7e3;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#2f575d 1px, transparent 1px);
  background-size: 18px 18px;
  opacity: 0.05;
}

.hero-main {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.profile-block {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-box {
  width: 10.5rem;
  height: 10.5rem;
  border-radius: 1.4rem;
  background: linear-gradient(135deg, #2f575d, #6d9197);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 2.7rem;
  font-weight: 800;
  overflow: hidden;
}

.avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h1 {
  margin: 0;
  color: #102a33;
  font-size: 2.25rem;
  font-weight: 900;
}

.subtitle {
  margin: 0.5rem 0 0.9rem;
  color: #2f575d;
  font-size: 1rem;
  font-weight: 700;
}

.contact-list {
  display: grid;
  gap: 0.35rem;
  color: #435b60;
  font-size: 0.92rem;
}

.contact-list span,
.links-row a,
.certified-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.material-icons-round {
  font-size: 1rem;
}

.links-row {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.9rem;
}

.links-row a {
  color: #2f575d;
  text-decoration: none;
  font-weight: 800;
}

.certified-pill {
  width: fit-content;
  margin-top: 1rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: #e8f5ec;
  color: #2e7d32;
  font-size: 0.8rem;
  font-weight: 900;
}

.score-card {
  width: 13rem;
  min-height: 13rem;
  background: #ffffff;
  border: 1px solid #dee7e3;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 1rem;
  box-shadow: 0 1rem 2rem rgba(47, 87, 93, 0.08);
}

.score-circle {
  width: 7.2rem;
  height: 7.2rem;
  border-radius: 50%;
  border: 0.55rem solid #2f575d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.score-circle strong {
  color: #102a33;
  font-size: 2rem;
  line-height: 1;
}

.score-circle span {
  color: #6d9197;
  font-size: 0.8rem;
}

.score-card p {
  color: #102a33;
  font-weight: 900;
  margin: 0.7rem 0 0;
}

.score-card small {
  color: #8da2a0;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .hero-main,
  .profile-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .score-card {
    width: 100%;
  }
}
</style>