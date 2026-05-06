<script setup>
import { computed, ref } from "vue";
// import { onMounted } from "vue";

import ValidationStats from "@/components/admin/validations/ValidationStats.vue";
import ValidationToolbar from "@/components/admin/validations/ValidationToolbar.vue";
import ValidationsTable from "@/components/admin/validations/ValidationsTable.vue";
import ValidationDetailsModal from "@/components/admin/validations/ValidationDetailsModal.vue";

/*BACKEND À ACTIVER QUAND L’API SERA PRÊTE
import {
  getPendingValidations,
  getPendingValidationsCount,
  getValidationDetails,
  approveValidation,
  rejectValidation,
  requestValidationChanges,
} from "@/services/adminValidationsApi";
*/
const loading = ref(false);
const error = ref(null);
const search = ref("");
const selectedType = ref("ALL");
const showDetailsModal = ref(false);
const selectedValidation = ref(null);
const selectedStatus = ref("ALL");

//a remplacer stats apres par vrai data de backend
const stats = ref({
  count: 9,
  projects: 3,
  internships: 2,
  certificates: 3,
  activities: 1,
});

const validations = ref([
  {
  id: 1,
  targetType: "PROJECT",
  targetId: 12,
  title: "Plateforme de gestion de projets",
  student: {
    id: 3,
    fullName: "Yassine K.",
    email: "yassine.k@ensa.ma",
    profilePicture: "",
    field: "Génie informatique",
    level: "2ème année",
    city: "Tanger",
  },
  status: "PENDING",
  submittedAt: "2026-05-02T12:30:00.000Z",
  content: {
    title: "Plateforme de gestion de projets",
    description: "Application complète pour gérer des projets en équipe.",
    files: [
      {
        id: 1,
        name: "cahier_charges.pdf",
        size: "1.2 Mo",
        url: "#",
      },
    ],
  },
  targetDetails: {
    technologies: ["Vue.js", "Node.js", "PostgreSQL"],
    visibility: "PUBLIC",
    createdAt: "2026-05-01T10:00:00.000Z",
  },
},
//les files a verifier et les data a importer de plus a partir de backend
  {
    id: 2,
    targetType: "INTERNSHIP",
    targetId: 5,
    title: "Stage développement web",
    student: {
      id: 4,
      fullName: "Meryem A.",
      email: "meryem.a@ensa.ma",
    },
    status: "PENDING",
    submittedAt: "2026-05-01T16:45:00.000Z",
    description: "Stage chez InnovTech Solutions.",
  },
  {
    id: 3,
    targetType: "CERTIFICATE",
    targetId: 9,
    title: "Certification AWS Solutions",
    student: {
      id: 5,
      fullName: "Reda M.",
      email: "reda.m@ensa.ma",
    },
    status: "PENDING",
    submittedAt: "2026-05-01T09:15:00.000Z",
    description: "AWS Certified Solutions Architect.",
  },
  {
    id: 4,
    targetType: "ACTIVITY",
    targetId: 7,
    title: "Participation Hackathon",
    student: {
      id: 6,
      fullName: "Sara B.",
      email: "sara.b@ensa.ma",
    },
    status: "PENDING",
    submittedAt: "2026-04-30T14:20:00.000Z",
    description: "Hackathon ENSA 2026 - deuxième place.",
  },
]);

/* BACKEND PLUS TARD :
const fetchValidations = async () => {
  loading.value = true;
  error.value = null;

  try {
    const validationsData = await getPendingValidations();
    validations.value = validationsData.items || [];

    const statsData = await getPendingValidationsCount();
    stats.value = statsData;
  } catch (e) {
    console.error("Erreur validations:", e);
    error.value = "Impossible de charger les validations.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchValidations);
*/

const filteredValidations = computed(() => {
  return validations.value.filter((validation) => {
    const keyword = search.value.toLowerCase();

    const matchSearch =
      validation.title.toLowerCase().includes(keyword) ||
      validation.student.fullName.toLowerCase().includes(keyword) ||
      validation.student.email.toLowerCase().includes(keyword);

    const matchType =
      selectedType.value === "ALL" ||
      validation.targetType === selectedType.value;

    const matchStatus =
      selectedStatus.value === "ALL" ||
      validation.status === selectedStatus.value;

    return matchSearch && matchType && matchStatus;
  });
});

const handleView = async (validation) => {
  /* BACKEND PLUS TARD :
    selectedValidation.value = await getValidationDetails(validation.id);
  */

  selectedValidation.value = validation;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedValidation.value = null;
};
//fct pour updater le statut de validations
const updateValidationStatus = (id, status) => {
  validations.value = validations.value.map((validation) =>
    validation.id === id
      ? { ...validation, status }
      : validation
  );
  if (selectedValidation.value?.id === id) {
    selectedValidation.value = {
      ...selectedValidation.value,
      status,
    };
  }
};

const handleApprove = async (validation) => {
  if (!confirm("Voulez-vous approuver cette validation ?")) return;
  /*BACKEND PLUS TARD :
    await approveValidation(validation.id);
    await fetchValidations();
    return;*/
  updateValidationStatus(validation.id, "APPROVED");
};

const handleReject = async (validation) => {
  const comment = prompt("Motif du refus :");
  if (!comment) return;
  /*BACKEND PLUS TARD :
    await rejectValidation(validation.id, { comment });
    await fetchValidations();
    return; */
  updateValidationStatus(validation.id, "REJECTED");
};

const handleRequestChanges = async (validation) => {
  const comment = prompt("Quelle correction demander à l’étudiant ?");
  if (!comment) return;
  /*BACKEND PLUS TARD :
    await requestValidationChanges(validation.id, { comment });
    await fetchValidations();
    return; */
  updateValidationStatus(validation.id, "CHANGES_REQUESTED");
};
</script>

<template>
  <section class="validations-page">
    <header class="page-header">
      <div>
        <span>ADMINISTRATION</span>
        <h1>Centre de validations</h1>
        <p>Examinez et validez les soumissions des étudiants</p>
      </div>
    </header>

    <ValidationStats :stats="stats" />

    <section class="table-card">
      <ValidationToolbar
        v-model:search="search"
        v-model:selected-type="selectedType"
        v-model:selected-status="selectedStatus"
        />

      <div v-if="loading" class="state-box">
        Chargement des validations...
      </div>

      <div v-else-if="error" class="state-box error">
        {{ error }}
      </div>

      <ValidationsTable
        v-else
        :validations="filteredValidations"
        @view="handleView"
        @approve="handleApprove"
        @reject="handleReject"
        @request-changes="handleRequestChanges"
      />
    </section>

    <ValidationDetailsModal
      v-if="showDetailsModal"
      :validation="selectedValidation"
      @close="closeDetailsModal"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </section>
</template>

<style scoped>
.validations-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.page-header span {
  display: block;
  margin-bottom: 6px;
  color: #8b8f8c;
  font-size: 0.8rem;
  font-style: italic;
  letter-spacing: 0.04em;
}

.page-header h1 {
  margin: 0;
  color: #0f2f3a;
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 800;
  line-height: 1.1;
}

.page-header p {
  margin-top: 8px;
  color: #8aa0a3;
  font-size: 1.05rem;
  font-style: italic;
}

.table-card {
  background: #ffffff;
  border: 1px solid #dfe3dd;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
}

.state-box {
  padding: 22px;
  border-radius: 16px;
  background: #fbfaf7;
  border: 1px solid #dfe3dd;
  color: #6b7280;
  text-align: center;
}

.error {
  color: #dc2626;
}
</style>