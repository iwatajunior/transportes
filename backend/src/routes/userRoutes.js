const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../config/multerConfig');
const { authenticateToken, authorizeRoles, isAdmin } = require('../middleware/authMiddleware'); // Ajuste o caminho
const { USER_ROLES, normalizePerfil } = require('../utils/userConstants');

// Rota protegida para buscar motoristas (usuários com perfil Motorista e ativos)
router.get(
    '/drivers',
    authenticateToken,
    authorizeRoles(USER_ROLES.GESTOR, USER_ROLES.ADMINISTRADOR),
    userController.getDrivers // Nova função no controller
);

// Rota pública para registrar um novo usuário (ou pode ser protegida dependendo da lógica de negócio)
// Se qualquer um pode se registrar, mas com um perfil padrão, a lógica de perfil seria no controller.
// Se apenas um admin pode criar usuários, esta rota seria protegida.
// Assumindo que a criação de usuários com perfis específicos é uma tarefa administrativa:
router.post(
    '/register',
    authenticateToken, // Primeiro, verifica se está logado
    isAdmin, // Depois, verifica se é admin
    upload.single('foto'), // Middleware do multer para processar o upload da foto
    userController.register
);

// Rota pública para login
router.post('/login', userController.login);

// Rota protegida para buscar todos os usuários (somente Admin)
router.get(
    '/', // Será /api/v1/users/
    authenticateToken,
    isAdmin,
    userController.getAllUsers
);

// Rota protegida para buscar um usuário específico por ID (somente Admin)
router.get(
    '/:userId',
    authenticateToken,
    isAdmin, // Ou outra lógica de permissão se necessário
    userController.getUserById
);

// Rota protegida para o usuário logado ATUALIZAR o PRÓPRIO perfil (senha e foto)
router.put('/profile', authenticateToken, upload.single('foto'), userController.updateCurrentUserProfile);

// Rota protegida para ATUALIZAR um usuário específico por ID (somente Admin)
router.put(
    '/:userId',
    authenticateToken,
    isAdmin,
    upload.single('foto'), // Middleware do multer para processar um único arquivo no campo 'foto'
    userController.updateUser
);

// Rota protegida de exemplo para buscar o perfil do usuário logado
router.get('/profile', authenticateToken, userController.getProfile);

// Exemplo de uma rota que só pode ser acessada por Administradores e Gestores
router.get(
    '/admin-gestor-area',
    authenticateToken,
    authorizeRoles(USER_ROLES.ADMINISTRADOR, USER_ROLES.GESTOR),
    (req, res) => {
        res.json({ message: `Bem-vindo à área de Admin/Gestor, ${req.user.nome}!` });
    }
);

// Rota para atualizar status do usuário
router.patch('/:id/status', authenticateToken, userController.updateUserStatus);

module.exports = router;
