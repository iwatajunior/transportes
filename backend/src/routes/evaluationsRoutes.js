const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// JSON file storage (simple persistence without DB)
const dataDir = path.join(__dirname, '..', 'data');
const dbFile = path.join(dataDir, 'evaluations.json');

function ensureDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify([]), 'utf8');
}

function readAll() {
  ensureDb();
  const raw = fs.readFileSync(dbFile, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeAll(list) {
  ensureDb();
  fs.writeFileSync(dbFile, JSON.stringify(list, null, 2), 'utf8');
}

// GET /evaluations -> list all
router.get('/', (req, res) => {
  try {
    const items = readAll();
    res.json({ evaluations: items });
  } catch (e) {
    console.error('GET /evaluations error:', e);
    res.status(500).json({ error: 'Failed to read evaluations' });
  }
});

// POST /evaluations -> create one
router.post('/', (req, res) => {
  try {
    const { tripid, user_id, trip_rating, driver_rating, vehicle_rating, feedback, user_name, user_setor } = req.body || {};

    if (!tripid || !user_id) {
      return res.status(400).json({ error: 'tripid and user_id are required' });
    }

    const item = {
      id: Date.now().toString(),
      tripid,
      user_id,
      trip_rating: Number(trip_rating) || 0,
      driver_rating: Number(driver_rating) || 0,
      vehicle_rating: Number(vehicle_rating) || 0,
      feedback: (feedback || '').toString(),
      user_name: (user_name || '').toString(),
      user_setor: (user_setor || '').toString(),
      created_at: new Date().toISOString(),
    };

    const items = readAll();
    items.push(item);
    writeAll(items);

    res.status(201).json({ evaluation: item });
  } catch (e) {
    console.error('POST /evaluations error:', e);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

module.exports = router;
