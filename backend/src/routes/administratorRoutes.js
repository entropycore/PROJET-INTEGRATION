'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const administratorController = require('../controllers/administratorController');

const router = express.Router();

// Middleware globaux pour l'admin
router.use(authMiddleware);
router.use(checkRoles('ADMINISTRATOR'));

/**
 * @swagger
 * tags:
 *   - name: Admin - Dashboard
 *   - name: Admin - Notifications
 *   - name: Admin - Validations
 *   - name: Admin - Reports
 *   - name: Admin - Users
 *   - name: Admin - Professional Requests
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Obtenir le tableau de bord administrateur
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/dashboard', administratorController.getDashboard);

/**
 * @swagger
 * /api/admin/dashboard-items/{itemType}/{itemId}:
 *   get:
 *     summary: Détails d'un élément du dashboard
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/dashboard-items/:itemType/:itemId', administratorController.getDashboardItemDetail);

/**
 * @swagger
 * /api/admin/dashboard-items/{itemType}/{itemId}/approve:
 *   patch:
 *     summary: Approuver un élément du dashboard
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/dashboard-items/:itemType/:itemId/approve', administratorController.approveDashboardItem);

/**
 * @swagger
 * /api/admin/dashboard-items/{itemType}/{itemId}/reject:
 *   patch:
 *     summary: Rejeter un élément du dashboard
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemType
 *         required: true
 *       - in: path
 *         name: itemId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/dashboard-items/:itemType/:itemId/reject', administratorController.rejectDashboardItem);

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: Liste des notifications
 *     tags: [Admin - Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/notifications', administratorController.listNotifications);

/**
 * @swagger
 * /api/admin/notifications/read-all:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Admin - Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/notifications/read-all', administratorController.markAllNotificationsAsRead);

/**
 * @swagger
 * /api/admin/notifications/{notificationId}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Admin - Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/notifications/:notificationId/read', administratorController.markNotificationAsRead);

/**
 * @swagger
 * /api/admin/validations:
 *   get:
 *     summary: Liste des éléments à valider
 *     tags: [Admin - Validations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/validations', administratorController.listValidationItems);

/**
 * @swagger
 * /api/admin/validations/{itemType}/{itemId}:
 *   get:
 *     summary: Détail d'un élément à valider
 *     tags: [Admin - Validations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemType
 *         required: true
 *       - in: path
 *         name: itemId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/validations/:itemType/:itemId', administratorController.getValidationItemDetail);

/**
 * @swagger
 * /api/admin/validations/{itemType}/{itemId}/approve:
 *   patch:
 *     summary: Approuver une validation
 *     tags: [Admin - Validations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemType
 *         required: true
 *       - in: path
 *         name: itemId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/validations/:itemType/:itemId/approve', administratorController.approveValidationItem);

/**
 * @swagger
 * /api/admin/validations/{itemType}/{itemId}/reject:
 *   patch:
 *     summary: Rejeter une validation
 *     tags: [Admin - Validations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemType
 *         required: true
 *       - in: path
 *         name: itemId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/validations/:itemType/:itemId/reject', administratorController.rejectValidationItem);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Liste des signalements
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/reports', administratorController.listReports);

/**
 * @swagger
 * /api/admin/reports/{reportId}:
 *   get:
 *     summary: Détail d'un signalement
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/reports/:reportId', administratorController.getReportById);

/**
 * @swagger
 * /api/admin/reports/{reportId}/approve:
 *   patch:
 *     summary: Approuver un signalement
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/reports/:reportId/approve', administratorController.approveReport);

/**
 * @swagger
 * /api/admin/reports/{reportId}/reject:
 *   patch:
 *     summary: Rejeter un signalement
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/reports/:reportId/reject', administratorController.rejectReport);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Profil administrateur
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/profile', administratorController.getProfile);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Liste des utilisateurs
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/users', administratorController.listUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Créer un utilisateur
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Créé
 */
router.post('/users', administratorController.createUser);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Détail d'un utilisateur
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/users/:userId', administratorController.getUserById);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Succès
 */
router.put('/users/:userId', administratorController.updateUser);

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   patch:
 *     summary: Changer le statut d'un utilisateur
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/users/:userId/status', administratorController.updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   patch:
 *     summary: Changer le rôle d'un utilisateur
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/users/:userId/role', administratorController.updateUserRole);

/**
 * @swagger
 * /api/admin/users/{userId}/reset-password:
 *   patch:
 *     summary: Réinitialiser le mot de passe
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/users/:userId/reset-password', administratorController.resetUserPassword);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.delete('/users/:userId', administratorController.deleteUser);

/**
 * @swagger
 * /api/admin/professional-requests:
 *   get:
 *     summary: Liste des demandes professionnelles
 *     tags: [Admin - Professional Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/professional-requests', administratorController.listProfessionalRequests);

/**
 * @swagger
 * /api/admin/professional-requests/{userId}:
 *   get:
 *     summary: Détail d'une demande pro
 *     tags: [Admin - Professional Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/professional-requests/:userId', administratorController.getProfessionalRequest);

/**
 * @swagger
 * /api/admin/professional-requests/{userId}/approve:
 *   patch:
 *     summary: Approuver une demande professionnelle
 *     tags: [Admin - Professional Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/professional-requests/:userId/approve', administratorController.approveProfessionalRequest);

/**
 * @swagger
 * /api/admin/professional-requests/{userId}/reject:
 *   patch:
 *     summary: Rejeter une demande professionnelle
 *     tags: [Admin - Professional Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch('/professional-requests/:userId/reject', administratorController.rejectProfessionalRequest);

module.exports = router;