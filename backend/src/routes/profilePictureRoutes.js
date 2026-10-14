'use strict';

const express = require('express');
const profilePictureController = require('../controllers/profilePictureController');

const router = express.Router();

router.get('/:fileName', profilePictureController.getProfilePicture);

module.exports = router;
