'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Mock the services
const mockProfessorService = {
  getProfessorDashboard: jest.fn(),
  getProfessorProfile: jest.fn(),
  updateProfessorProfilePicture: jest.fn(),
  getProfessorSettings: jest.fn(),
  updateProfessorSettingsPassword: jest.fn(),
  updateProfessorSettingsPrivacy: jest.fn(),
  updateProfessorSettingsNotifications: jest.fn(),
  listProfessorValidations: jest.fn(),
  getProfessorValidationStats: jest.fn(),
  getProfessorValidationDetail: jest.fn(),
  getProfessorValidationFile: jest.fn(),
  approveProfessorValidation: jest.fn(),
  rejectProfessorValidation: jest.fn(),
  requestProfessorValidationChanges: jest.fn()
};

jest.mock('../../../src/services/professorService', () => mockProfessorService);

const mockUserNotificationService = {
  listUserNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  getUnreadNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn()
};

jest.mock('../../../src/services/userNotificationService', () => mockUserNotificationService);

// Mock the upload middleware so we don't need to upload real files
jest.mock('../../../src/middlewares/uploadProfilePicture', () => (req, res, next) => {
  if (req.headers['x-test-empty-upload']) {
    // Simulate empty upload
    return next();
  }
  req.file = {
    fieldname: 'file',
    originalname: 'avatar.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake image data'),
    size: 15
  };
  next();
});

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const professorRouter = require('../../../src/routes/professorRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/professor', professorRouter);

const SECRET = process.env.ACCESS_TOKEN_SECRET || 'testsecret';

const makeToken = (role = 'PROFESSOR', roleId = 30, expiresIn = '1h') =>
  jwt.sign(
    { userId: 1, role, roleId },
    SECRET,
    { expiresIn }
  );

