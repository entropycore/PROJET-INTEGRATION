# 🛠️ GUIDE D'UTILISATION - PROJET-INTEGRATION

Guide pratique pour développer, tester et déployer le projet.

---

## 🚀 Démarrage rapide

### 1. Configuration initiale

```bash
# Clone repository
git clone <repository-url>
cd PROJET-INTEGRATION

# Setup environment
cp .env.example .env

# Edit .env with your local values
# Minimums:
# - DB_USER, DB_PASSWORD, DB_NAME
# - EMAIL_USER, EMAIL_PASS (for testing)
# - JWT secrets (can be any random string)
```

### 2. Démarrer l'environnement de développement

```bash
# Start all services (db, backend, frontend)
docker-compose -f docker-compose.dev.yml up

# Or with rebuild (if Docker images changed)
docker-compose -f docker-compose.dev.yml up --build

# Access:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - Database: localhost:5433 (from host machine)

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f db
```

### 3. Arrêter les services

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: deletes database!)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 💻 Développement Backend

### Fichier principal
- **Entry point:** `backend/src/server.js`
- **Configuration:** Environment variables via `.env`
- **Port:** 3000 (configurable via `BACKEND_PORT`)

### Structure des fichiers

```bash
backend/
├── src/
│   ├── controllers/    # HTTP request handlers
│   ├── services/       # Business logic
│   ├── routes/         # API routes
│   ├── middlewares/    # Express middleware
│   ├── config/         # Configuration (Prisma client)
│   ├── logs/           # Logging setup
│   ├── utils/          # Helper functions
│   └── server.js       # Main app
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Database migrations
│   └── seed.js         # Database seeding
└── tests/              # Test files
    ├── unit/           # Unit tests
    └── integration/    # Integration tests
```

### Développement & Debugging

```bash
# Access backend container
docker exec -it dev_back bash

# View live logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Run backend tests
docker exec -it dev_back npm test
docker exec -it dev_back npm run test:unit
docker exec -it dev_back npm run test:integration
docker exec -it dev_back npm run test:coverage

# Run linter
docker exec -it dev_back npm run lint

# Format code with Prettier
docker exec -it dev_back npm run format

# Database operations
docker exec -it dev_back npx prisma migrate dev
docker exec -it dev_back npx prisma studio           # GUI tool
docker exec -it dev_back npx prisma db seed          # Seed data
docker exec -it dev_back npx prisma generate         # Generate client
```

### Accéder à la base de données

```bash
# From host machine (port 5433 exposed)
psql -h localhost -U postgres -d portfolio_db -p 5433
# Password: mot_de_passe (from .env)

# Or via Docker container
docker exec -it base_donnees psql -U postgres -d portfolio_db

# Useful psql commands
\dt                    # List tables
\d table_name          # Describe table
SELECT * FROM users;   # Query data
```

### Prisma - ORM Management

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# View database GUI
npx prisma studio

# Reset database (dev only!)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Check migration status
npx prisma migrate status
```

### Common Backend Tasks

```bash
# Add new dependency
docker exec -it dev_back npm install package-name

# Add new middleware
# 1. Create backend/src/middlewares/yourMiddleware.js
# 2. Import in backend/src/server.js
# 3. app.use(yourMiddleware)

# Add new route
# 1. Create backend/src/routes/yourRoutes.js
# 2. Create backend/src/controllers/yourController.js
# 3. Create backend/src/services/yourService.js
# 4. Import routes in backend/src/server.js

# Add new database model
# 1. Edit backend/prisma/schema.prisma
# 2. Run: npx prisma migrate dev --name add_model_name
# 3. Access via PrismaClient in services
```

---

## 🎨 Développement Frontend

### Fichier principal
- **Entry point:** `frontend/src/main.js`
- **Root component:** `frontend/src/App.vue`
- **Router config:** `frontend/src/router/index.js`
- **Port:** 5173 (configurable via `FRONTEND_PORT`)

### Structure des fichiers

```bash
frontend/
├── src/
│   ├── components/     # Reusable Vue components
│   ├── views/          # Page components (routed)
│   ├── services/       # API client services
│   ├── stores/         # Pinia state stores
│   ├── router/         # Vue Router configuration
│   ├── config/         # Frontend configuration
│   ├── layouts/        # Layout components
│   ├── assets/         # Images, icons, styles
│   ├── mockData/       # Mock data for development
│   ├── tests/          # Test files
│   ├── main.js         # Entry point
│   └── App.vue         # Root component
├── public/             # Static assets
├── vite.config.js      # Vite configuration
├── index.html          # HTML template
└── package.json        # Dependencies
```

### Développement & Debugging

```bash
# Access frontend container
docker exec -it dev_front bash

# View live logs
docker-compose -f docker-compose.dev.yml logs -f frontend

# Run frontend tests
docker exec -it dev_front npm test
docker exec -it dev_front npm run test                # Vitest
docker exec -it dev_front npm run lint               # ESLint
docker exec -it dev_front npm run format             # Prettier

