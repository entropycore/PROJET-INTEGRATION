# 🗺️ CARTE DE NAVIGATION - PROJET-INTEGRATION

Référence rapide pour naviguer l'architecture du projet.

---

## 📍 Où aller pour...

### Comprendre l'architecture

| Question | Fichier/Dossier |
|----------|-----------------|
| Vue d'ensemble du projet? | README.md |
| Architecture complète? | RAPPORT_EXPLORATION_COMPLET.md |
| Résumé exécutif? | RESUME_EXECUTIVE.md |
| API contract Frontend/Backend? | docs/guides/backend-frontend-upload-contract.md |
| Structure base de données? | backend/prisma/schema.prisma |
| Routes API? | backend/src/routes/ |
| Configuration Docker? | docker-compose.dev.yml |

### Développer une feature

| Type | Emplacement | Exemple |
|------|-------------|---------|
| **Backend - Ajouter route** | backend/src/routes/ | `studentRoutes.js` |
| **Backend - Ajouter contrôleur** | backend/src/controllers/ | `studentController.js` |
| **Backend - Ajouter service** | backend/src/services/ | `studentService.js` |
| **Backend - Ajouter middleware** | backend/src/middlewares/ | `authMiddleware.js` |
| **Frontend - Ajouter composant** | frontend/src/components/ | `Sidebar.vue` |
| **Frontend - Ajouter page** | frontend/src/views/ | `student/Dashboard.vue` |
| **Frontend - Ajouter service API** | frontend/src/services/ | `studentProfileService.js` |
| **Frontend - Ajouter store** | frontend/src/stores/ | `auth.js` |
| **Base de données - Ajouter modèle** | backend/prisma/schema.prisma | User, Student, etc |

### Effectuer une tâche courante

| Tâche | Commande | Fichier |
|------|----------|---------|
| Démarrer dev | `docker-compose -f docker-compose.dev.yml up` | - |
| Créer migration BD | `docker exec dev_back npx prisma migrate dev --name <name>` | backend/prisma/migrations/ |
| Générer client Prisma | `docker exec dev_back npx prisma generate` | backend/src/generated/prisma |
| Voir GUI Prisma | `docker exec dev_back npx prisma studio` | http://localhost:5555 |
| Tests backend | `docker exec dev_back npm test` | backend/tests/ |
| Tests frontend | `docker exec dev_front npm test` | frontend/src/tests/ |
| Linting | `docker exec dev_back npm run lint` | - |
| Formatting | `docker exec dev_back npm run format` | - |

---

## 🎯 Chemins de fichiers clés

### Backend Structure

```
backend/
├── src/server.js                              ← Point d'entrée
├── src/routes/
│   ├── authRoutes.js                         ← Auth endpoints
│   ├── studentRoutes.js                      ← Student endpoints
│   ├── administratorRoutes.js                ← Admin endpoints
│   ├── student/
│   │   ├── profileRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── stageRoutes.js
│   │   ├── skillRoutes.js
│   │   └── [autres routes]
│   └── administrator/
│       ├── userRoutes.js
│       ├── validationRoutes.js
│       └── [autres routes]
├── src/controllers/
│   ├── authController.js
│   ├── studentController.js
│   ├── administratorController.js
│   ├── student/                              ← Sous-contrôleurs
│   │   └── profileController.js
│   └── administrator/
│       └── userController.js
├── src/services/
│   ├── authService.js
│   ├── studentService.js
│   ├── administratorService.js
│   ├── student/
│   │   ├── profileService.js
│   │   ├── skillService.js
│   │   ├── portfolioConfig.js
│   │   └── [autres services]
│   ├── administrator/
│   │   ├── userService.js
│   │   ├── validationService.js
│   │   └── [autres services]
│   └── storage/
│       ├── storageService.js
│       ├── localStorageProvider.js
│       └── s3StorageProvider.js
├── src/middlewares/
│   ├── authMiddleware.js                     ← JWT verification
│   ├── checkRoles.js                         ← RBAC
│   ├── corsOptions.js
│   ├── securityHeaders.js
│   ├── rateLimiter.js
│   ├── sanitize.js
│   ├── handleErrors.js                       ← Error handling
│   └── [autres middlewares]
├── src/config/
│   └── prisma.js                             ← Prisma client
├── src/logs/
│   └── logger.js                             ← Winston config
├── src/utils/
│   ├── generateTokens.js
│   ├── tokenHash.js
│   ├── sendEmail.js
│   └── [helpers]
├── prisma/
│   ├── schema.prisma                         ← ⭐ Database schema
│   ├── seed.js                               ← Init data
│   └── migrations/                           ← Version history
├── tests/
│   ├── unit/middlewares/                     ← Unit tests
│   └── integration/                          ← Integration tests
├── Dockerfile
├── package.json
└── .env.example
```

