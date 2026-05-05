<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getAdminUsers,
  deleteUser,
  resetUserPassword,
  getProfessionalRequests,
  getProfessionalRequestById,
  approveProfessionalRequest,
  rejectProfessionalRequest
} from '../../services/adminService'

import '../../assets/styles/admin-users.css'

const route = useRoute()

const users = ref([])
const loading = ref(false)
const error = ref(null)

const search = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

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
    lastLoginAt: '2026-04-28T15:20:00.000Z',
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

watch([selectedRole, selectedStatus], () => {
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
  return new Date(date).toLocaleString('fr-FR')
}

const roleLabel = (role) => {
  const map = {
    ADMINISTRATOR: 'Admin',
    STUDENT: 'Student',
    PROFESSOR: 'Professor',
    PROFESSIONAL: 'Professional',
  }

  return map[role] || role
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
  console.log('Open create user modal')
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
  console.log('Modifier user:', user)
  openMenuId.value = null
}

const handleApproveUser = (user) => {
  console.log('Accepter demande:', user)
  openMenuId.value = null
}

const handleRejectUser = (user) => {
  console.log('Rejeter demande:', user)
  openMenuId.value = null
}

const handleViewUser = (user) => {
  console.log('View user:', user)
  openMenuId.value = null
}

const handleResetPassword = async (user) => {
  await resetUserPassword(user.id)
  openMenuId.value = null
}

const handleDeleteUser = async (user) => {
  await deleteUser(user.id)
  openMenuId.value = null
  fetchUsers()
}
</script>

<template>
  <section class="admin-users-page">
    <div class="users-page-header">
      <div>
        <p class="admin-kicker">USER MANAGEMENT</p>
        <h1>Gestion des utilisateurs</h1>
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

        <select v-model="selectedRole">
          <option value="">All Roles</option>
          <option value="ADMINISTRATOR">Admin</option>
          <option value="STUDENT">Student</option>
          <option value="PROFESSOR">Professor</option>
          <option value="PROFESSIONAL">Professional</option>
        </select>

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
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Last Active</th>
              <th>Actions</th>
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

              <td>
                <span :class="['role-pill', user.role?.toLowerCase()]">
                  {{ roleLabel(user.role) }}
                </span>
              </td>

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

      <button type="button" @click="handleEditUser(user)">
        Modifier
      </button>

      <template v-if="isPendingProfessional(user)">
        <button type="button" @click="handleApproveUser(user)">
          Accepter
        </button>

        <button type="button" class="danger" @click="handleRejectUser(user)">
          Rejeter
        </button>
      </template>

      <button type="button" @click="handleResetPassword(user)">
        Reset password
      </button>

      <button type="button" class="danger" @click="handleDeleteUser(user)">
        Supprimer
      </button>
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