# Build for production
docker exec -it dev_front npm run build              # Creates dist/
```

### Vue.js Development

```bash
# Add new Vue component
# 1. Create frontend/src/components/YourComponent.vue
# 2. Use in parent: import YourComponent from '@/components/YourComponent.vue'

# Add new route/page
# 1. Create frontend/src/views/YourPage.vue
# 2. Add route in frontend/src/router/index.js:
#    { path: '/your-page', component: YourPage }
# 3. Navigate with: <router-link to="/your-page">

# Add API service
# 1. Create frontend/src/services/yourApi.js
# 2. Use in components: import { apiFunction } from '@/services/yourApi.js'
# 3. Call: const data = await apiFunction()

# Add Pinia store
# 1. Create frontend/src/stores/yourStore.js
# 2. Define state, getters, actions
# 3. Use in components: import { useYourStore } from '@/stores/yourStore'

# Common Vue 3 patterns
<template>
  <!-- Template with v-if, v-for, v-bind, @click, etc -->
</template>

<script setup>
import { ref, computed } from 'vue'

// Reactive data
const count = ref(0)

// Computed properties
const doubled = computed(() => count.value * 2)

// Methods
const increment = () => count.value++
</script>

<style scoped>
/* Component styles */
</style>
```

### Frontend API Integration

```javascript
// File: frontend/src/services/api.js
// Base axios instance already configured

import api from '@/services/api'

// GET request
const getPortfolio = async (studentId) => {
  const response = await api.get(`/student/portfolio/${studentId}`)
  return response.data
}

// POST request
const updatePortfolio = async (data) => {
  const response = await api.patch('/student/portfolio', data)
  return response.data
}

// File upload (multipart)
const uploadProfilePicture = async (file) => {
  const formData = new FormData()
  formData.append('profilePicture', file)
  const response = await api.post('/student/profile-picture', formData)
  return response.data
}

// Use in component
import { updatePortfolio } from '@/services/studentPortfolioService'
const handleSave = async () => {
  const result = await updatePortfolio({ title: 'New Title' })
  console.log(result)
}
```

---

## 🧪 Tests & QA

### Backend Testing

```bash
# Run all tests with Jest
docker exec -it dev_back npm test

# Unit tests only
docker exec -it dev_back npm run test:unit

# Integration tests only
docker exec -it dev_back npm run test:integration

# Security tests
docker exec -it dev_back npm run test:sec

# Watch mode (rerun on file changes)
docker exec -it dev_back npm run test:watch

# Coverage report
docker exec -it dev_back npm run test:coverage
# Reports in: backend/coverage/

# Run specific test file
docker exec -it dev_back npm test authController.test.js
```

### Frontend Testing

```bash
# Run all Vitest tests
docker exec -it dev_front npm test

# Watch mode
docker exec -it dev_front npm test -- --watch

# UI mode (visual test runner)
docker exec -it dev_front npm test -- --ui

# Coverage
docker exec -it dev_front npm test -- --coverage

# E2E tests with Cypress
docker exec -it dev_front npx cypress open
# Or headless:
docker exec -it dev_front npx cypress run

# Specific Cypress spec
docker exec -it dev_front npx cypress run --spec "cypress/e2e/auth/LoginView.cy.js"
```

### Writing Tests

```javascript
// Backend - Jest example (backend/tests/unit/middlewares/example.test.js)
describe('exampleMiddleware', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})

// Frontend - Vitest example (frontend/src/tests/test-unitaire/example.spec.js)
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: { msg: 'Hello' }
    })
    expect(wrapper.text()).toContain('Hello')
  })
})

