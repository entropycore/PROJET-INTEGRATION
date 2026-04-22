const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');


const { authLimiter } = require('../middlewares/rateLimiter'); 


const { validationRules, handleValidationErrors } = require('../middlewares/validationRules');


router.post('/register', authLimiter, validationRules('register'), handleValidationErrors, authController.register);

router.post('/login', authLimiter, validationRules('login'), handleValidationErrors, authController.login);
// Route pour la vérification de l'email
router.get('/verify-email', authController.verifyEmail);


router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;