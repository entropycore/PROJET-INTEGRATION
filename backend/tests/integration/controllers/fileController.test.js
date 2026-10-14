'use strict';

const fileController = require('../../../src/controllers/fileController');
const fileService = require('../../../src/services/fileService');

jest.mock('../../../src/services/fileService');

describe('CONTROLLER TESTS - fileController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: { userId: 1, role: 'STUDENT' },
      file: { originalname: 'test.txt' },
      files: [{ originalname: 'test.txt' }],
      body: {},
      params: { fileId: 'file-123' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(val => val),
      redirect: jest.fn(),
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('uploadFile', () => {
    it('devrait reussir et renvoyer 201', async () => {
      fileService.uploadFile.mockResolvedValue({ id: 'file-123' });
      await fileController.uploadFile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Fichier envoyé avec succès.',
        data: { id: 'file-123' },
      });
    });

    it('devrait gerer les erreurs avec status via handleFileError', async () => {
      const err = new Error('FILE_REQUIRED');
      err.status = 400;
      fileService.uploadFile.mockRejectedValue(err);

      await fileController.uploadFile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Aucun fichier reçu.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait propager les erreurs sans status vers next', async () => {
      const err = new Error('RANDOM_DATABASE_ERROR');
      fileService.uploadFile.mockRejectedValue(err);

      await fileController.uploadFile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('uploadFiles', () => {
    it('devrait reussir et renvoyer 201', async () => {
      fileService.uploadFiles.mockResolvedValue([{ id: 'file-123' }]);
      await fileController.uploadFiles(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('devrait gerer les erreurs via next', async () => {
      const err = new Error('DATABASE_ERROR');
      fileService.uploadFiles.mockRejectedValue(err);
      await fileController.uploadFiles(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('getFileMetadata', () => {
    it('devrait reussir et renvoyer 200', async () => {
      fileService.getFileMetadata.mockResolvedValue({ id: 'file-123' });
      await fileController.getFileMetadata(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('devrait gerer les erreurs via next', async () => {
      const err = new Error('DATABASE_ERROR');
      fileService.getFileMetadata.mockRejectedValue(err);
      await fileController.getFileMetadata(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('getPublicFileMetadata', () => {
    it('devrait reussir et renvoyer 200', async () => {
      fileService.getPublicFileMetadata.mockResolvedValue({ id: 'file-123' });
      await fileController.getPublicFileMetadata(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('devrait gerer les erreurs via next', async () => {
      const err = new Error('DATABASE_ERROR');
      fileService.getPublicFileMetadata.mockRejectedValue(err);
      await fileController.getPublicFileMetadata(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('downloadFile', () => {
    it('devrait gerer la redirection', async () => {
      fileService.getDownloadTarget.mockResolvedValue({
        file: { originalName: 'test.txt', mimeType: 'text/plain' },
        target: { mode: 'redirect', url: 'http://redirect-url' },
      });

      await fileController.downloadFile(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('http://redirect-url');
    });

    it('devrait gerer le stream et configurer les headers Content-Disposition', async () => {
      const mockStream = {
        on: jest.fn(),
        pipe: jest.fn(),
      };
      fileService.getDownloadTarget.mockResolvedValue({
        file: { originalName: 'test.txt', mimeType: 'text/plain' },
        target: { mode: 'stream', stream: mockStream, contentDisposition: 'attachment' },
      });

      await fileController.downloadFile(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename="test.txt"')
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(mockRes);
    });

    it('devrait gerer les erreurs via next', async () => {
      const err = new Error('DATABASE_ERROR');
      fileService.getDownloadTarget.mockRejectedValue(err);
      await fileController.downloadFile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('downloadPublicFile', () => {
    it('devrait gerer la redirection', async () => {
      fileService.getPublicDownloadTarget.mockResolvedValue({
        file: { originalName: 'test.txt', mimeType: 'text/plain' },
        target: { mode: 'redirect', url: 'http://redirect-url' },
      });

      await fileController.downloadPublicFile(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('http://redirect-url');
    });

    it('devrait gerer le stream public', async () => {
      const mockStream = {
        on: jest.fn(),
        pipe: jest.fn(),
      };
      fileService.getPublicDownloadTarget.mockResolvedValue({
        file: { originalName: 'test.txt', mimeType: 'text/plain' },
        target: { mode: 'stream', stream: mockStream, contentDisposition: 'inline' },
      });

      await fileController.downloadPublicFile(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(mockStream.pipe).toHaveBeenCalledWith(mockRes);
    });

    it('devrait gerer les erreurs via next', async () => {
      const err = new Error('DATABASE_ERROR');
      fileService.getPublicDownloadTarget.mockRejectedValue(err);
      await fileController.downloadPublicFile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('deleteFile', () => {
    it('devrait reussir et renvoyer 200', async () => {
      fileService.deleteFile.mockResolvedValue({ id: 'file-123' });
      await fileController.deleteFile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('devrait gerer les erreurs via next', async () => {
      const err = new Error('DATABASE_ERROR');
      fileService.deleteFile.mockRejectedValue(err);
      await fileController.deleteFile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });
});
