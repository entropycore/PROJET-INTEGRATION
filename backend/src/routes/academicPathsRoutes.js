'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const academicPathController = require('../controllers/student/academicPathController');
const {
  createAcademicPathRules,
  updateAcademicPathRules,
  handleValidationErrors,
} = require('../middlewares/validationRules');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', academicPathController.listAcademicPaths);
router.post('/', createAcademicPathRules, handleValidationErrors, academicPathController.createAcademicPath);
router.put('/:academicPathId', updateAcademicPathRules, handleValidationErrors, academicPathController.updateAcademicPath);
router.delete('/:academicPathId', academicPathController.deleteAcademicPath);

module.exports = router;