### Frontend Structure

```
frontend/
├── src/main.js                               ← Point d'entrée
├── src/App.vue                               ← Root component
├── src/router/
│   └── index.js                              ← ⭐ Route definitions
├── src/stores/
│   └── auth.js                               ← Pinia auth store
├── src/components/
│   ├── dashboard/
│   │   ├── Sidebar.vue
│   │   └── Topbar.vue
│   ├── landing/
│   │   ├── HeroSection.vue
│   │   └── [sections]
│   ├── student/
│   │   ├── activities/
│   │   ├── stages/
│   │   └── portfolio/
│   ├── admin/
│   │   ├── validations/
│   │   ├── reports/
│   │   └── [admin components]
│   └── notifications/
│       └── NotificationToolbar.vue
├── src/views/
│   ├── auth/
│   │   ├── LoginView.vue
│   │   ├── RequestAccessView.vue
│   │   └── [auth views]
│   ├── student/
│   │   ├── Dashboard.vue
│   │   ├── Profile.vue
│   │   ├── Portfolio/
│   │   ├── Projects/
│   │   ├── stages/
│   │   ├── Activities.vue
│   │   └── [other views]
│   ├── admin/
│   │   ├── Dashboard.vue
│   │   ├── Users.vue
│   │   ├── Validations.vue
│   │   ├── Reports.vue
│   │   └── [admin views]
│   └── LandingView.vue
├── src/services/
│   ├── api.js                                ← ⭐ Axios instance
│   ├── authService.js
│   ├── studentProfileService.js
│   ├── studentPortfolioService.js
│   ├── studentSkillsService.js
│   ├── adminService.js
│   ├── notificationsApi.js
│   └── [autres services]
├── src/assets/
│   ├── styles/
│   │   ├── design-tokens.css                 ← ⭐ Design system
│   │   ├── dashboard-layout.css
│   │   ├── student-*.css
│   │   ├── admin-*.css
│   │   └── [autres styles]
│   └── icons/
│       └── [SVG icons]
├── src/config/
│   └── sidebarConfig.js                      ← Sidebar menu config
├── src/layouts/
│   └── DashboardLayout.vue                   ← Main layout
├── src/mockData/
│   └── [mock data for dev]
├── src/tests/
│   ├── test-unitaire/                        ← Unit tests
│   ├── test-UI/                              ← Component tests
│   ├── test-smoke/                           ← Smoke tests
│   └── cypress/ (in qa/)                     ← E2E tests
├── Dockerfile
├── vite.config.js
├── index.html
├── package.json
└── .env.example
```

### Infrastructure

```
infrastructure/
├── ansible/                                  ← Config management (skeleton)
│   └── .gitkeep
├── docker/                                   ← Docker configs
│   └── .gitkeep
└── terraform/                                ← IaC (skeleton)
    └── .gitkeep

.github/workflows/
├── ci.yml                                    ← Full CI pipeline
├── ci-unit.yml                               ← Unit tests only
├── ci-security.yml                           ← Security scanning
├── e2e-security.yml                          ← E2E security tests
└── auto-pr.yml                               ← Auto PRs

security/
├── audits/                                   ← Audit reports
├── zap-scripts/                              ← OWASP ZAP
└── trivy/                                    ← Image scanning

qa/
├── cypress/
│   ├── e2e/auth/                            ← E2E tests
│   ├── support/
│   │   └── commands.js
│   └── fixtures/
├── cypress.config.js
└── reports/
```

---

## 🔄 Flux de code typique