const professorToken = makeToken();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests d'Intégration Complets - Routes Professeur", () => {

  describe('Sécurité & Rôles', () => {
    it('TC-PRF-SEC-01 : Sans token → 401', async () => {
      const res = await request(app).get('/api/professor/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('TC-PRF-SEC-02 : Token expiré → 401', async () => {
      const expiredToken = makeToken('PROFESSOR', 30, '-1s');
      const res = await request(app)
        .get('/api/professor/dashboard')
        .set('Cookie', `accessToken=${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('TC-PRF-SEC-03 : Étudiant tente accès Professeur → 403', async () => {
      const res = await request(app)
        .get('/api/professor/dashboard')
        .set('Cookie', `accessToken=${makeToken('STUDENT')}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Dashboard Endpoints', () => {
    it('TC-PRF-DSH-01 : getDashboard Succès → 200', async () => {
      const mockDashboard = { area: 'professor', user: { id: 1 } };
      mockProfessorService.getProfessorDashboard.mockResolvedValue(mockDashboard);

      const res = await request(app)
        .get('/api/professor/dashboard')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockDashboard);
      expect(mockProfessorService.getProfessorDashboard).toHaveBeenCalledWith(1);
    });

    it('TC-PRF-DSH-02 : getDashboard Profil Non Trouvé → 200 avec tableau vide', async () => {
      mockProfessorService.getProfessorDashboard.mockRejectedValue(new Error('PROFESSOR_PROFILE_NOT_FOUND'));

      const res = await request(app)
        .get('/api/professor/dashboard')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.area).toBe('professor');
      expect(res.body.data.profileSnapshot).toBeNull();
    });
  });

  describe('Profile Endpoints', () => {
    it('TC-PRF-PRF-01 : getProfile Succès → 200', async () => {
      const mockProfile = { user: { id: 1 }, profile: { employeeId: 'P123' } };
      mockProfessorService.getProfessorProfile.mockResolvedValue(mockProfile);

      const res = await request(app)
        .get('/api/professor/profile')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockProfile);
    });

    it('TC-PRF-PRF-02 : getProfile Profil Non Trouvé → 200 avec profil vide', async () => {
      mockProfessorService.getProfessorProfile.mockRejectedValue(new Error('PROFESSOR_PROFILE_NOT_FOUND'));

      const res = await request(app)
        .get('/api/professor/profile')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.profile).toBeNull();
    });

    it('TC-PRF-PRF-03 : uploadProfilePicture Succès → 200', async () => {
      const mockResult = { url: 'https://avatar-url.com' };
      mockProfessorService.updateProfessorProfilePicture.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/professor/profile-picture')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockResult);
    });

    it('TC-PRF-PRF-04 : uploadProfilePicture Sans Fichier → 400', async () => {
      mockProfessorService.updateProfessorProfilePicture.mockRejectedValue(new Error('PROFILE_PICTURE_UPLOAD_EMPTY'));

      const res = await request(app)
        .post('/api/professor/profile-picture')
        .set('x-test-empty-upload', 'true')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Photo de profil requise');
    });
  });

  describe('Settings Endpoints', () => {
    it('TC-PRF-SET-01 : getSettings Succès → 200', async () => {
      const mockSettings = { emailNotifications: true };
      mockProfessorService.getProfessorSettings.mockResolvedValue(mockSettings);

      const res = await request(app)
        .get('/api/professor/settings')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockSettings);
    });

    it('TC-PRF-SET-02 : updateSettingsPassword Succès → 200', async () => {
      mockProfessorService.updateProfessorSettingsPassword.mockResolvedValue({ success: true });

      const res = await request(app)
        .put('/api/professor/settings/password')
        .send({ currentPassword: 'old', newPassword: 'newpassword', confirmPassword: 'newpassword' })
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
    });

    it('TC-PRF-SET-03 : updateSettingsPassword Mot de passe invalide → 400', async () => {
      mockProfessorService.updateProfessorSettingsPassword.mockRejectedValue(new Error('CURRENT_PASSWORD_INVALID'));

      const res = await request(app)
        .put('/api/professor/settings/password')
        .send({ currentPassword: 'wrong', newPassword: 'newpassword', confirmPassword: 'newpassword' })
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('correct');
    });

    it('TC-PRF-SET-04 : updateSettingsPrivacy Succès → 200', async () => {
      const mockPrivacy = { showEmail: false };
      mockProfessorService.updateProfessorSettingsPrivacy.mockResolvedValue(mockPrivacy);

      const res = await request(app)
        .put('/api/professor/settings/privacy')
        .send(mockPrivacy)
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockPrivacy);
    });

    it('TC-PRF-SET-05 : updateSettingsNotifications Succès → 200', async () => {
      const mockNotifications = { emailAlerts: true };
      mockProfessorService.updateProfessorSettingsNotifications.mockResolvedValue(mockNotifications);

      const res = await request(app)
        .put('/api/professor/settings/notifications')
        .send(mockNotifications)
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockNotifications);
    });
  });

  describe('Validations Endpoints', () => {
    it('TC-PRF-VAL-01 : getValidationStats Succès → 200', async () => {
      const mockStats = { pending: 3, approved: 10 };
      mockProfessorService.getProfessorValidationStats.mockResolvedValue(mockStats);

      const res = await request(app)
        .get('/api/professor/validations/stats')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockStats);
    });

    it('TC-PRF-VAL-02 : listValidations Succès → 200', async () => {
      const mockValidations = [{ id: 1, type: 'PROJECT', status: 'PENDING' }];
      mockProfessorService.listProfessorValidations.mockResolvedValue(mockValidations);

      const res = await request(app)
        .get('/api/professor/validations?type=PROJECT&status=PENDING')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockValidations);
      expect(mockProfessorService.listProfessorValidations).toHaveBeenCalledWith(1, {
        type: 'PROJECT',
        status: 'PENDING',
        search: undefined
      });
    });

    it('TC-PRF-VAL-03 : getValidationDetail Succès → 200', async () => {
      const mockDetail = { id: 1, studentName: 'Alex' };
      mockProfessorService.getProfessorValidationDetail.mockResolvedValue(mockDetail);

      const res = await request(app)
        .get('/api/professor/validations/PROJECT/1')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockDetail);
    });

    it('TC-PRF-VAL-04 : getValidationDetail Introuvable → 404', async () => {
      mockProfessorService.getProfessorValidationDetail.mockRejectedValue(new Error('PROFESSOR_VALIDATION_NOT_FOUND'));

      const res = await request(app)
        .get('/api/professor/validations/PROJECT/999')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('introuvable');
    });

    it('TC-PRF-VAL-05 : downloadValidationFile (Redirect) Succès → 302', async () => {
      const mockFile = {
        target: {
          mode: 'redirect',
          url: 'https://s3.amazonaws.com/test-file.pdf'
        },
        crossOriginResourcePolicy: 'cross-origin'
      };
      mockProfessorService.getProfessorValidationFile.mockResolvedValue(mockFile);

      const res = await request(app)
        .get('/api/professor/validations/PROJECT/1/files/file-123/download')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(302);
      expect(res.header['location']).toBe('https://s3.amazonaws.com/test-file.pdf');
    });

    it('TC-PRF-VAL-06 : downloadValidationFile Introuvable → 404', async () => {
      mockProfessorService.getProfessorValidationFile.mockRejectedValue(new Error('PROFESSOR_VALIDATION_FILE_NOT_FOUND'));

      const res = await request(app)
        .get('/api/professor/validations/PROJECT/1/files/file-999/download')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(404);
    });

    it('TC-PRF-VAL-07 : approveValidation Succès → 200', async () => {
      const mockResult = { id: 1, status: 'APPROVED' };
      mockProfessorService.approveProfessorValidation.mockResolvedValue(mockResult);

      const res = await request(app)
        .patch('/api/professor/validations/PROJECT/1/approve')
        .send({ comments: 'Good job' })
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockResult);
    });

    it('TC-PRF-VAL-08 : approveValidation Invalid State → 409', async () => {
      mockProfessorService.approveProfessorValidation.mockRejectedValue(new Error('PROFESSOR_VALIDATION_INVALID_STATE'));

      const res = await request(app)
        .patch('/api/professor/validations/PROJECT/1/approve')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(409);
    });

    it('TC-PRF-VAL-09 : rejectValidation Succès → 200', async () => {
      const mockResult = { id: 1, status: 'REJECTED' };
      mockProfessorService.rejectProfessorValidation.mockResolvedValue(mockResult);

      const res = await request(app)
        .patch('/api/professor/validations/PROJECT/1/reject')
        .send({ comments: 'Incomplete' })
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
    });

    it('TC-PRF-VAL-10 : requestValidationChanges Succès → 200', async () => {
      const mockResult = { id: 1, status: 'CHANGES_REQUESTED' };
      mockProfessorService.requestProfessorValidationChanges.mockResolvedValue(mockResult);

      const res = await request(app)
        .patch('/api/professor/validations/PROJECT/1/request-changes')
        .send({ comments: 'Please fix X' })
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Notifications Endpoints', () => {
    it('TC-PRF-NTF-01 : listNotifications → 200', async () => {
      mockUserNotificationService.listUserNotifications.mockResolvedValue({ items: [], total: 0 });
      const res = await request(app)
        .get('/api/professor/notifications')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toEqual([]);
    });

    it('TC-PRF-NTF-02 : getUnreadCount → 200', async () => {
      mockUserNotificationService.getUnreadCount.mockResolvedValue(0);
      const res = await request(app)
        .get('/api/professor/notifications/unread-count')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(0);
    });

    it('TC-PRF-NTF-03 : markAllAsRead → 200', async () => {
      mockUserNotificationService.markAllAsRead.mockResolvedValue({ count: 0 });
      const res = await request(app)
        .patch('/api/professor/notifications/read-all')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
    });

    it('TC-PRF-NTF-04 : markAsRead → 200', async () => {
      mockUserNotificationService.markAsRead.mockResolvedValue({ notificationId: 'notif-123' });
      const res = await request(app)
        .patch('/api/professor/notifications/notif-123/read')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notificationId).toBe('notif-123');
    });

    it('TC-PRF-NTF-05 : deleteNotification → 200', async () => {
      mockUserNotificationService.deleteNotification.mockResolvedValue({ notificationId: 'notif-123' });
      const res = await request(app)
        .delete('/api/professor/notifications/notif-123')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notificationId).toBe('notif-123');
    });
  });

  describe('handleProfessorError Coverage', () => {
    it('Error: PROFESSOR_VALIDATION_NOT_FOUND', async () => {
      mockProfessorService.getProfessorValidationDetail.mockRejectedValue(new Error('PROFESSOR_VALIDATION_NOT_FOUND'));
      const res = await request(app)
        .get('/api/professor/validations/PROJECT/1')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Validation professeur introuvable');
    });

    it('Error: PROFESSOR_VALIDATION_FILE_NOT_FOUND', async () => {
      mockProfessorService.getProfessorValidationFile.mockRejectedValue(new Error('PROFESSOR_VALIDATION_FILE_NOT_FOUND'));
      const res = await request(app)
        .get('/api/professor/validations/PROJECT/1/files/file-1/download')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Fichier de validation introuvable');
    });

    it('Error: PROFESSOR_VALIDATION_INVALID_STATE', async () => {
      mockProfessorService.approveProfessorValidation.mockRejectedValue(new Error('PROFESSOR_VALIDATION_INVALID_STATE'));
      const res = await request(app)
        .patch('/api/professor/validations/PROJECT/1/approve')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('ne peut plus être modifiée');
    });

    it('Error: UNSUPPORTED_PROFESSOR_VALIDATION_TYPE', async () => {
      mockProfessorService.listProfessorValidations.mockRejectedValue(new Error('UNSUPPORTED_PROFESSOR_VALIDATION_TYPE'));
      const res = await request(app)
        .get('/api/professor/validations')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Type de validation professeur invalide');
    });

    it('Error: UNSUPPORTED_PROFESSOR_VALIDATION_STATUS', async () => {
      mockProfessorService.listProfessorValidations.mockRejectedValue(new Error('UNSUPPORTED_PROFESSOR_VALIDATION_STATUS'));
      const res = await request(app)
        .get('/api/professor/validations')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Statut de validation professeur invalide');
    });

    it('Error: PROFESSOR_PROFILE_REQUIRED_FIELDS', async () => {
      mockProfessorService.updateProfessorProfilePicture.mockRejectedValue(new Error('PROFESSOR_PROFILE_REQUIRED_FIELDS'));
      const res = await request(app)
        .post('/api/professor/profile-picture')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('prénom et le nom');
    });

    it('Error: PROFILE_PICTURE_FILE_NOT_FOUND', async () => {
      mockProfessorService.updateProfessorProfilePicture.mockRejectedValue(new Error('PROFILE_PICTURE_FILE_NOT_FOUND'));
      const res = await request(app)
        .post('/api/professor/profile-picture')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Photo de profil introuvable');
    });

    it('Error: CURRENT_PASSWORD_REQUIRED', async () => {
      mockProfessorService.updateProfessorSettingsPassword.mockRejectedValue(new Error('CURRENT_PASSWORD_REQUIRED'));
      const res = await request(app)
        .put('/api/professor/settings/password')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('mot de passe actuel est requis');
    });

    it('Error: NEW_PASSWORD_REQUIRED', async () => {
      mockProfessorService.updateProfessorSettingsPassword.mockRejectedValue(new Error('NEW_PASSWORD_REQUIRED'));
      const res = await request(app)
        .put('/api/professor/settings/password')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('nouveau mot de passe est requis');
    });

    it('Error: NEW_PASSWORD_TOO_SHORT', async () => {
      mockProfessorService.updateProfessorSettingsPassword.mockRejectedValue(new Error('NEW_PASSWORD_TOO_SHORT'));
      const res = await request(app)
        .put('/api/professor/settings/password')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('au moins 8 caractères');
    });

    it('Error: PASSWORD_CONFIRMATION_MISMATCH', async () => {
      mockProfessorService.updateProfessorSettingsPassword.mockRejectedValue(new Error('PASSWORD_CONFIRMATION_MISMATCH'));
      const res = await request(app)
        .put('/api/professor/settings/password')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('confirmation du mot de passe ne correspond pas');
    });

    it('Error: NEW_PASSWORD_SAME_AS_CURRENT', async () => {
      mockProfessorService.updateProfessorSettingsPassword.mockRejectedValue(new Error('NEW_PASSWORD_SAME_AS_CURRENT'));
      const res = await request(app)
        .put('/api/professor/settings/password')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('différent du mot de passe actuel');
    });

    it('Error: INVALID_PROFILE_VISIBILITY', async () => {
      mockProfessorService.updateProfessorSettingsPrivacy.mockRejectedValue(new Error('INVALID_PROFILE_VISIBILITY'));
      const res = await request(app)
        .put('/api/professor/settings/privacy')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('visibilité du profil est invalide');
    });

    it('Error: INVALID_PRIVACY_BOOLEAN_VALUE', async () => {
      mockProfessorService.updateProfessorSettingsPrivacy.mockRejectedValue(new Error('INVALID_PRIVACY_BOOLEAN_VALUE'));
      const res = await request(app)
        .put('/api/professor/settings/privacy')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('doivent être booléennes');
    });

    it('Error: INVALID_NOTIFICATION_BOOLEAN_VALUE', async () => {
      mockProfessorService.updateProfessorSettingsNotifications.mockRejectedValue(new Error('INVALID_NOTIFICATION_BOOLEAN_VALUE'));
      const res = await request(app)
        .put('/api/professor/settings/notifications')
        .set('Cookie', `accessToken=${professorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('doivent être booléennes');
    });

    it('Error: Unhandled unexpected error → next(err) / 500', async () => {
      mockProfessorService.getProfessorSettings.mockRejectedValue(new Error('RANDOM_DATABASE_ERROR'));

      // Use a custom error handler for this test block
      const tempApp = express();
      tempApp.use(cookieParser());
      tempApp.use('/api/professor', professorRouter);
      tempApp.use((err, req, res, next) => {
        res.status(500).json({ success: false, error: err.message });
      });

      const res = await request(tempApp)
        .get('/api/professor/settings')
        .set('Cookie', `accessToken=${professorToken}`);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('RANDOM_DATABASE_ERROR');
    });
  });

});