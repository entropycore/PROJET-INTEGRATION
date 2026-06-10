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

jest.mock('../../../../src/services/studentCommentService');
const studentCommentService = require('../../../../src/services/studentCommentService');

const commentRouter = require('../../../../src/routes/student/commentRoutes');
const authMiddleware = require('../../../../src/middlewares/authMiddleware');
const checkRoles = require('../../../../src/middlewares/checkRoles');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/student', authMiddleware, checkRoles('STUDENT'), commentRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const studentToken = makeToken();

beforeEach(() => jest.clearAllMocks());

describe("Tests d'Intégration - Routes Commentaires Étudiant (commentRoutes)", () => {

  describe('Sécurité & Rôles', () => {

    it('TC-STU-COMM-SEC-01 : Sans token -> 401', async () => {
      const res = await request(app).get('/api/student/comments');
      expect(res.status).toBe(401);
    });

    it('TC-STU-COMM-SEC-02 : Professeur accède -> 403', async () => {
      const res = await request(app)
        .get('/api/student/comments')
        .set('Cookie', `accessToken=${makeToken('PROFESSOR')}`);
      expect(res.status).toBe(403);
    });

  });

  describe('Endpoints Logic', () => {

    it('TC-STU-COMM-01 : getComments -> 200', async () => {
      const mockResult = {
        stats: { received: 2, pending: 1, rejected: 0 },
        comments: [
          { id: 'c-1', content: 'Super projet', status: 'RECEIVED' },
          { id: 'c-2', content: 'Correction requise', status: 'PENDING' },
        ],
      };
      studentCommentService.listStudentComments.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/student/comments?status=ALL')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.comments).toHaveLength(2);
      expect(studentCommentService.listStudentComments).toHaveBeenCalledWith(1, { status: 'ALL' });
    });

    it('TC-STU-COMM-02 : getCommentById -> 200', async () => {
      const mockComment = { id: 'c-1', content: 'Super projet', status: 'RECEIVED' };
      studentCommentService.getStudentCommentById.mockResolvedValue(mockComment);

      const res = await request(app)
        .get('/api/student/comments/c-1')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('c-1');
      expect(studentCommentService.getStudentCommentById).toHaveBeenCalledWith(1, 'c-1');
    });

    it('TC-STU-COMM-03 : getCommentById introuvable -> 404', async () => {
      studentCommentService.getStudentCommentById.mockRejectedValue(new Error('COMMENT_NOT_FOUND'));

      const res = await request(app)
        .get('/api/student/comments/c-unknown')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('introuvable');
    });

  });

});
