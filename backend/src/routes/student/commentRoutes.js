'use strict';

const express = require('express');
const commentController = require('../../controllers/student/commentController');

const router = express.Router();

router.get('/comments', commentController.listComments);

module.exports = router;
