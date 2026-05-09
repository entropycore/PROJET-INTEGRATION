<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  getMySkills,
  addSkill,
  deleteSkill,
  getSkillsCatalog,
  getSoftSkills,
  addSoftSkill,
  deleteSoftSkill,
} from '../../services/studentSkillsService'

const mySkills = ref([])
const softSkills = ref([])
const catalog = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const showAddSkill = ref(false)
const showAddSoft = ref(false)
const newSoftName = ref('')
const searchQuery = ref('')
const selectedCategory = ref('all')

const newSkill = ref({
  skillId: '',
  level: 50,
  source: '',
})

const categories = [
  { value: 'all', label: 'Toutes' },
  { value: 'TECHNICAL', label: 'Techniques' },
  { value: 'FRAMEWORK', label: 'Frameworks' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'DATABASE', label: 'Bases de données' },
]

const mockSkills = [
  { id: '1', name: 'Node.js', level: 80, source: 'Projet Integration', type: 'TECHNICAL' },
  { id: '2', name: 'Vue.js', level: 70, source: 'Projet Integration', type: 'FRAMEWORK' },
  { id: '3', name: 'PostgreSQL', level: 65, source: 'Cours BD', type: 'DATABASE' },
  { id: '4', name: 'Docker', level: 60, source: 'Projet DevOps', type: 'DEVOPS' },
  { id: '5', name: 'Express.js', level: 75, source: 'Projet Integration', type: 'FRAMEWORK' },
]

const mockSoftSkills = [
  { id: '1', name: 'Travail en équipe' },
  { id: '2', name: 'Communication' },
  { id: '3', name: 'Organisation' },
]

const loadAll = async () => {
  isLoading.value = true
  try {
    const [skillsRes, softRes] = await Promise.all([
      getMySkills(),
      getSoftSkills(),
    ])
    mySkills.value = skillsRes.data || []
    softSkills.value = softRes.data || []
  } catch {
    mySkills.value = mockSkills
    softSkills.value = mockSoftSkills
  } finally {
    isLoading.value = false
  }
}

const loadCatalog = async () => {
  try {
    const res = await getSkillsCatalog(searchQuery.value)
    catalog.value = res.data || []
  } catch {
    catalog.value = [
      { id: 'c1', name: 'React', type: 'FRAMEWORK' },
      { id: 'c2', name: 'Python', type: 'TECHNICAL' },
      { id: 'c3', name: 'MongoDB', type: 'DATABASE' },
      { id: 'c4', name: 'Kubernetes', type: 'DEVOPS' },
    ]
  }
}

const filteredSkills = computed(() => {
  if (selectedCategory.value === 'all') return mySkills.value
  return mySkills.value.filter(s => s.type === selectedCategory.value)
})

const handleAddSkill = async () => {
  if (!newSkill.value.skillId) return
  try {
    await addSkill(newSkill.value)
    showAddSkill.value = false
    newSkill.value = { skillId: '', level: 50, source: '' }
    await loadAll()
  } catch {
    errorMessage.value = 'Erreur lors de l\'ajout.'
  }
}

const handleDeleteSkill = async (id) => {
  try {
    await deleteSkill(id)
    await loadAll()
  } catch {
    errorMessage.value = 'Erreur lors de la suppression.'
  }
}

const handleAddSoft = async () => {
  if (!newSoftName.value.trim()) return
  try {
    await addSoftSkill({ name: newSoftName.value })
    newSoftName.value = ''
    showAddSoft.value = false
    await loadAll()
  } catch {
    errorMessage.value = 'Erreur lors de l\'ajout.'
  }
}

const handleDeleteSoft = async (id) => {
  try {
    await deleteSoftSkill(id)
    await loadAll()
  } catch {
    errorMessage.value = 'Erreur lors de la suppression.'
  }
}

const getLevelColor = (level) => {
  if (level >= 80) return '#2F575D'
  if (level >= 60) return '#6D9197'
  return '#99AEAD'
}

const getLevelLabel = (level) => {
  if (level >= 80) return 'Avancé'
  if (level >= 60) return 'Intermédiaire'
  return 'Débutant'
}

const openAddSkill = async () => {
  showAddSkill.value = true
  await loadCatalog()
}

onMounted(loadAll)
</script>

