'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
const { Readable } = require('stream');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../src/services/fileService');
const fileService = require('../../../src/services/fileService');

const fileRouter = require('../../../src/routes/fileRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/files', fileRouter);

const makeToken = (role = 'STUDENT', roleId = 40) =>
  jwt.sign(
    { userId: 1, role, roleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const userToken = makeToken();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests d'Intégration - Routes de Fichiers (fileRoutes)", () => {

  describe('Endpoints Publics', () => {

    it('TC-FILE-01 : getPublicFileMetadata -> 200', async () => {
      const mockFile = { id: 'file-123', originalName: 'doc.pdf', isPublic: true };
      fileService.getPublicFileMetadata.mockResolvedValue(mockFile);

      const res = await request(app).get('/api/files/public/file-123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockFile);
      expect(fileService.getPublicFileMetadata).toHaveBeenCalledWith({ fileId: 'file-123' });
    });

    it('TC-FILE-02 : downloadPublicFile (Redirect) -> 302', async () => {
      const mockResult = {
        file: { originalName: 'doc.pdf', mimeType: 'application/pdf' },
        target: { mode: 'redirect', url: 'https://storage.example.com/doc.pdf' }
      };
      fileService.getPublicDownloadTarget.mockResolvedValue(mockResult);

      const res = await request(app).get('/api/files/public/file-123/download');

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('https://storage.example.com/doc.pdf');
    });

    it('TC-FILE-03 : downloadPublicFile (Stream) -> 200', async () => {
      const mockStream = Readable.from(['dummy content']);

      const mockResult = {
        file: { originalName: 'doc.pdf', mimeType: 'application/pdf' },
        target: { mode: 'stream', stream: mockStream, contentDisposition: 'inline' }
      };
      fileService.getPublicDownloadTarget.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/files/public/file-123/download')
        .buffer();

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.header['content-disposition']).toContain('filename="doc.pdf"');
      expect(res.body.toString()).toBe('dummy content');
    });

  });

  describe('Sécurité - Endpoints Privés', () => {

    it('TC-FILE-SEC-01 : Sans token pour getFileMetadata -> 401', async () => {
      const res = await request(app).get('/api/files/file-123');
      expect(res.status).toBe(401);
    });

  });

  describe('Endpoints Privés', () => {

    it('TC-FILE-04 : getFileMetadata -> 200', async () => {
      const mockFile = { id: 'file-123', originalName: 'doc.pdf', isPublic: false };
      fileService.getFileMetadata.mockResolvedValue(mockFile);

      const res = await request(app)
        .get('/api/files/file-123')
        .set('Cookie', `accessToken=${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockFile);
      expect(fileService.getFileMetadata).toHaveBeenCalledWith({
        user: expect.objectContaining({ userId: 1 }),
        fileId: 'file-123'
      });
    });

    it('TC-FILE-05 : uploadFile -> 201', async () => {
      const mockUploadedFile = { id: 'file-123', originalName: 'test.png' };
      fileService.uploadFile.mockResolvedValue(mockUploadedFile);

      const res = await request(app)
        .post('/api/files')
        .set('Cookie', `accessToken=${userToken}`)
        .attach('file', Buffer.from('fake image'), 'test.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockUploadedFile);
      expect(fileService.uploadFile).toHaveBeenCalled();
    });

    it('TC-FILE-06 : uploadFiles (batch) -> 201', async () => {
      const mockUploadedFiles = [{ id: 'file-123', originalName: 'test.png' }];
      fileService.uploadFiles.mockResolvedValue(mockUploadedFiles);

      const res = await request(app)
        .post('/api/files/batch')
        .set('Cookie', `accessToken=${userToken}`)
        .attach('files', Buffer.from('fake image'), 'test.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockUploadedFiles);
      expect(fileService.uploadFiles).toHaveBeenCalled();
    });

    it('TC-FILE-07 : downloadFile (Redirect) -> 302', async () => {
      const mockResult = {
        file: { originalName: 'doc.pdf', mimeType: 'application/pdf' },
        target: { mode: 'redirect', url: 'https://storage.example.com/doc.pdf' }
      };
      fileService.getDownloadTarget.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/files/file-123/download')
        .set('Cookie', `accessToken=${userToken}`);

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('https://storage.example.com/doc.pdf');
    });

    it('TC-FILE-08 : deleteFile -> 200', async () => {
      const mockDeleted = { id: 'file-123', deleted: true };
      fileService.deleteFile.mockResolvedValue(mockDeleted);

      const res = await request(app)
        .delete('/api/files/file-123')
        .set('Cookie', `accessToken=${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockDeleted);
      expect(fileService.deleteFile).toHaveBeenCalledWith({
        user: expect.objectContaining({ userId: 1 }),
        fileId: 'file-123'
      });
    });

  });

});
