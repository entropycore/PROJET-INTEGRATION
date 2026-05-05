<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getAdminUsers,
  getAdminUserById,
  deleteUser,
  resetUserPassword,
  approveProfessionalRequest,
  rejectProfessionalRequest
} from '../../services/adminService'

import '../../assets/styles/admin-users.css'

const route = useRoute()
const router = useRouter()

const users = ref([])
const loading = ref(false)
const error = ref(null)

const search = ref('')
const selectedRole = computed(() => route.query.role || '')
const selectedStatus = ref('')

const selectedUser = ref(null)
const selectedProfessionalRequest = ref(null)
const modalMode = ref(null)

const currentPage = ref(1)
const limit = ref(10)

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
})

let searchTimeout = null
//remove later!!
const mockUsers = [
  {
    id: 1,
    firstName: 'Sara',
    lastName: 'Bensaid',
    email: 'sara.bensaid@accenture.com',
    phone: '0600000000',
    profilePicture: null,
    role: 'PROFESSIONAL',
    accountStatus: 'PENDING',
    emailVerified: true,
    createdAt: '2026-05-02T10:00:00.000Z',
    lastLoginAt: null,
  },
  {
    id: 2,
    firstName: 'Hossam',
    lastName: 'Ouammi',
    email: 'hossam@example.com',
    phone: '0611111111',
    profilePicture: null,
    role: 'STUDENT',
    accountStatus: 'ACTIVE',
    emailVerified: true,
    createdAt: '2026-04-20T10:00:00.000Z',
    lastLoginAt: '2026-05-02T12:00:00.000Z',
  },
  {
    id: 3,
    firstName: 'Ahmed',
    lastName: 'Benali',
    email: 'ahmed@ensa.tanger.ma',
    phone: '0622222222',
    profilePicture: null,
    role: 'PROFESSOR',
    accountStatus: 'ACTIVE',
    emailVerified: true,
    createdAt: '2026-03-12T10:00:00.000Z',
    lastLoginAt: '2026-05-01T09:30:00.000Z',
  },
  {
    id: 4,
    firstName: 'Nour',
    lastName: 'Alaoui',
    email: 'nour.alaoui@example.com',
    phone: '0633333333',
    profilePicture: null,
    role: 'STUDENT',
    accountStatus: 'SUSPENDED',
    emailVerified: false,
    createdAt: '2026-02-10T10:00:00.000Z',
    lastLoginAt: '2026-05-05T16:50:00.000Z',
  },
]

const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await getAdminUsers({
      page: currentPage.value,
      limit: limit.value,
      search: search.value || undefined,
      role: selectedRole.value || undefined,
      status: selectedStatus.value || undefined,
    })

    users.value = res.data.data.items
    pagination.value = res.data.data.pagination
  } catch (err) {
    let filtered = [...mockUsers]

    if (search.value) {
    const q = search.value.toLowerCase()
    filtered = filtered.filter((user) => {
        const name = `${user.firstName} ${user.lastName}`.toLowerCase()
        return name.includes(q) || user.email.toLowerCase().includes(q)
    })
    }

    if (selectedRole.value) {
    filtered = filtered.filter((user) => user.role === selectedRole.value)
    }

    if (selectedStatus.value) {
      filtered = filtered.filter(
        (user) => user.accountStatus === selectedStatus.value
      )
    }

    users.value = filtered
    pagination.value = {
      page: 1,
      limit: filtered.length,
      total: filtered.length,
      totalPages: 1,
    }} finally {
        loading.value = false
      }
    }

onMounted(fetchUsers)

watch(
  () => route.query.role,
  () => {
    currentPage.value = 1
    fetchUsers()
  }
)

watch(selectedStatus, () => {
  currentPage.value = 1
  fetchUsers()
})

watch(search, () => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchUsers()
  }, 400)
})

const fullName = (user) => {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim()
}

