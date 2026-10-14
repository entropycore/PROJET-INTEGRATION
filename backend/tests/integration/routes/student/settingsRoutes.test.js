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

jest.mock('../../../../src/services/student/settingsService');
const studentSettingsService = require('../../../../src/services/student/settingsService');

const settingsRouter = require('../../../../src/routes/student/settingsRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student/settings', authMiddleware, checkRoles('STUDENT'), settingsRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Settings Étudiant (settingsRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-SET-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/settings');
      expect(res.status).toBe(401);
    });

    it('TC-STU-SET-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/settings')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-SET-01 : getSettings -> 200', async () => {
      studentSettingsService.getStudentSettings.mockResolvedValue({ privacy: 'PUBLIC', showEmail: true });

      const res = await request(app)
        .get('/api/student/settings')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentSettingsService.getStudentSettings).toHaveBeenCalledWith(1);
    });

    it('TC-STU-SET-02 : updateSettingsPassword -> 200', async () => {
      studentSettingsService.updateStudentSettingsPassword.mockResolvedValue({ success: true });

      const res = await request(app)
        .put('/api/student/settings/password')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ oldPassword: 'old', newPassword: 'new' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentSettingsService.updateStudentSettingsPassword).toHaveBeenCalledWith(1, { oldPassword: 'old', newPassword: 'new' });
    });

    it('TC-STU-SET-03 : updateSettingsPrivacy -> 200', async () => {
      studentSettingsService.updateStudentSettingsPrivacy.mockResolvedValue({ privacy: 'PRIVATE' });

      const res = await request(app)
        .put('/api/student/settings/privacy')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ privacy: 'PRIVATE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentSettingsService.updateStudentSettingsPrivacy).toHaveBeenCalledWith(1, { privacy: 'PRIVATE' });
    });

    it('TC-STU-SET-04 : updateSettingsNotifications -> 200', async () => {
      studentSettingsService.updateStudentSettingsNotifications.mockResolvedValue({ emailAlerts: false });

      const res = await request(app)
        .put('/api/student/settings/notifications')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ emailAlerts: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentSettingsService.updateStudentSettingsNotifications).toHaveBeenCalledWith(1, { emailAlerts: false });
    });

  });

});
