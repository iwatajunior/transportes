const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/trips.controller');

// Rotas para viagens
router.post('/trips', tripsController.createTrip);
router.get('/trips', tripsController.getTrips);
router.get('/trips/:id', tripsController.getTripById);
router.put('/trips/:id', tripsController.updateTrip);
router.delete('/trips/:id', tripsController.deleteTrip);

module.exports = router;
