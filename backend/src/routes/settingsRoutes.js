const express = require('express');
const router = express.Router();
const { getStickyNote, setStickyNote } = require('../controllers/settingsController');

// Public GET (anyone can read the note)
router.get('/sticky-note', getStickyNote);

// Protected POST could be added later (e.g., admin-only). For now, keep open or integrate auth middleware when available.
router.post('/sticky-note', setStickyNote);

module.exports = router;