// Frontend - Cypress E2E example (qa/cypress/e2e/auth/LoginView.cy.js)
describe('Login View', () => {
  it('logs in with valid credentials', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

---

## 🔒 Sécurité & Linting

### Code Quality

```bash
# Lint backend
docker exec -it dev_back npm run lint

# Lint frontend
docker exec -it dev_front npm run lint

# Format backend
docker exec -it dev_back npm run format

# Format frontend
docker exec -it dev_front npm run format

# Fix linting issues automatically
docker exec -it dev_back npx eslint . --fix
docker exec -it dev_front npx eslint . --fix
```

### Security Scanning

```bash
# Run npm audit
docker exec -it dev_back npm audit
docker exec -it dev_front npm audit

# Update vulnerable packages
docker exec -it dev_back npm audit fix
docker exec -it dev_front npm audit fix

# Run OWASP ZAP scanning (if container exists)
docker exec -it security_stack bash scripts/zap-scan.sh

# Run Trivy image scanning
trivy image credencia-backend:latest
trivy image credencia-frontend:latest
```

---

## 🚀 Déploiement

### Production Build

```bash
# Build frontend
docker exec -it dev_front npm run build
# Output: frontend/dist/

# Backend is always ready (just needs npm start)

# Build Docker images
docker build -f backend/Dockerfile -t credencia-backend:1.0.0 .
docker build -f frontend/Dockerfile -t credencia-frontend:1.0.0 .

# Tag for registry
docker tag credencia-backend:1.0.0 registry.example.com/credencia-backend:1.0.0
docker tag credencia-frontend:1.0.0 registry.example.com/credencia-frontend:1.0.0

# Push to registry
docker push registry.example.com/credencia-backend:1.0.0
docker push registry.example.com/credencia-frontend:1.0.0
```

### Deploying with Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With environment variables
BACKEND_PORT=3000 FRONTEND_PORT=80 \
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Database Migrations in Production

```bash
# Before deploying new backend version:
docker exec container_name npx prisma migrate deploy

# Check migration status
docker exec container_name npx prisma migrate status

# Verify database schema
docker exec container_name npx prisma db push --force-reset # Use with caution!
```

---

## 📊 Monitoring & Logs

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f db

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 backend

# Follow in real-time
docker-compose -f docker-compose.dev.yml logs -f
```

### Database Health

```bash
# Check PostgreSQL status
docker exec -it base_donnees pg_isready -U postgres

# Backup database
docker exec -it base_donnees pg_dump -U postgres portfolio_db > backup.sql

# Restore database
docker exec -i base_donnees psql -U postgres portfolio_db < backup.sql
```

### Application Health

```bash
# Health check endpoint
curl http://localhost:3000/

# Check if frontend is responding
curl -I http://localhost:5173/

# Check backend with auth
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

---

## 🐛 Debugging & Troubleshooting

### Common Issues

```bash
# Container won't start
docker-compose -f docker-compose.dev.yml logs backend
# Check for port conflicts, env vars, permissions

# Database connection error
# Ensure DB_* variables in .env match docker-compose
# Wait for health check: docker-compose ps

# Frontend can't reach backend
# Check VITE_API_BASE_URL environment variable
# Ensure backend is running: curl http://localhost:3000

# Permission denied on uploads folder
docker exec -it dev_back ls -la /app/uploads
sudo chown -R 1000:1000 backend/uploads  # Fix locally

# Node modules issues
docker-compose down -v
docker-compose up --build
```

### Debug Mode

```bash
# Backend with debug logging
DEBUG=* docker-compose -f docker-compose.dev.yml up backend

# Frontend dev tools
# Open http://localhost:5173 and use browser DevTools

# Database queries (Prisma logging)
# Set: export DEBUG="prisma:*"
# Or add to .env: DEBUG=prisma:*

# Node debugger
# Add 'debugger;' in code
# Run: node --inspect-brk src/server.js
# Connect: chrome://inspect
```

---

## 📚 Fichiers Configuration Importants

| Fichier | Purpose | Modification |
|---------|---------|--------------|
| `.env` | Environment variables | Customize per environment |
| `docker-compose.dev.yml` | Local development stack | Rarely modify |
| `docker-compose.prod.yml` | Production stack | Customize for your infra |
| `backend/prisma/schema.prisma` | Database schema | When adding models |
| `frontend/src/router/index.js` | Frontend routes | Add new pages |
| `backend/src/server.js` | Express app setup | Add global middlewares |
| `frontend/src/main.js` | Vue app setup | Configure plugins |
| `.env.example` | Template variables | Update when adding new vars |

---

## 🎯 Workflow Typique d'une Feature

### Développement d'une nouvelle feature

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Update database schema if needed
# Edit: backend/prisma/schema.prisma
# Run: docker exec -it dev_back npx prisma migrate dev --name add_new_field

# 3. Implement backend
# Create/edit: backend/src/services/newService.js
# Create/edit: backend/src/controllers/newController.js
# Create/edit: backend/src/routes/newRoutes.js
# Create tests: backend/tests/integration/newRoutes.test.js

# 4. Implement frontend
# Create components: frontend/src/components/NewComponent.vue
# Create service: frontend/src/services/newApi.js
# Create view: frontend/src/views/NewView.vue
# Update router: frontend/src/router/index.js

# 5. Test
docker exec -it dev_back npm test
docker exec -it dev_front npm test

# 6. Lint & format
docker exec -it dev_back npm run lint && npm run format
docker exec -it dev_front npm run lint && npm run format

# 7. Commit & push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 8. Create Pull Request
# GitHub will run CI/CD checks automatically
```

---

## 📖 Références rapides

**Backend:**
- Entry: `backend/src/server.js`
- Routes: `backend/src/routes/`
- Services: `backend/src/services/`
- Controllers: `backend/src/controllers/`
- Schema: `backend/prisma/schema.prisma`
- Tests: `backend/tests/`

**Frontend:**
- Entry: `frontend/src/main.js`
- Router: `frontend/src/router/index.js`
- Components: `frontend/src/components/`
- Views: `frontend/src/views/`
- Services: `frontend/src/services/`
- Stores: `frontend/src/stores/`
- Tests: `frontend/src/tests/`

**Infrastructure:**
- Dev Compose: `docker-compose.dev.yml`
- Prod Compose: `docker-compose.prod.yml`
- Env Template: `.env.example`
- CI/CD: `.github/workflows/`

---

**Guide updated:** 2025  
**For questions:** Refer to code comments and test files for patterns

