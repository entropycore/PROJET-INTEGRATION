const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const verifyRefreshToken = require('../middlewares/verifyRefreshToken');

const { authLimiter } = require('../middlewares/rateLimiter'); 


const { validationRules, handleValidationErrors } = require('../middlewares/validationRules');


router.post('/register', authLimiter, validationRules('register'), handleValidationErrors, authController.register);

router.post('/login', authLimiter, validationRules('login'), handleValidationErrors, authController.login);
router.post('/refresh-token', verifyRefreshToken, authController.refreshToken);
// Route pour la vérification de l'email
router.get('/verify-email', authController.verifyEmail);


router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);//j ai supprimer aauthMiddleware car notre but et de supprimer cookie et pâs de verifier token

module.exports = router;