const initials = (user) => {
  const first = user.firstName?.charAt(0) || ''
  const last = user.lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase() 
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatLastActive = (date) => {
  if (!date) return 'Jamais'

  const now = new Date()
  const past = new Date(date)

  const diff = Math.floor((now - past) / 1000) // en secondes

  if (diff < 60) return 'à l\'instant'

  const minutes = Math.floor(diff / 60)
  if (minutes < 60) return `il y a ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days} j`

  // fallback si c’est trop ancien
  return past.toLocaleDateString('fr-FR')
}

const statusLabel = (status) => {
  const map = {
    ACTIVE: 'Active',
    PENDING: 'Pending',
    SUSPENDED: 'Suspended',
    INACTIVE: 'Inactive',
  }

  return map[status] || status
}

const goToPreviousPage = () => {
  if (currentPage.value <= 1) return
  currentPage.value--
  fetchUsers()
}

const goToNextPage = () => {
  if (currentPage.value >= pagination.value.totalPages) return
  currentPage.value++
  fetchUsers()
}

const handleNewUser = () => {
  router.push('/admin/users/create')
}

const handleExport = () => {
  console.log('Export users')
}

const openMenuId = ref(null)

const toggleActionsMenu = (userId) => {
  openMenuId.value = openMenuId.value === userId ? null : userId
}

const isPendingProfessional = (user) => {
  return user.role === 'PROFESSIONAL' && user.accountStatus === 'PENDING'
}

const handleEditUser = (user) => {
  router.push(`/admin/users/${user.id}/edit`)
  openMenuId.value = null
}

const handleApproveUser = async (user) => {
  try {
    await approveProfessionalRequest(user.id)
    await fetchUsers()
  } catch (err) {
    console.error('Erreur acceptation recruiter:', err)
  } finally {
    openMenuId.value = null
  }
}

const handleRejectUser = async (user) => {
  try {
    await rejectProfessionalRequest(user.id)
    await fetchUsers()
  } catch (err) {
    console.error('Erreur rejet recruiter:', err)
  } finally {
    openMenuId.value = null
  }
}

const handleViewUser = (user) => {
  router.push(`/admin/users/${user.id}`)
  openMenuId.value = null
}


const handleResetPassword = async (user) => {
  try {
    await resetUserPassword(user.id)
  } catch (err) {
    console.error('Erreur reset password:', err)
  } finally {
    openMenuId.value = null
  }
}

const handleDeleteUser = async (user) => {
  try {
    await deleteUser(user.id)
    await fetchUsers()
  } catch (err) {
    console.error('Erreur suppression user:', err)
  } finally {
    openMenuId.value = null
  }
}

const pageTitle = computed(() => {
  switch (selectedRole.value) {
    case 'STUDENT':
      return 'Gestion des étudiants'
    case 'PROFESSOR':
      return 'Gestion des professeurs'
    case 'PROFESSIONAL':
      return 'Gestion des recruteurs'
    default:
      return 'Gestion des utilisateurs'
  }
})

const dynamicColumns = computed(() => {
  const columns = ['User', 'Email', 'Phone']

  if (selectedRole.value === 'STUDENT') {
    columns.push('Major', 'Level')
  }

  if (selectedRole.value === 'PROFESSOR') {
    columns.push('Department', 'Specialty')
  }

  if (selectedRole.value === 'PROFESSIONAL') {
    columns.push('Company', 'Job Title')
  }

  columns.push('Status', 'Registered', 'Last Active', 'Actions')

  return columns
})

</script>

<template>
  <section class="admin-users-page">
    <div class="users-page-header">
      <div>
        <p class="admin-kicker">USER MANAGEMENT</p>
        <h1>{{ pageTitle }}</h1>
        <p class="admin-subtitle">Gérez les comptes, rôles et statuts des utilisateurs.</p>
      </div>
    </div>

    <section class="users-table-card">
      <div class="users-toolbar">
        <div class="users-search">
          <img src='../../assets/icons/search.svg' />
          <input
            v-model="search"
            type="text"
            placeholder="Search by name or email..."
          />
        </div>

        <select v-model="selectedStatus">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button class="primary-action" type="button" @click="handleNewUser">
          + New User
        </button>

        <button class="secondary-action" type="button" @click="handleExport">
          Export
        </button>
      </div>

      <div v-if="loading" class="users-state">
        Chargement des utilisateurs...
      </div>

      <div v-else-if="error" class="users-state error">
        {{ error }}
      </div>

      <div v-else class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th v-for="column in dynamicColumns" :key="column">
                {{ column }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <img
                    v-if="user.profilePicture"
                    :src="user.profilePicture"
                    class="user-avatar-img"
                    alt=""
                  />

                  <div v-else class="user-avatar">
                    {{ initials(user) }}
                  </div>

                  <strong>{{ fullName(user) }}</strong>
                </div>
              </td>

              <td>{{ user.email }}</td>
              <td>{{ user.phone || '—' }}</td>

              <template v-if="selectedRole === 'STUDENT'">
                <td>{{ user.roleDetails?.major || '—' }}</td>
                <td>{{ user.roleDetails?.level || '—' }}</td>
              </template>

              <template v-if="selectedRole === 'PROFESSOR'">
                <td>{{ user.roleDetails?.department || '—' }}</td>
                <td>{{ user.roleDetails?.specialty || '—' }}</td>
              </template>

              <template v-if="selectedRole === 'PROFESSIONAL'">
                <td>{{ user.roleDetails?.company || '—' }}</td>
                <td>{{ user.roleDetails?.jobTitle || '—' }}</td>
              </template>

              <td>
                <span :class="['status-pill', user.accountStatus?.toLowerCase()]">
                  {{ statusLabel(user.accountStatus) }}
                </span>
              </td>

              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ formatLastActive(user.lastLoginAt) }}</td>

              <td class="actions-cell">
  <div class="actions-dropdown">
    <button
      class="actions-trigger"
      type="button"
      aria-label="Actions utilisateur"
      @click="toggleActionsMenu(user.id)"
    >
       <img src='../../assets/icons/menu.svg' />
    </button>

    <div
      v-if="openMenuId === user.id"
      class="actions-dropdown-menu"
    >
    <button type="button" @click="handleViewUser(user)">
  Voir
</button>

<template v-if="isPendingProfessional(user)">
  <button type="button" @click="handleApproveUser(user)">
    Accepter
  </button>

  <button type="button" class="danger" @click="handleRejectUser(user)">
    Rejeter
  </button>
</template>

<template v-else>
  <button type="button" @click="handleEditUser(user)">
    Modifier
  </button>

  <button type="button" @click="handleResetPassword(user)">
    Reset password
  </button>

  <button type="button" class="danger" @click="handleDeleteUser(user)">
    Supprimer
  </button>
</template>
    </div>
  </div>
</td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="users-state">
          Aucun utilisateur trouvé.
        </div>
      </div>

      <div class="users-pagination">
        <span>
          Showing {{ users.length }} of {{ pagination.total }} users
        </span>

        <div>
          <button
            type="button"
            :disabled="currentPage === 1"
            @click="goToPreviousPage"
          >
            Previous
          </button>

          <button
            type="button"
            :disabled="currentPage >= pagination.totalPages"
            @click="goToNextPage"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  </section>
</template>