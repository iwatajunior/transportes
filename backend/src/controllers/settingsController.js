const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ sticky_note: '', app_version: '', app_version_notes: '' }, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('[settings] ensure file error', e);
  }
}

function readSettings() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const obj = JSON.parse(raw || '{}');
    // Ensure defaults
    if (typeof obj.sticky_note !== 'string') obj.sticky_note = '';
    if (typeof obj.app_version !== 'string') obj.app_version = '';
    if (typeof obj.app_version_notes !== 'string') obj.app_version_notes = '';
    return obj;
  } catch (e) {
    console.error('[settings] read error', e);
    return { sticky_note: '' };
  }
}

function writeSettings(obj) {
  ensureDataFile();
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(obj || {}, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('[settings] write error', e);
    return false;
  }
}

module.exports = {
  getStickyNote: (req, res) => {
    try {
      const s = readSettings();
      res.json({ sticky_note: s.sticky_note || '' });
    } catch (e) {
      res.status(500).json({ message: 'Erro ao ler nota' });
    }
  },
  setStickyNote: (req, res) => {
    try {
      const value = typeof req.body?.sticky_note === 'string' ? req.body.sticky_note : '';
      const s = readSettings();
      s.sticky_note = value;
      const ok = writeSettings(s);
      if (!ok) return res.status(500).json({ message: 'Falha ao salvar nota' });
      // Emitir evento via Socket.IO para atualizar clientes em tempo real
      try {
        const io = req.app && req.app.get ? req.app.get('io') : null;
        if (io) io.emit('settings:sticky_note_updated', { sticky_note: s.sticky_note });
      } catch (e) {
        console.warn('[settings] emit error', e?.message || e);
      }
      res.json({ message: 'Nota salva', sticky_note: s.sticky_note });
    } catch (e) {
      res.status(500).json({ message: 'Erro ao salvar nota' });
    }
  },
  getAppVersion: (req, res) => {
    try {
      const s = readSettings();
      res.json({ app_version: s.app_version || '', app_version_notes: s.app_version_notes || '' });
    } catch (e) {
      res.status(500).json({ message: 'Erro ao ler versão' });
    }
  },
  setAppVersion: (req, res) => {
    try {
      const version = typeof req.body?.app_version === 'string' ? req.body.app_version : '';
      const notes = typeof req.body?.app_version_notes === 'string' ? req.body.app_version_notes : '';
      const s = readSettings();
      s.app_version = version;
      s.app_version_notes = notes;
      const ok = writeSettings(s);
      if (!ok) return res.status(500).json({ message: 'Falha ao salvar versão' });
      // Emitir evento via Socket.IO para atualizar clientes em tempo real
      try {
        const io = req.app && req.app.get ? req.app.get('io') : null;
        if (io) io.emit('settings:version_updated', { app_version: s.app_version, app_version_notes: s.app_version_notes });
      } catch (e) {
        console.warn('[settings] emit error', e?.message || e);
      }
      res.json({ message: 'Versão salva', app_version: s.app_version, app_version_notes: s.app_version_notes });
    } catch (e) {
      res.status(500).json({ message: 'Erro ao salvar versão' });
    }
  }
};