### Ajouter une endpoint API

```
1. Définir la route
   → backend/src/routes/*.js
   
2. Créer le contrôleur
   → backend/src/controllers/*.js
   
3. Implémenter la logique
   → backend/src/services/*.js
   
4. Utiliser ORM Prisma
   → backend/prisma/schema.prisma (si nouveau modèle)
   → backend/src/services/ (requêtes)
   
5. Tester
   → backend/tests/integration/routes/*.test.js
   
6. Frontend consomme
   → frontend/src/services/*.js
   → frontend/src/components/*.vue (utilise le service)
```

### Cycle de développement

```
Démarrer
  ↓
Modifier code (auto-reload en Docker)
  ↓
Tests locaux (npm test)
  ↓
Linting (npm run lint)
  ↓
Format (npm run format)
  ↓
Commit & Push
  ↓
CI/CD pipeline (GitHub Actions)
  ↓
Tests automatiques
  ↓
Deploy (si merge)
```

---

## 🔍 Patterns & Conventions

### Nommage des fichiers

| Type | Pattern | Exemple |
|------|---------|---------|
| Routes | `*Routes.js` | `authRoutes.js` |
| Contrôleurs | `*Controller.js` | `studentController.js` |
| Services | `*Service.js` | `profileService.js` |
| Middlewares | `*Middleware.js` | `authMiddleware.js` |
| Composants Vue | `PascalCase.vue` | `StudentProfile.vue` |
| Vues Vue | `*View.vue` ou `*.vue` | `LoginView.vue` |
| Stores Pinia | `*Store.js` | `authStore.js` |
| Services API | `*Api.js` ou `*Service.js` | `studentProfileApi.js` |
| Tests | `*.test.js` ou `*.spec.js` | `auth.test.js` |

### Organisation par domaine

```
Student domain:
- backend/src/controllers/student/*.js
- backend/src/routes/student/*.js
- backend/src/services/student/*.js
- frontend/src/views/student/*.vue
- frontend/src/components/student/*.vue

Admin domain:
- backend/src/controllers/administrator/*.js
- backend/src/routes/administrator/*.js
- backend/src/services/administrator/*.js
- frontend/src/views/admin/*.vue
- frontend/src/components/admin/*.vue
```

---

## 🚀 Démarrage rapide pour dév

```bash
# 1. Clone & navigate
git clone <repo> && cd PROJET-INTEGRATION

# 2. Setup env
cp .env.example .env
# Edit .env with your values

# 3. Start all services
docker-compose -f docker-compose.dev.yml up

# 4. In another terminal, run tests
docker exec -it dev_back npm test

# 5. View frontend
# http://localhost:5173

# 6. View backend health
# curl http://localhost:3000/

# 7. Start developing!
# Edit files, they auto-reload
```

---

## 📞 Trouver les réponses

| Question | Chercher dans |
|----------|----------------|
| Comment ajouter une route? | backend/src/routes/ + docs/guides/ |
| Comment créer un composant? | frontend/src/components/ + tests/ |
| Quel est le modèle de données? | backend/prisma/schema.prisma |
| Comment fonctionne l'auth? | backend/src/services/authService.js |
| Comment se connecter à l'API? | frontend/src/services/ |
| Quels sont les tests? | */tests/ dossiers |
| Configuration Docker? | docker-compose.*.yml fichiers |
| Variables d'environnement? | .env.example |
| CI/CD configuration? | .github/workflows/ |

---

## 🎓 Points clés à comprendre

1. **Architecture couches:** Controller → Service → Prisma → DB
2. **Modularité:** Routes/Contrôleurs/Services par domaine
3. **Authentication:** JWT avec refresh tokens en cookies
4. **RBAC:** 4 rôles avec middlewares de protection
5. **Tests:** Unit + Integration (Backend), Unit + UI + E2E (Frontend)
6. **Storage:** Abstraction local/S3
7. **ORM:** Prisma avec migrations versionnées
8. **State Frontend:** Pinia store
9. **CI/CD:** GitHub Actions automatisé
10. **Docker:** Dev + Prod + Security compositions

---

**Navigation guide** | Mise à jour: 2025 | Pour questions: voir code & tests

