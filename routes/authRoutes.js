const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ========================================
// ROTAS PÚBLICAS (sem autenticação)
// ========================================

// POST /api/auth/login - Fazer login
router.post('/login', AuthController.login);

// POST /api/auth/register - Registrar novo usuário
router.post('/register', AuthController.register);

// ========================================
// ROTAS PROTEGIDAS (com autenticação)
// ========================================

// GET /api/auth/me - Obter dados do usuário logado
router.get('/me', authMiddleware, AuthController.getMe);

module.exports = router;
