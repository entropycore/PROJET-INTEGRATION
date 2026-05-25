<script setup>
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps({
  student: {
    type: Object,
    required: true,
  },
  credibilityScore: {
    type: Object,
    required: true,
  },
  theme: {
    type: String,
    default: "modern-academic",
  },
});

const animatedScore = ref(0);
const animatedScoreProgress = ref(0);

const initials = computed(() => {
  const first = props.student?.firstName?.charAt(0) || "";
  const last = props.student?.lastName?.charAt(0) || "";

  return `${first}${last}`.toUpperCase();
});

const normalizedScore = computed(() => {
  const score = props.credibilityScore?.score || 0;
  return Math.min(Math.max(score, 0), 100);
});

const scoreStyle = computed(() => {
  const degrees = animatedScoreProgress.value * 3.6;

  return {
    background: `conic-gradient(var(--portfolio-primary) ${degrees}deg, var(--portfolio-ring-track) ${degrees}deg)`,
  };
});

const animateValue = (from, to, duration, onUpdate) => {
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    onUpdate(Math.round(from + ease * (to - from)));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const animateScore = () => {
  animatedScore.value = 0;
  animatedScoreProgress.value = 0;

  setTimeout(() => {
    animateValue(0, normalizedScore.value, 1100, (value) => {
      animatedScore.value = value;
      animatedScoreProgress.value = value;
    });
  }, 250);
};

watch(normalizedScore, animateScore);

onMounted(animateScore);
</script>

<template>
  <section class="hero-section" :class="`theme-${theme}`">
    <div class="corner-badge">
      <span class="material-icons-round">verified</span>
      Certifié
    </div>

    <div class="hero-profile">
      <div class="avatar-frame">
        <img
          v-if="student.profilePicture"
          :src="student.profilePicture"
          :alt="student.fullName"
        />
        <span v-else>{{ initials }}</span>
      </div>

      <div class="hero-info">
        <div class="hero-heading">
          <span class="hello-text">Hello! je suis</span>

          <div class="hero-name-block">
            <h1>{{ student.fullName }}</h1>
          </div>
        </div>

        <p class="hero-title">
          <span>{{ student.role }}</span>
          <span class="hero-title-separator">—</span>
          {{ student.major }}
        </p>

        <p class="hero-school">
          {{ student.school }} · {{ student.city }}
        </p>

        <div class="hero-contact">
          <span>
            <span class="material-icons-round">mail</span>
            {{ student.email }}
          </span>

          <span>
            <span class="material-icons-round">phone</span>
            {{ student.phone }}
          </span>

          <span>
            <span class="material-icons-round">location_on</span>
            {{ student.city }}
          </span>
        </div>

        <div class="hero-links">
          <a
            v-if="student.githubUrl"
            :href="student.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg class="github-mark" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.11-.75.41-1.26.74-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.17 1.18A11.1 11.1 0 0 1 12 6.12c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.79 1.07.79 2.16v3.02c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            GitHub
          </a>

          <a
            v-if="student.linkedinUrl"
            :href="student.linkedinUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="material-icons-round">work</span>
            LinkedIn
          </a>
        </div>
      </div>
    </div>

    <div class="hero-right">
      <div class="score-card">
        <div class="score-circle" :style="scoreStyle">
          <div class="score-inner">
            <strong>{{ animatedScore }}</strong>
            <span>/100</span>
          </div>
        </div>

        <p>{{ credibilityScore.label }}</p>
        <small>Score crédibilité</small>
      </div>
    </div>
  </section>
</template>
