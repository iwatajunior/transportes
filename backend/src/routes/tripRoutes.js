const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Todas as rotas de viagem requerem autenticação
router.use(authenticateToken);

// POST /api/trips - Cria uma nova viagem (acessível por qualquer usuário autenticado)
router.post('/', tripController.createTrip);

// GET /api/trips - Lista todas as viagens
// (Aberto para todos os autenticados, mas pode ser restrito a gestores ou por filtros no controller/model)
router.get('/', tripController.getAllTrips);

// GET /api/trips/:id - Obtém uma viagem específica pelo ID
// (Aberto para todos os autenticados, o controller/model pode adicionar lógica se o usuário só pode ver as próprias viagens ou se é gestor)
router.get('/:id', tripController.getTripById);

// PUT /api/trips/:id - Atualiza uma viagem
// A lógica de quem pode atualizar (solicitante vs gestor) está parcialmente no controller.
// Aqui, podemos adicionar uma camada de autorização geral se necessário,
// mas as regras mais finas ficam no controller.
// Ex: Qualquer usuário autenticado pode tentar, o controller decide se ele tem permissão.
router.put('/:id', tripController.updateTrip);

// DELETE /api/trips/:id - Deleta uma viagem
// Similar ao PUT, o controller tem a lógica de permissão.
// Se quiséssemos que apenas gestores pudessem deletar:
// router.delete('/:id', authorizeRoles('gestor', 'admin'), tripController.deleteTrip);
// Por enquanto, deixamos a lógica mais flexível no controller.
router.delete('/:id', tripController.deleteTrip);

// PUT /api/trips/:id/allocate - Rota para Gestores/Admins alocarem veículo e motorista
router.put(
    '/:id/allocate', 
    authorizeRoles('gestor', 'administrador'), // Garante que apenas esses perfis podem acessar
    tripController.allocateTripResources
);

// PUT /api/trips/:id/status - Rota para Gestores/Admins atualizarem o status da viagem
router.put(
    '/:id/status',
    authorizeRoles('gestor', 'administrador'),
    tripController.updateTripStatus
);

// PUT /api/trips/:id/km/start - Rota para Motorista registrar KM inicial
router.put(
    '/:id/km/start',
    authorizeRoles('motorista'), // Apenas motorista pode acessar
    tripController.recordStartKm
);

// PUT /api/trips/:id/km/end - Rota para Motorista registrar KM final
router.put(
    '/:id/km/end',
    authorizeRoles('motorista'), // Apenas motorista pode acessar
    tripController.recordEndKm
);

// PUT /api/trips/:id/km/manage-start - Rota para Gestor/Admin registrar/editar KM inicial
router.put(
    '/:id/km/manage-start',
    authorizeRoles('gestor', 'administrador'),
    tripController.manageStartKm 
);

// PUT /api/trips/:id/km/manage-end - Rota para Gestor/Admin registrar/editar KM final
router.put(
    '/:id/km/manage-end',
    authorizeRoles('gestor', 'administrador'),
    tripController.manageEndKm
);


// Exemplo de uma rota que poderia ser específica para gestores:
// GET /api/trips/admin/pending-approval - Rota para gestores verem viagens pendentes de aprovação
// router.get('/admin/pending-approval', authorizeRoles('gestor', 'admin'), tripController.getPendingApprovalTrips);
// (getPendingApprovalTrips precisaria ser implementada no controller e model)

module.exports = router;
