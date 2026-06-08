'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
const { Readable } = require('stream');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';

jest.mock('../../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../../src/services/studentActivityService');
const studentActivityService = require('../../../../src/services/studentActivityService');

const activityRouter = require('../../../../src/routes/student/activityRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), activityRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

const buildStreamTarget = () => ({
  mode: 'stream',
  stream: Readable.from(Buffer.from('file')),
  contentDisposition: 'attachment',
});

describe("Tests d'Intégration - Routes Activités Étudiant (activityRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-ACT-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/activities');
      expect(res.status).toBe(401);
    });

    it('TC-STU-ACT-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/activities')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    describe('GET /activities', () => {
      it('TC-STU-ACT-01 : Liste activités -> 200', async () => {
        studentActivityService.listActivities.mockResolvedValue([{ id: 'act-1', title: 'Coding Challenge' }]);

        const res = await request(app)
          .get('/api/student/activities')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(studentActivityService.listActivities).toHaveBeenCalledWith(1);
      });
    });

    describe('POST /activities', () => {
      it('TC-STU-ACT-02 : Création réussie sans attestation -> 210/201', async () => {
        studentActivityService.createActivity.mockResolvedValue({ id: 'act-1', title: 'Challenge' });

        const res = await request(app)
          .post('/api/student/activities')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ title: 'Challenge', type: 'COMPETITION' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(studentActivityService.createActivity).toHaveBeenCalledWith(1, {
          title: 'Challenge',
          type: 'COMPETITION'
        });
      });

      it('TC-STU-ACT-03 : Création avec attestation -> 201', async () => {
        studentActivityService.createActivity.mockResolvedValue({ id: 'act-1', title: 'Challenge' });
        studentActivityService.uploadActivityCertificate.mockResolvedValue({ id: 'act-1', title: 'Challenge', certificate: 'cert.pdf' });

        const res = await request(app)
          .post('/api/student/activities')
          .set('Cookie', `accessToken=${studentToken}`)
          .attach('certificate', Buffer.from('PDF Content'), 'attestation.pdf');

        expect(res.status).toBe(201);
        expect(studentActivityService.createActivity).toHaveBeenCalled();
        expect(studentActivityService.uploadActivityCertificate).toHaveBeenCalled();
      });

      it('TC-STU-ACT-04 : Création échouée - Titre requis -> 400', async () => {
        studentActivityService.createActivity.mockRejectedValue(new Error('ACTIVITY_TITLE_REQUIRED'));

        const res = await request(app)
          .post('/api/student/activities')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/titre.*obligatoire/i);
      });
    });

    describe('GET /activities/:activityId', () => {
      it('TC-STU-ACT-05 : Activité trouvée -> 200', async () => {
        studentActivityService.getActivityById.mockResolvedValue({ id: 'act-1', title: 'Challenge' });

        const res = await request(app)
          .get('/api/student/activities/act-1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Challenge');
        expect(studentActivityService.getActivityById).toHaveBeenCalledWith(1, 'act-1');
      });

      it('TC-STU-ACT-06 : Activité introuvable -> 404', async () => {
        studentActivityService.getActivityById.mockRejectedValue(new Error('ACTIVITY_NOT_FOUND'));

        const res = await request(app)
          .get('/api/student/activities/act-inexistant')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/introuvable/i);
      });
    });

    describe('PUT /activities/:activityId', () => {
      it('TC-STU-ACT-07 : Mise à jour réussie -> 200', async () => {
        studentActivityService.updateActivity.mockResolvedValue({ id: 'act-1', title: 'Updated' });

        const res = await request(app)
          .put('/api/student/activities/act-1')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ title: 'Updated' });

        expect(res.status).toBe(200);
        expect(studentActivityService.updateActivity).toHaveBeenCalledWith(1, 'act-1', { title: 'Updated' });
      });
    });

    describe('DELETE /activities/:activityId', () => {
      it('TC-STU-ACT-08 : Suppression réussie -> 200', async () => {
        studentActivityService.deleteActivity.mockResolvedValue({ success: true });

        const res = await request(app)
          .delete('/api/student/activities/act-1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentActivityService.deleteActivity).toHaveBeenCalledWith(1, 'act-1');
      });
    });

    describe('POST /activities/:activityId/submit-validation', () => {
      it('TC-STU-ACT-09 : Soumission réussie -> 200', async () => {
        studentActivityService.submitActivityValidation.mockResolvedValue({ id: 'act-1', status: 'PENDING' });

        const res = await request(app)
          .post('/api/student/activities/act-1/submit-validation')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentActivityService.submitActivityValidation).toHaveBeenCalledWith(1, 'act-1');
      });
    });

    describe('POST /activities/:activityId/certificate', () => {
      it('TC-STU-ACT-10 : Ajout attestation réussie -> 201', async () => {
        studentActivityService.uploadActivityCertificate.mockResolvedValue({ id: 'act-1', certificate: 'cert.pdf' });

        const res = await request(app)
          .post('/api/student/activities/act-1/certificate')
          .set('Cookie', `accessToken=${studentToken}`)
          .attach('certificate', Buffer.from('PDF Content'), 'attestation.pdf');

        expect(res.status).toBe(201);
        expect(studentActivityService.uploadActivityCertificate).toHaveBeenCalledWith(1, 'act-1', expect.any(Object));
      });
    });

    describe('GET /activities/:activityId/certificate/download', () => {
      it('TC-STU-ACT-11 : Téléchargement attestation -> 200', async () => {
        studentActivityService.getActivityCertificateFile.mockResolvedValue({
          target: buildStreamTarget(),
          downloadName: 'test.pdf',
          mimeType: 'application/pdf',
        });

        const res = await request(app)
          .get('/api/student/activities/act-1/certificate/download')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentActivityService.getActivityCertificateFile).toHaveBeenCalledWith(1, 'act-1');
      });
    });

  });

});
