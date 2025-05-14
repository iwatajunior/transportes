const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Importar o middleware de autenticação

// POST /api/v1/auth/register - Registrar um novo usuário (a lógica de permissão pode ser adicionada depois)
router.post('/register', authController.registerUser);

// POST /api/v1/auth/login - Login do usuário
router.post('/login', authController.loginUser);

// GET /api/v1/auth/me - (Opcional) Endpoint para verificar o usuário logado via token
// router.get('/me', authMiddleware.authenticateToken, authController.getMe);

// GET /api/v1/auth/profile - Retorna dados do perfil do usuário logado
router.get('/profile', authMiddleware.authenticateToken, authController.getUserProfile);

// POST /api/v1/auth/forgot-password - Solicitar redefinição de senha
router.post('/forgot-password', authController.forgotPassword);

// POST /api/v1/auth/reset-password/:token - Redefinir a senha com o token
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
