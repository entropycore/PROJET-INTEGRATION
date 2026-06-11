'use strict';

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../src/services/student/profilePictureStorage');
const { getProfilePicturePath } = require('../../../src/services/student/profilePictureStorage');

const fs = require('fs');

const profilePictureRouter = require('../../../src/routes/profilePictureRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/profile-pictures', profilePictureRouter);

// Simple error handler for sendFile failures or route errors in the test app
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests d'Intégration - Routes Photos de Profil (profilePictureRoutes)", () => {

  describe('Endpoints Logic', () => {

    it('TC-PIC-01 : getProfilePicture -> 200', async () => {
      // Return a valid target object with a readable stream for sendStoredFile
      getProfilePicturePath.mockResolvedValue({
        mode: 'stream',
        contentDisposition: 'inline',
        stream: fs.createReadStream(__filename),
      });

      const res = await request(app).get('/api/profile-pictures/test.jpg');

      expect(res.status).toBe(200);
      expect(getProfilePicturePath).toHaveBeenCalledWith('test.jpg');
    });

    it('TC-PIC-02 : getProfilePicture - Fichier non trouvé -> 404', async () => {
      getProfilePicturePath.mockImplementation(() => {
        throw new Error('PROFILE_PICTURE_FILE_NOT_FOUND');
      });

      const res = await request(app).get('/api/profile-pictures/inconnu.jpg');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

  });

});
