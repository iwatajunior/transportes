const express = require('express');
const router = express.Router();
const caronasController = require('../controllers/caronasController');

// Lista e cria/atualiza caronas
router.get('/', caronasController.list);
// Cria caronas para uma viagem (status padrão: Pendente)
router.post('/', caronasController.create);
router.put('/:id/status', caronasController.updateCaronaStatus);

module.exports = router;
