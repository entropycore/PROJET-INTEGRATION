'use strict';

const request = require('supertest');
const app = require('../../../src/server');

// ─── MOCK de reportService ───────────────────────────────────
// On simule le service sans toucher la BDD
jest.mock('../../../src/services/reportService');
const reportService = require('../../../src/services/reportService');

// ─── MOCK de authMiddleware ──────────────────────────────────
// On simule un utilisateur connecté pour toutes les requêtes
jest.mock('../../../src/middlewares/authMiddleware', () => (req, res, next) => {
    req.user = { userId: 'user-uuid-123', role: 'STUDENT' };
    next();
});

// ─── Données de base pour les tests ─────────────────────────
const validReport = {
    targetType: 'PORTFOLIO',
    targetId: '2944284-ce86-46ae-a42e-da0c7d64436f',
    reason: 'Contenu inapproprié',
    description: 'L\'utilisateur utilise un langage offensant.'
};

// ══════════════════════════════════════════════════════════════
// POST /api/reports — CRÉER UN SIGNALEMENT
// ══════════════════════════════════════════════════════════════
describe('REPORTS - POST /reports', () => {

    // Réinitialise les mocks avant chaque test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── TC-REP-01 : Création réussie ─────────────────────────
    test('TC-REP-01 : Création réussie -> 201', async () => {
        // On simule ce que reportService.createReport retourne en cas de succès
        reportService.createReport.mockResolvedValue({
            id: 'report-uuid-789',
            reporterUserId: 'user-uuid-123',
            targetType: 'PORTFOLIO',
            targetId: '2944284-ce86-46ae-a42e-da0c7d64436f',
            reason: 'Contenu inapproprié',
            description: 'L\'utilisateur utilise un langage offensant.',
            status: 'PENDING'
        });

        const res = await request(app)
            .post('/api/reports')
            .set('Cookie', 'accessToken=fake-valid-token')
            .send(validReport);
        //console.log("❌ VALIDATION ERRORS DETECTED:", JSON.stringify(res.body, null, 2));

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/signal/i);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('status', 'PENDING');

        // Vérifier que le service a bien été appelé avec les bonnes données
        expect(reportService.createReport).toHaveBeenCalledTimes(1);
        expect(reportService.createReport).toHaveBeenCalledWith({
            reporterUserId: 'user-uuid-123', // vient du middleware mocké
            targetType: 'PORTFOLIO',
            targetId: '2944284-ce86-46ae-a42e-da0c7d64436f',
            reason: 'Contenu inapproprié',
            description: 'L\'utilisateur utilise un langage offensant.',
        });
    });

    // ── TC-REP-02 : Type de cible invalide ──────────────────
    test('TC-REP-02 : Type de cible invalide -> 400', async () => {
        // Le service lance cette erreur quand le targetType n'existe pas
        reportService.createReport.mockRejectedValue(
            new Error('INVALID_REPORT_TARGET_TYPE')
        );

        const res = await request(app)
            .post('/api/reports')
            .set('Cookie', 'accessToken=fake-valid-token')
            .send({ ...validReport, targetType: 'TYPE_INEXISTANT' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/invalide/i);
    });

    // ── TC-REP-03 : ID de la cible manquant ─────────────────
    test('TC-REP-03 : ID de la cible manquant -> 400', async () => {
        reportService.createReport.mockRejectedValue(
            new Error('REPORT_TARGET_ID_REQUIRED')
        );

        const { targetId, ...bodyWithoutTargetId } = validReport;

        const res = await request(app)
            .post('/api/reports')
            .set('Cookie', 'accessToken=fake-valid-token')
            .send(bodyWithoutTargetId);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/obligatoire|identifiant/i);
    });

    // ── TC-REP-04 : Cible introuvable en BDD ────────────────
    test('TC-REP-04 : Cible introuvable en BDD -> 404', async () => {
        reportService.createReport.mockRejectedValue(
            new Error('REPORT_TARGET_NOT_FOUND')
        );

        const res = await request(app)
            .post('/api/reports')
            .set('Cookie', 'accessToken=fake-valid-token')
            .send({ ...validReport, targetId: 'uuid-qui-nexiste-pas' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/introuvable/i);
    });

    // ── TC-REP-05 : Doublon signalement en attente ──────────
    test('TC-REP-05 : Doublon de signalement en attente -> 409', async () => {
        reportService.createReport.mockRejectedValue(
            new Error('REPORT_ALREADY_EXISTS')
        );

        const res = await request(app)
            .post('/api/reports')
            .set('Cookie', 'accessToken=fake-valid-token')
            .send(validReport);

        expect(res.statusCode).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/existe déjà|attente/i);
    });
});
