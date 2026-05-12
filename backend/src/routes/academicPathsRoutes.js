'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoles = require('../middlewares/checkRoles');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRoles('STUDENT'));

router.get('/me', studentController.listAcademicPaths);
router.post('/', studentController.createAcademicPath);
router.put('/:academicPathId', studentController.updateAcademicPath);
router.delete('/:academicPathId', studentController.deleteAcademicPath);

module.exports = router;
