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

jest.mock('../../../../src/services/student/profileService');
const studentProfileService = require('../../../../src/services/student/profileService');

const profileRouter = require('../../../../src/routes/student/profileRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), profileRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Profil Étudiant (profileRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-PROF-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/profile');
      expect(res.status).toBe(401);
    });

    it('TC-STU-PROF-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/profile')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-PROF-01 : getProfile -> 200', async () => {
      studentProfileService.getStudentProfile.mockResolvedValue({ user: { id: 1 }, profile: {} });

      const res = await request(app)
        .get('/api/student/profile')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentProfileService.getStudentProfile).toHaveBeenCalledWith(1);
    });

    it('TC-STU-PROF-02 : uploadProfilePicture -> 200', async () => {
      studentProfileService.updateStudentProfilePicture.mockResolvedValue({ profilePicture: 'pic.jpg' });

      const res = await request(app)
        .post('/api/student/profile-picture')
        .set('Cookie', `accessToken=${studentToken}`)
        .attach('profilePicture', Buffer.from('image content'), 'avatar.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(studentProfileService.updateStudentProfilePicture).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('TC-STU-PROF-03 : getCareerGoal -> 200', async () => {
      studentProfileService.getStudentCareerGoal.mockResolvedValue({ careerGoal: 'Software Architect' });

      const res = await request(app)
        .get('/api/student/career-goal')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.careerGoal).toBe('Software Architect');
      expect(studentProfileService.getStudentCareerGoal).toHaveBeenCalledWith(1);
    });

    it('TC-STU-PROF-04 : updateCareerGoal -> 200', async () => {
      studentProfileService.updateStudentCareerGoal.mockResolvedValue({ careerGoal: 'Data Scientist' });

      const res = await request(app)
        .put('/api/student/career-goal')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({ careerGoal: 'Data Scientist' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.careerGoal).toBe('Data Scientist');
      expect(studentProfileService.updateStudentCareerGoal).toHaveBeenCalledWith(1, { careerGoal: 'Data Scientist' });
    });

  });

});
