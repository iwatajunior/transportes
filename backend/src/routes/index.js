const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const routeRoutes = require('./routeRoutes');
const materialRoutes = require('./materialRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/routes', routeRoutes);
router.use('/materials', materialRoutes);

module.exports = router; 