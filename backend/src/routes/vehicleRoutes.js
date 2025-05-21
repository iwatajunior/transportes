const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Rotas Públicas (ou protegidas apenas por autenticação básica)
// GET /api/v1/vehicles - Listar todos os veículos (acessível a qualquer usuário autenticado)
router.get('/', authenticateToken, vehicleController.getAllVehicles);

// Rota protegida para buscar veículos disponíveis (Status 'Disponível') - Usado na alocação
router.get(
    '/available',
    authenticateToken,
    authorizeRoles('Gestor', 'administrador'), // Gestor/Admin podem ver os disponíveis para alocação
    vehicleController.getAvailableVehicles // Função no controller para buscar veículos disponíveis
);

// GET /api/v1/vehicles/:id - Buscar um veículo específico pelo ID (acessível a qualquer usuário autenticado)
router.get('/:id', authenticateToken, vehicleController.getVehicleById);

// Rotas Protegidas (requerem autenticação e perfil específico, ex: 'Gestor')

// POST /api/v1/vehicles - Cadastrar um novo veículo
router.post(
    '/',
    authenticateToken,
    authorizeRoles('Gestor', 'administrador'), // Somente Gestores podem cadastrar
    vehicleController.createVehicle
);

// PUT /api/v1/vehicles/:id - Atualizar um veículo existente
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('Gestor', 'administrador'), // Somente Gestores podem atualizar
    vehicleController.updateVehicle
);

// DELETE /api/v1/vehicles/:id - Desativar (soft delete) um veículo
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('Gestor', 'administrador'), // Somente Gestores podem desativar
    vehicleController.deleteVehicle
);

// Exemplo de rota que poderia ser acessível a Gestor ou Motorista:
// router.patch('/:id/status', 
//     authenticateToken, 
//     authorizeRoles('Gestor', 'Motorista'), 
//     vehicleController.updateVehicleStatus); // Precisaria de um controller específico

module.exports = router;
