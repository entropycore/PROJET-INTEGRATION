'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';

jest.mock('../../../../src/logs/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

jest.mock('../../../../src/services/administratorService');
const administratorService = require('../../../../src/services/administratorService');

const validationRouter = require('../../../../src/routes/administrator/validationRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/admin', authMiddleware, checkRoles('ADMINISTRATOR'), validationRouter);

const makeToken = (role = 'ADMINISTRATOR', roleId = 'admin-role-id') =>
    jwt.sign(
        { userId: 'admin-user-id', role, roleId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );

const adminToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes de Validation (validationRoutes)", () => {

    describe('Sécurité & Autorisation', () => {

        it('TC-VAL-SEC-01 : Sans token -> 401', async () => {
            const res = await request(app).get('/api/admin/validations');
            expect(res.status).toBe(401);
        });

        it('TC-VAL-SEC-02 : Rôle non ADMINISTRATOR -> 403', async () => {
            const res = await request(app)
                .get('/api/admin/validations')
                .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
            expect(res.status).toBe(403);
        });

    });

    describe('Endpoints Logic', () => {

        describe('GET /validations', () => {

            it('TC-VAL-01 : Liste validations avec filtres par défaut -> 200', async () => {
                administratorService.listValidationItems.mockResolvedValue({
                    items: [{ id: 'val-1', type: 'PROJECT', status: 'PENDING' }],
                    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
                });

                const res = await request(app)
                    .get('/api/admin/validations')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.data.items).toHaveLength(1);
                expect(administratorService.listValidationItems).toHaveBeenCalledWith({
                    type: undefined,
                    status: 'PENDING',
                    search: undefined,
                    page: 1,
                    limit: 10,
                });
            });

            it('TC-VAL-02 : Liste validations avec filtres spécifiques -> 200', async () => {
                administratorService.listValidationItems.mockResolvedValue({
                    items: [],
                    pagination: { page: 2, limit: 5, total: 0, totalPages: 1 }
                });

                const res = await request(app)
                    .get('/api/admin/validations?type=project&status=approved&search=demo&page=2&limit=5')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(200);
                expect(administratorService.listValidationItems).toHaveBeenCalledWith({
                    type: 'PROJECT',
                    status: 'APPROVED',
                    search: 'demo',
                    page: 2,
                    limit: 5,
                });
            });

            it('TC-VAL-03 : Filtre type invalide -> 400', async () => {
                const res = await request(app)
                    .get('/api/admin/validations?type=INVALID_TYPE')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(400);
                expect(res.body.success).toBe(false);
            });

            it('TC-VAL-04 : Filtre status invalide -> 400', async () => {
                const res = await request(app)
                    .get('/api/admin/validations?status=INVALID_STATUS')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(400);
                expect(res.body.success).toBe(false);
            });

        });

        describe('GET /validations/pending', () => {

            it('TC-VAL-05 : Liste validations en attente (legacy) -> 200', async () => {
                administratorService.listPendingValidationsLegacy.mockResolvedValue({
                    items: [{ id: 'val-1', targetType: 'PROJECT', status: 'PENDING' }],
                    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
                });

                const res = await request(app)
                    .get('/api/admin/validations/pending')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(administratorService.listPendingValidationsLegacy).toHaveBeenCalledWith({
                    type: undefined,
                    status: 'PENDING',
                    search: undefined,
                    page: 1,
                    limit: 10,
                });
            });

            it('TC-VAL-06 : Filtre type legacy invalide -> 400', async () => {
                const res = await request(app)
                    .get('/api/admin/validations/pending?type=INVALID_LEGACY_TYPE')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(400);
                expect(res.body.success).toBe(false);
            });

        });

        describe('GET /validations/pending-count', () => {

            it('TC-VAL-07 : Compteurs validations legacy -> 200', async () => {
                administratorService.getPendingValidationCountsLegacy.mockResolvedValue({
                    count: 4,
                    projects: 2,
                    internships: 2
                });

                const res = await request(app)
                    .get('/api/admin/validations/pending-count')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.data.projects).toBe(2);
                expect(administratorService.getPendingValidationCountsLegacy).toHaveBeenCalled();
            });

        });

        describe('GET /validations/:validationId', () => {

            it('TC-VAL-08 : Validation legacy trouvée -> 200', async () => {
                administratorService.getLegacyValidationDetail.mockResolvedValue({
                    id: 'val-1',
                    itemType: 'PROJECT'
                });

                const res = await request(app)
                    .get('/api/admin/validations/val-1')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.data.id).toBe('val-1');
                expect(administratorService.getLegacyValidationDetail).toHaveBeenCalledWith('val-1');
            });

            it('TC-VAL-09 : Validation legacy introuvable -> 404', async () => {
                administratorService.getLegacyValidationDetail.mockRejectedValue(new Error('VALIDATION_ITEM_NOT_FOUND'));

                const res = await request(app)
                    .get('/api/admin/validations/val-inexistante')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(404);
                expect(res.body.success).toBe(false);
            });

        });

        describe('PATCH /validations/:validationId/approve', () => {

            it('TC-VAL-10 : Approbation legacy réussie -> 200', async () => {
                administratorService.approveLegacyValidationItem.mockResolvedValue({
                    id: 'val-1',
                    status: 'APPROVED'
                });

                const res = await request(app)
                    .patch('/api/admin/validations/val-1/approve')
                    .set('Cookie', `accessToken=${adminToken}`)
                    .send({ comment: 'Superbe projet' });

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(administratorService.approveLegacyValidationItem).toHaveBeenCalledWith(
                    'val-1',
                    'admin-user-id',
                    'admin-role-id',
                    { comment: 'Superbe projet' }
                );
            });

        });

        describe('PATCH /validations/:validationId/reject', () => {

            it('TC-VAL-11 : Rejet legacy réussi -> 200', async () => {
                administratorService.rejectLegacyValidationItem.mockResolvedValue({
                    id: 'val-1',
                    status: 'REJECTED'
                });

                const res = await request(app)
                    .patch('/api/admin/validations/val-1/reject')
                    .set('Cookie', `accessToken=${adminToken}`)
                    .send({ comment: 'Incomplet' });

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(administratorService.rejectLegacyValidationItem).toHaveBeenCalledWith(
                    'val-1',
                    'admin-user-id',
                    'admin-role-id',
                    { comment: 'Incomplet' }
                );
            });

        });

        describe('PATCH /validations/:validationId/request-changes', () => {

            it('TC-VAL-12 : Demande correction legacy réussie -> 200', async () => {
                administratorService.requestLegacyValidationChanges.mockResolvedValue({
                    id: 'val-1',
                    status: 'CHANGES_REQUESTED'
                });

                const res = await request(app)
                    .patch('/api/admin/validations/val-1/request-changes')
                    .set('Cookie', `accessToken=${adminToken}`)
                    .send({ comment: 'Corriger la description' });

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(administratorService.requestLegacyValidationChanges).toHaveBeenCalledWith(
                    'val-1',
                    'admin-user-id',
                    'admin-role-id',
                    { comment: 'Corriger la description' }
                );
            });

        });

        describe('GET /validations/:itemType/:itemId', () => {

            it('TC-VAL-13 : Validation trouvée -> 200', async () => {
                administratorService.getValidationItemDetail.mockResolvedValue({
                    id: 'item-1',
                    type: 'PROJECT'
                });

                const res = await request(app)
                    .get('/api/admin/validations/PROJECT/item-1')
                    .set('Cookie', `accessToken=${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(administratorService.getValidationItemDetail).toHaveBeenCalledWith('PROJECT', 'item-1');
            });

        });

        describe('PATCH /validations/:itemType/:itemId/approve', () => {

            it('TC-VAL-14 : Approbation validation réussie -> 200', async () => {
                administratorService.approveValidationItem.mockResolvedValue({
                    id: 'item-1',
                    status: 'APPROVED'
                });

                const res = await request(app)
                    .patch('/api/admin/validations/PROJECT/item-1/approve')
                    .set('Cookie', `accessToken=${adminToken}`)
                    .send({ note: 'Valide' });

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(administratorService.approveValidationItem).toHaveBeenCalledWith(
                    'PROJECT',
                    'item-1',
                    'admin-user-id',
                    'admin-role-id',
                    { note: 'Valide' }
                );
            });

        });

        describe('PATCH /validations/:itemType/:itemId/reject', () => {

            it('TC-VAL-15 : Rejet validation réussi -> 200', async () => {
                administratorService.rejectValidationItem.mockResolvedValue({
                    id: 'item-1',
                    status: 'REJECTED'
                });

                const res = await request(app)
                    .patch('/api/admin/validations/PROJECT/item-1/reject')
                    .set('Cookie', `accessToken=${adminToken}`)
                    .send({ reason: 'Invalide' });

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(administratorService.rejectValidationItem).toHaveBeenCalledWith(
                    'PROJECT',
                    'item-1',
                    'admin-user-id',
                    'admin-role-id',
                    { reason: 'Invalide' }
                );
            });

        });

    });

});
