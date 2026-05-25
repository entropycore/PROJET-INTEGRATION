'use strict';
// On définit l'environnement sur 'test' pour désactiver le démarrage réel du serveur
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../../src/server');
const administratorService = require('../../../src/services/administratorService');

/**
 * MOCKING DES SERVICES ET MIDDLEWARES
 * On simule le service d'administration et le middleware de sécurité pour isoler le contrôleur
 */
jest.mock('../../../src/services/administratorService');
jest.mock('../../../src/middlewares/redirectHttps', () => (req, res, next) => next());
jest.mock('../../../src/services/administratorService');

// Mock du middleware d'authentification pour simuler un Administrateur connecté
jest.mock('../../../src/middlewares/authMiddleware', () => (req, res, next) => {
    req.user = { userId: 'admin-123', role: 'ADMINISTRATOR' }; // Injection de l'utilisateur
    next()
});

jest.mock('../../../src/middlewares/checkRoles', () => () => (req, res, next) => {
    next();
});

describe('INTEGRATION TEST: Administrator Controller - Professional Requests Management', () => {

    describe('Section A: Gestion des listes et filtres', () => {
        
        test('TC-ADM-01 : Récupération réussie de la liste des demandes en attente', async () => {
            // BUT: Vérifier que l'admin peut lister les demandes avec le statut par défaut (PENDING)
            administratorService.listProfessionalRequests.mockResolvedValue([{ id: 1, status: 'PENDING' }]);

            const res = await request(app).get('/api/admin/professional-requests?status=PENDING');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.requests).toBeDefined();
        });

        test('TC-ADM-02 : Rejet si le filtre de statut est invalide', async () => {
            // BUT: Tester la validation du contrôleur contre les valeurs de status non autorisées (ex: 'GHOST')
            const res = await request(app).get('/api/admin/professional-requests?status=GHOST');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/status est invalide/i);
        });
    });

    describe('Section B: Approbation et Rejet des demandes', () => {

        test('TC-ADM-05 : Refus d\'approbation si l\'email n\'est pas encore vérifié', async () => {
            // BUT: S'assurer qu'un administrateur ne peut pas valider un pro qui n'a pas confirmé son identité par email
            administratorService.approveProfessionalRequest.mockRejectedValue(new Error('EMAIL_NOT_VERIFIED'));

            const res = await request(app).patch('/api/admin/professional-requests/user-789/approve');

            expect(res.statusCode).toBe(409); // Conflit de logique métier
            expect(res.body.message).toMatch(/doit être vérifié/i);
        });

        test('TC-ADM-06 : Erreur si la demande a déjà été approuvée auparavant', async () => {
            // BUT: Éviter les doubles traitements d'une même demande (idempotence)
            administratorService.approveProfessionalRequest.mockRejectedValue(new Error('REQUEST_ALREADY_APPROVED'));

            const res = await request(app).patch('/api/admin/professional-requests/user-789/approve');

            expect(res.statusCode).toBe(409);
            expect(res.body.message).toMatch(/déjà été approuvée/i);
        });

        test('TC-ADM-07 : Rejet d\'une demande avec un motif de refus spécifié', async () => {
            // BUT: Vérifier que l'admin peut rejeter une demande en fournissant une raison valide transmise au service
            administratorService.rejectProfessionalRequest.mockResolvedValue({ id: 789, status: 'REJECTED' });

            const res = await request(app)
               .patch('/api/admin/professional-requests/user-789/reject')
                .send({ rejectionReason: 'Documents non valides' });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/Demande professionnelle rejetée/i);
        });
    });

    describe('Section C: Erreurs de ressources', () => {

        test('TC-ADM-09 : Réponse 404 si la demande est introuvable', async () => {
            // BUT: Vérifier que le système informe correctement l'admin si l'ID de la demande n'existe pas dans la base
            administratorService.getProfessionalRequest.mockRejectedValue(new Error('REQUEST_NOT_FOUND'));

            const res = await request(app).get('/api/admin/requests/unknown-user');

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toMatch(/introuvable/i);
        });
    });
});