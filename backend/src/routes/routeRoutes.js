const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const routeController = require('../controllers/routeController');

// POST /api/v1/routes - Cadastrar uma nova rota
router.post('/', authenticateToken, routeController.createRoute);

// GET /api/v1/routes - Listar todas as rotas
router.get('/', (req, res, next) => {
    // Se for uma requisição da home page, não requer autenticação
    if (req.query.home === 'true') {
        return routeController.listRoutes(req, res, next);
    }
    // Caso contrário, requer autenticação
    authenticateToken(req, res, next);
}, routeController.listRoutes);

// GET /api/v1/routes/:id - Buscar uma rota específica
router.get('/:id', authenticateToken, routeController.getRouteById);

// PUT /api/v1/routes/:id - Atualizar uma rota existente
router.put('/:id', routeController.updateRoute);

module.exports = router; 