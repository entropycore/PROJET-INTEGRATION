'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const academicPathController = require('../controllers/student/academicPathController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', academicPathController.listAcademicPaths);
router.post('/', academicPathController.createAcademicPath);
router.put('/:academicPathId', academicPathController.updateAcademicPath);
router.delete('/:academicPathId', academicPathController.deleteAcademicPath);

module.exports = router;
