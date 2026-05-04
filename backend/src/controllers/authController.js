'use strict';

const authService = require('../services/authService');
const { setCookies, clearCookies, setAccessTokenCookie } = require('../utils/setCookies');

// Inscription
exports.register = async (req, res, next) => {
  try {
    await authService.registerProfessional(req.body);
    res.status(201).json({ success: true, message: "Demande envoyée. Vérifiez votre email." });
  } catch (err) {
    if (err.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
    }
    if (err.message === "EMAIL_SEND_FAILED") {
      return res.status(500).json({ success: false, message: "Erreur d'envoi d'email. Veuillez réessayer." });
    }
    next(err);
  }
};

// Vérification d'email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: "Token manquant." });

    await authService.verifyEmailToken(token);
    res.json({ success: true, message: "Email vérifié avec succès." });
  } catch (err) {
    if (err.message === "INVALID_TOKEN") return res.status(400).json({ success: false, message: "Lien invalide ou expiré." });
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Récupérer userAgent et IP du client
    const userAgent = req.get('user-agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Le service retourne les tokens et le rôle, et insère la session f l-DB
    const { role, accessToken, refreshToken } = await authService.loginUser(email, password, userAgent, ipAddress);

    setCookies(res, accessToken, refreshToken);
    res.json({ success: true, message: "Connexion réussie", role: role });

  } catch (err) {
    if (err.message === "INVALID_CREDENTIALS") return res.status(401).json({ success: false, message: "Identifiants invalides." });
    if (err.message === "EMAIL_NOT_VERIFIED") return res.status(403).json({ success: false, message: "Veuillez vérifier votre email." });
    if (err.message === "ACCOUNT_PENDING_APPROVAL") return res.status(403).json({ success: false, message: "Demande en attente de validation par l'administration." });
    if (err.message === "ACCOUNT_NOT_ACTIVE") return res.status(403).json({ success: false, message: "Compte en attente ou suspendu." });
    next(err);
  }
};

// Informations utilisateur connecté
exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies?.refreshToken;
    if (!refreshTokenCookie) {
      return res.status(401).json({ success: false, message: "Refresh token manquant." });
    }

    // On récupère JUSTE le nouveau Access Token (On garde le même refresh token pour la performance)
    const newAccessToken = await authService.refreshUserToken(
      req.user.userId,
      refreshTokenCookie
    );

    // On met à jour uniquement le cookie de l'Access Token (durée courte)
    setAccessTokenCookie(res, newAccessToken);

    res.json({ success: true, message: "Access Token renouvelé." });
  } catch (err) {
    if (err.message === "ACCOUNT_INACTIVE") return res.status(403).json({ success: false, message: "Compte inactif." });
    if (err.message === "INVALID_REFRESH_TOKEN") return res.status(401).json({ success: false, message: "Refresh token invalide ou révoqué." });
    if (err.message === "REFRESH_TOKEN_EXPIRED") return res.status(401).json({ success: false, message: "Refresh token expiré." });
    next(err);
  }
};

// Déconnexion
exports.logout = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies?.refreshToken;

    // Révoquer la session spécifique dans la DB si le token est présent
    if (refreshTokenCookie) {
      await authService.revokeToken(req.user.userId, refreshTokenCookie);
    }

    // Effacer les cookies du navigateur
    clearCookies(res);
    res.json({ success: true, message: "Déconnexion réussie." });
  } catch (err) {
    next(err);
  }
};
