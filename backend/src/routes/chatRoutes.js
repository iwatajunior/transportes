// backend/src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET /api/v1/chat/messages?limit=50&before=2025-09-26T12:00:00Z
router.get('/messages', chatController.getMessages);

module.exports = router;
