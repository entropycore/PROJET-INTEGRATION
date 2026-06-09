'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../src/services/studentProjectService');
const studentProjectService = require('../../../src/services/studentProjectService');

jest.mock('../../../src/services/studentProjectMediaService');
const studentProjectMediaService = require('../../../src/services/studentProjectMediaService');

const projectsRouter = require('../../../src/routes/projectsRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/projects', projectsRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Projets (projectsRoutes)", () => {

  describe('Sécurité & Rôles', () => {
    it('TC-STU-PROJ-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/projects/me');
      expect(res.status).toBe(401);
    });

    it('TC-STU-PROJ-SEC-02 : Rôle non autorisé tente accès /me -> 403', async () => {
      const res = await request(app)
        .get('/api/projects/me')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Endpoints Logic', () => {

    describe('GET /me', () => {
      it('TC-STU-PROJ-01 : listProjects -> 200', async () => {
        studentProjectService.listProjects.mockResolvedValue([{ id: 'p1', title: 'Mon Projet' }]);

        const res = await request(app)
          .get('/api/projects/me')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(studentProjectService.listProjects).toHaveBeenCalledWith(1);
      });
    });

    describe('GET /:projectId', () => {
      it('TC-STU-PROJ-02 : getProjectById -> 200', async () => {
        studentProjectService.getProjectById.mockResolvedValue({ id: 'p1', title: 'Mon Projet' });

        const res = await request(app)
          .get('/api/projects/p1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('Mon Projet');
        expect(studentProjectService.getProjectById).toHaveBeenCalledWith(1, 'p1');
      });

      it('TC-STU-PROJ-03 : getProjectById - Introuvable -> 404', async () => {
        studentProjectService.getProjectById.mockRejectedValue(new Error('PROJECT_NOT_FOUND'));

        const res = await request(app)
          .get('/api/projects/p-inexistant')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
      });
    });

    describe('POST /', () => {
      it('TC-STU-PROJ-04 : createProject -> 201', async () => {
        studentProjectService.createProject.mockResolvedValue({ id: 'p1', title: 'Nouveau' });

        const res = await request(app)
          .post('/api/projects')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ title: 'Nouveau', type: 'ACADEMIC' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(studentProjectService.createProject).toHaveBeenCalledWith(1, { title: 'Nouveau', type: 'ACADEMIC' });
      });
    });

    describe('PUT /:projectId', () => {
      it('TC-STU-PROJ-05 : updateProject -> 200', async () => {
        studentProjectService.updateProject.mockResolvedValue({ id: 'p1', title: 'Modifié' });

        const res = await request(app)
          .put('/api/projects/p1')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ title: 'Modifié' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(studentProjectService.updateProject).toHaveBeenCalledWith(1, 'p1', { title: 'Modifié' });
      });
    });

    describe('PATCH /:projectId/submit', () => {
      it('TC-STU-PROJ-06 : submitProject -> 200', async () => {
        studentProjectService.submitProject.mockResolvedValue({ id: 'p1', status: 'PENDING' });

        const res = await request(app)
          .patch('/api/projects/p1/submit')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(studentProjectService.submitProject).toHaveBeenCalledWith(1, 'p1');
      });
    });

    describe('DELETE /:projectId', () => {
      it('TC-STU-PROJ-07 : deleteProject -> 200', async () => {
        studentProjectService.deleteProject.mockResolvedValue({ success: true });

        const res = await request(app)
          .delete('/api/projects/p1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(studentProjectService.deleteProject).toHaveBeenCalledWith(1, 'p1');
      });
    });

    describe('POST /:projectId/media', () => {
      it('TC-STU-PROJ-08 : uploadProjectMedia -> 201', async () => {
        studentProjectMediaService.uploadProjectMedia.mockResolvedValue();
        studentProjectService.getProjectById.mockResolvedValue({ id: 'p1', media: ['m1.png'] });

        const res = await request(app)
          .post('/api/projects/p1/media')
          .set('Cookie', `accessToken=${studentToken}`)
          .attach('screenshots', Buffer.from('file'), 'test.png');

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(studentProjectMediaService.uploadProjectMedia).toHaveBeenCalledWith(1, 'p1', expect.any(Object));
      });
    });

    describe('DELETE /:projectId/media/:mediaId', () => {
      it('TC-STU-PROJ-09 : deleteProjectMedia -> 200', async () => {
        studentProjectMediaService.deleteProjectMedia.mockResolvedValue({ success: true });

        const res = await request(app)
          .delete('/api/projects/p1/media/m1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(studentProjectMediaService.deleteProjectMedia).toHaveBeenCalledWith(1, 'p1', 'm1');
      });
    });

    describe('GET /:projectId/media/:mediaId/content', () => {
      it('TC-STU-PROJ-10 : getProjectMediaContent -> 200', async () => {
        studentProjectMediaService.getProjectMediaFile.mockResolvedValue({
          absolutePath: __filename,
          mimeType: 'image/png'
        });

        const res = await request(app)
          .get('/api/projects/p1/media/m1/content')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentProjectMediaService.getProjectMediaFile).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 1, role: 'STUDENT' }),
          'p1',
          'm1'
        );
      });
    });

    describe('GET /:projectId/media/:mediaId/download', () => {
      it('TC-STU-PROJ-11 : downloadProjectMedia -> 200', async () => {
        studentProjectMediaService.getProjectMediaFile.mockResolvedValue({
          absolutePath: __filename,
          downloadName: 'file.png'
        });

        const res = await request(app)
          .get('/api/projects/p1/media/m1/download')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentProjectMediaService.getProjectMediaFile).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 1, role: 'STUDENT' }),
          'p1',
          'm1'
        );
      });
    });

  });

});
