'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';

jest.mock('../../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../../src/services/studentStageService');
jest.mock('../../../../src/services/studentStageMediaService');

const studentStageService = require('../../../../src/services/studentStageService');
const studentStageMediaService = require('../../../../src/services/studentStageMediaService');

const stageRouter = require('../../../../src/routes/student/stageRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), stageRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Stages Étudiant (stageRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-STAGE-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/stages');
      expect(res.status).toBe(401);
    });

    it('TC-STU-STAGE-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/stages')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    describe('GET /stages', () => {
      it('TC-STU-STAGE-01 : listStages -> 200', async () => {
        studentStageService.listStages.mockResolvedValue([{ id: 'stage-1', title: 'Stage Dev' }]);

        const res = await request(app)
          .get('/api/student/stages')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(studentStageService.listStages).toHaveBeenCalledWith(1);
      });
    });

    describe('GET /stages/:stageId', () => {
      it('TC-STU-STAGE-02 : getStageById -> 200', async () => {
        studentStageService.getStageById.mockResolvedValue({ id: 'stage-1', title: 'Stage Dev' });

        const res = await request(app)
          .get('/api/student/stages/stage-1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe('stage-1');
        expect(studentStageService.getStageById).toHaveBeenCalledWith(1, 'stage-1');
      });

      it('TC-STU-STAGE-03 : getStageById - Introuvable -> 404', async () => {
        studentStageService.getStageById.mockRejectedValue(new Error('STAGE_NOT_FOUND'));

        const res = await request(app)
          .get('/api/student/stages/stage-inexistant')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
      });
    });

    describe('POST /stages', () => {
      it('TC-STU-STAGE-04 : createStage -> 201', async () => {
        studentStageService.createStage.mockResolvedValue({ id: 'stage-1', title: 'Stage Dev' });

        const res = await request(app)
          .post('/api/student/stages')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ title: 'Stage Dev', company: 'Company' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(studentStageService.createStage).toHaveBeenCalledWith(1, { title: 'Stage Dev', company: 'Company' });
      });
    });

    describe('PUT /stages/:stageId', () => {
      it('TC-STU-STAGE-05 : updateStage -> 200', async () => {
        studentStageService.updateStage.mockResolvedValue({ id: 'stage-1', title: 'Updated' });

        const res = await request(app)
          .put('/api/student/stages/stage-1')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ title: 'Updated' });

        expect(res.status).toBe(200);
        expect(studentStageService.updateStage).toHaveBeenCalledWith(1, 'stage-1', { title: 'Updated' });
      });
    });

    describe('DELETE /stages/:stageId', () => {
      it('TC-STU-STAGE-06 : deleteStage -> 200', async () => {
        studentStageService.deleteStage.mockResolvedValue({ success: true });

        const res = await request(app)
          .delete('/api/student/stages/stage-1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentStageService.deleteStage).toHaveBeenCalledWith(1, 'stage-1');
      });
    });

    describe('POST /stages/:stageId/submit-validation', () => {
      it('TC-STU-STAGE-07 : submitStageValidation -> 200', async () => {
        studentStageService.submitStageValidation.mockResolvedValue({ id: 'stage-1', status: 'PENDING' });

        const res = await request(app)
          .post('/api/student/stages/stage-1/submit-validation')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentStageService.submitStageValidation).toHaveBeenCalledWith(1, 'stage-1');
      });

      it('TC-STU-STAGE-08 : submitStageValidation - Aucun validateur -> 400', async () => {
        studentStageService.submitStageValidation.mockRejectedValue(new Error('STAGE_VALIDATOR_NOT_FOUND'));

        const res = await request(app)
          .post('/api/student/stages/stage-1/submit-validation')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });

    describe('PATCH /stages/:stageId/visibility', () => {
      it('TC-STU-STAGE-09 : updateStageVisibility -> 200', async () => {
        studentStageService.updateStageVisibility.mockResolvedValue({ id: 'stage-1', visibility: 'PUBLIC' });

        const res = await request(app)
          .patch('/api/student/stages/stage-1/visibility')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ visibility: 'PUBLIC' });

        expect(res.status).toBe(200);
        expect(studentStageService.updateStageVisibility).toHaveBeenCalledWith(1, 'stage-1', 'PUBLIC');
      });
    });

    describe('POST /stages/:stageId/report', () => {
      it('TC-STU-STAGE-10 : updateStageReport avec fichier -> 201', async () => {
        studentStageService.getStageById.mockResolvedValue({ id: 'stage-1', report: 'rep.pdf' });

        const res = await request(app)
          .post('/api/student/stages/stage-1/report')
          .set('Cookie', `accessToken=${studentToken}`)
          .attach('report', Buffer.from('PDF Content'), 'rapport.pdf');

        expect(res.status).toBe(201);
        expect(studentStageMediaService.uploadStageReport).toHaveBeenCalledWith(1, 'stage-1', expect.any(Object));
        expect(studentStageService.getStageById).toHaveBeenCalledWith(1, 'stage-1');
      });

      it('TC-STU-STAGE-11 : updateStageReport sans fichier (texte seul) -> 200', async () => {
        studentStageService.updateStageReport.mockResolvedValue({ id: 'stage-1', reportText: 'Rapport texte' });

        const res = await request(app)
          .post('/api/student/stages/stage-1/report')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ reportText: 'Rapport texte' });

        expect(res.status).toBe(200);
        expect(studentStageService.updateStageReport).toHaveBeenCalledWith(1, 'stage-1', { reportText: 'Rapport texte' });
      });
    });

    describe('GET /stages/:stageId/report/download', () => {
      it('TC-STU-STAGE-12 : downloadStageReport -> 200', async () => {
        studentStageMediaService.getStageReportFile.mockResolvedValue({
          target: {
            mode: 'stream',
            contentDisposition: 'attachment',
            stream: fs.createReadStream(__filename),
          },
          downloadName: 'rapport.pdf',
          mimeType: 'application/pdf',
        });

        const res = await request(app)
          .get('/api/student/stages/stage-1/report/download')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentStageMediaService.getStageReportFile).toHaveBeenCalledWith(1, 'stage-1');
      });
    });

    describe('POST /stages/:stageId/images', () => {
      it('TC-STU-STAGE-13 : uploadStageImages -> 201', async () => {
        studentStageService.getStageById.mockResolvedValue({ id: 'stage-1', images: ['img1.jpg'] });

        const res = await request(app)
          .post('/api/student/stages/stage-1/images')
          .set('Cookie', `accessToken=${studentToken}`)
          .attach('images', Buffer.from('image 1'), 'img1.png')
          .attach('images', Buffer.from('image 2'), 'img2.png');

        expect(res.status).toBe(201);
        expect(studentStageMediaService.uploadStageImages).toHaveBeenCalledWith(1, 'stage-1', expect.any(Array));
      });
    });

    describe('GET /stages/:stageId/images/:mediaId/content', () => {
      it('TC-STU-STAGE-14 : getStageImageContent -> 200', async () => {
        studentStageMediaService.getStageImageFile.mockResolvedValue({
          target: {
            mode: 'stream',
            contentDisposition: 'inline',
            stream: fs.createReadStream(__filename),
          },
          downloadName: 'img1.png',
          mimeType: 'image/png',
        });

        const res = await request(app)
          .get('/api/student/stages/stage-1/images/media-1/content')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentStageMediaService.getStageImageFile).toHaveBeenCalledWith(1, 'stage-1', 'media-1');
      });
    });

    describe('DELETE /stages/:stageId/images/:mediaId', () => {
      it('TC-STU-STAGE-15 : deleteStageImage -> 200', async () => {
        studentStageMediaService.deleteStageImage.mockResolvedValue({ success: true });

        const res = await request(app)
          .delete('/api/student/stages/stage-1/images/media-1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentStageMediaService.deleteStageImage).toHaveBeenCalledWith(1, 'stage-1', 'media-1');
      });
    });

    describe('GET /stages/:stageId/validation-history', () => {
      it('TC-STU-STAGE-16 : getStageValidationHistory -> 200', async () => {
        studentStageService.getStageValidationHistory.mockResolvedValue([{ id: 'h1', action: 'SUBMITTED' }]);

        const res = await request(app)
          .get('/api/student/stages/stage-1/validation-history')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentStageService.getStageValidationHistory).toHaveBeenCalledWith(1, 'stage-1');
      });
    });

    describe('POST /stages/:stageId/technologies', () => {
      it('TC-STU-STAGE-17 : addStageTechnologies -> 200', async () => {
        studentStageService.addStageTechnologies.mockResolvedValue({ id: 'stage-1', technologies: ['t1'] });

        const res = await request(app)
          .post('/api/student/stages/stage-1/technologies')
          .set('Cookie', `accessToken=${studentToken}`)
          .send({ technologyIds: ['t1'] });

        expect(res.status).toBe(200);
        expect(studentStageService.addStageTechnologies).toHaveBeenCalledWith(1, 'stage-1', ['t1']);
      });
    });

    describe('DELETE /stages/:stageId/technologies/:technologyId', () => {
      it('TC-STU-STAGE-18 : removeStageTechnology -> 200', async () => {
        studentStageService.removeStageTechnology.mockResolvedValue({ id: 'stage-1', technologies: [] });

        const res = await request(app)
          .delete('/api/student/stages/stage-1/technologies/t1')
          .set('Cookie', `accessToken=${studentToken}`);

        expect(res.status).toBe(200);
        expect(studentStageService.removeStageTechnology).toHaveBeenCalledWith(1, 'stage-1', 't1');
      });
    });

  });

});
