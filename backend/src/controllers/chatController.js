// backend/src/controllers/chatController.js
const { fetchMessages } = require('../models/chatModel');

exports.getMessages = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const before = req.query.before || undefined;
    const data = await fetchMessages({ limit, before });
    res.json({ ok: true, data });
  } catch (e) {
    console.error('[chatController.getMessages] error', e);
    res.status(500).json({ ok: false, error: e.message });
  }
};