<template>
  <div class="skills-page">

    <div class="page-header">
      <div>
        <h1>Compétences</h1>
        <div class="sub">Compétences techniques et comportementales</div>
      </div>
      <button class="btn btn-primary" @click="openAddSkill">
        <span class="material-icons-round">add</span>
        Ajouter une compétence
      </button>
    </div>

    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    <p v-if="isLoading" class="text-muted">Chargement...</p>

    <div v-if="!isLoading">

      <!-- Formulaire ajout compétence technique -->
      <div v-if="showAddSkill" class="content-card add-form-card">
        <h3 class="card-title">Ajouter une compétence technique</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Compétence</label>
            <select v-model="newSkill.skillId" class="form-select">
              <option value="">Sélectionner...</option>
              <option v-for="item in catalog" :key="item.id" :value="item.id">
                {{ item.name }} — {{ item.type }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Source</label>
            <input v-model="newSkill.source" type="text" placeholder="Ex: Projet Integration" />
          </div>
        </div>
        <div class="form-group">
          <label>Niveau : {{ newSkill.level }}%</label>
          <input v-model="newSkill.level" type="range" min="0" max="100" class="range-input" />
          <div class="range-labels">
            <span>Débutant</span>
            <span>Intermédiaire</span>
            <span>Avancé</span>
          </div>
        </div>
        <div class="flex-gap">
          <button class="btn btn-primary btn-sm" @click="handleAddSkill">Ajouter</button>
          <button class="btn btn-secondary btn-sm" @click="showAddSkill = false">Annuler</button>
        </div>
      </div>

      <!-- Compétences techniques -->
      <div class="content-card">
        <div class="flex-between mb-16">
          <h3 class="card-title" style="margin:0">Compétences techniques</h3>
          <div class="chips-row">
            <span
              v-for="cat in categories"
              :key="cat.value"
              class="filter-chip"
              :class="{ active: selectedCategory === cat.value }"
              @click="selectedCategory = cat.value"
            >
              {{ cat.label }}
            </span>
          </div>
        </div>

        <div v-if="filteredSkills.length > 0" class="skills-grid">
          <div v-for="skill in filteredSkills" :key="skill.id" class="skill-card">
            <div class="skill-header">
              <div>
                <div class="skill-name">{{ skill.name }}</div>
                <div class="skill-source">{{ skill.source }}</div>
              </div>
              <div class="skill-right">
                <span class="level-badge" :style="{ background: getLevelColor(skill.level) + '20', color: getLevelColor(skill.level) }">
                  {{ getLevelLabel(skill.level) }}
                </span>
                <button class="icon-btn" @click="handleDeleteSkill(skill.id)" title="Supprimer">
                  <span class="material-icons-round">close</span>
                </button>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: skill.level + '%', background: getLevelColor(skill.level) }"></div>
            </div>
            <div class="progress-value">{{ skill.level }}%</div>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="material-icons-round">code</span>
          <h4>Aucune compétence technique</h4>
          <p>Ajoutez vos compétences pour enrichir votre profil.</p>
        </div>
      </div>

      <!-- Soft skills -->
      <div class="content-card">
        <div class="flex-between mb-16">
          <h3 class="card-title" style="margin:0">Compétences comportementales</h3>
          <button class="btn btn-secondary btn-sm" @click="showAddSoft = !showAddSoft">
            <span class="material-icons-round">add</span>
            Ajouter
          </button>
        </div>

        <div v-if="showAddSoft" class="flex-gap mb-16">
          <input
            v-model="newSoftName"
            type="text"
            placeholder="Ex: Leadership"
            class="skill-input"
          />
          <button class="btn btn-primary btn-sm" @click="handleAddSoft">OK</button>
          <button class="btn btn-secondary btn-sm" @click="showAddSoft = false">✕</button>
        </div>

        <div v-if="softSkills.length > 0" class="soft-grid">
          <div v-for="skill in softSkills" :key="skill.id" class="soft-card">
            <span class="material-icons-round check-icon">check_circle</span>
            <span class="soft-name">{{ skill.name }}</span>
            <button class="icon-btn" @click="handleDeleteSoft(skill.id)" title="Supprimer">
              <span class="material-icons-round">close</span>
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="material-icons-round">psychology</span>
          <h4>Aucune compétence comportementale</h4>
          <p>Ajoutez vos soft skills pour compléter votre profil.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.skills-page { font-family: 'DM Sans', sans-serif; color: #28363D; }

.page-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px }
.page-header h1 { font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;color:#28363D;line-height:1.2 }
.sub { font-size:13px;color:#99AEAD;margin-top:3px;font-style:italic }

.content-card { background:#fff;border:1px solid #DEE1DD;border-radius:12px;padding:20px;margin-bottom:16px }
.card-title { font-size:15px;color:#28363D;font-family:'DM Serif Display',serif;font-weight:400;margin-bottom:12px }
.add-form-card { border-color:#2F575D;border-style:dashed }

.chips-row { display:flex;flex-wrap:wrap;gap:6px }
.filter-chip { padding:5px 12px;border-radius:20px;border:1px solid #C4CDC1;font-size:12px;cursor:pointer;color:#6D9197;transition:all .15s }
.filter-chip:hover { border-color:#6D9197 }
.filter-chip.active { background:#2F575D;color:#fff;border-color:#2F575D }

.skills-grid { display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px }
.skill-card { background:#F8F9F8;border:1px solid #DEE1DD;border-radius:10px;padding:16px }
.skill-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px }
.skill-name { font-size:14px;font-weight:500;color:#28363D }
.skill-source { font-size:12px;color:#99AEAD;margin-top:2px }
.skill-right { display:flex;align-items:center;gap:6px }
.level-badge { padding:3px 8px;border-radius:20px;font-size:11px;font-weight:500 }
.progress-bar { height:6px;background:#DEE1DD;border-radius:3px;overflow:hidden;margin-bottom:4px }
.progress-fill { height:100%;border-radius:3px;transition:width .3s }
.progress-value { font-size:11.5px;color:#99AEAD;text-align:right }

.soft-grid { display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:10px }
.soft-card { display:flex;align-items:center;gap:8px;background:#F8F9F8;border:1px solid #DEE1DD;border-radius:8px;padding:10px 14px }
.check-icon { font-size:18px;color:#2F575D }
.soft-name { flex:1;font-size:13.5px;color:#28363D;font-weight:500 }

.icon-btn { background:none;border:none;cursor:pointer;color:#99AEAD;padding:2px;display:flex;align-items:center;transition:color .15s }
.icon-btn:hover { color:#C0392B }
.icon-btn .material-icons-round { font-size:16px }

.form-group { margin-bottom:16px }
.form-group label { display:block;font-size:12.5px;font-weight:500;color:#6D9197;margin-bottom:5px }
.form-group input,
.form-group textarea { width:100%;padding:9px 12px;border:1px solid #C4CDC1;border-radius:8px;background:#fff;font-family:'DM Sans',sans-serif;font-size:13.5px;color:#28363D;outline:none;transition:border-color .2s;box-sizing:border-box }
.form-group input:focus { border-color:#2F575D }
.form-select { width:100%;padding:9px 12px;border:1px solid #C4CDC1;border-radius:8px;background:#fff;font-family:'DM Sans',sans-serif;font-size:13.5px;color:#28363D;outline:none;cursor:pointer }
.form-select:focus { border-color:#2F575D }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:16px }

.range-input { width:100%;accent-color:#2F575D;cursor:pointer }
.range-labels { display:flex;justify-content:space-between;font-size:11px;color:#99AEAD;margin-top:4px }

.skill-input { flex:1;padding:7px 10px;border:1px solid #C4CDC1;border-radius:8px;font-size:13px;outline:none;font-family:'DM Sans',sans-serif;color:#28363D;background:#fff }
.skill-input:focus { border-color:#2F575D }

.empty-state { text-align:center;padding:40px 24px;color:#99AEAD }
.empty-state .material-icons-round { font-size:48px;color:#C4CDC1;margin-bottom:12px;display:block }
.empty-state h4 { font-size:16px;color:#6D9197;font-weight:500;margin-bottom:6px }
.empty-state p { font-size:13px }

.btn { display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .15s }
.btn-primary { background:#2F575D;color:#fff;border-color:#2F575D }
.btn-primary:hover { background:#245055 }
.btn-secondary { background:#fff;color:#2F575D;border-color:#C4CDC1 }
.btn-secondary:hover { background:#F8F9F8 }
.btn-sm { padding:6px 12px;font-size:12.5px }
.btn .material-icons-round { font-size:16px }

.flex-between { display:flex;align-items:center;justify-content:space-between }
.flex-gap { display:flex;align-items:center;gap:10px }
.mb-16 { margin-bottom:16px }
.text-muted { color:#99AEAD;font-size:13px }
.error-msg { color:#C0392B;font-size:13px;margin-bottom:12px }
</style>