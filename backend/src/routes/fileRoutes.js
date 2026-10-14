'use strict';

const express = require('express');

const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  uploadMultipleFiles,
  uploadSingleFile,
} = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/public/:fileId', fileController.getPublicFileMetadata);
router.get('/public/:fileId/download', fileController.downloadPublicFile);

router.use(authMiddleware);

router.post('/', uploadSingleFile('file'), fileController.uploadFile);
router.post('/batch', uploadMultipleFiles('files', 10), fileController.uploadFiles);
router.get('/:fileId', fileController.getFileMetadata);
router.get('/:fileId/download', fileController.downloadFile);
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
