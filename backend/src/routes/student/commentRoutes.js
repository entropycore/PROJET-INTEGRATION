'use strict';

const express = require('express');
const commentController = require('../../controllers/student/commentController');

const router = express.Router();

router.get('/comments', commentController.getComments);
router.get('/comments/:commentId', commentController.getCommentById);

module.exports = router;
