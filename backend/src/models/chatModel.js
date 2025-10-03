// backend/src/models/chatModel.js
const { pool } = require('./userModel'); // reaproveita Pool configurado

const createTableIfNotExists = async () => {
  const sql = `
  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_name VARCHAR(255),
    message TEXT NOT NULL,
    is_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `;
  await pool.query(sql);
  // Backfill in case table exists without is_support
  await pool.query("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_support BOOLEAN DEFAULT FALSE");
};

const insertMessage = async ({ user_id, user_name, message, is_support }) => {
  const sql = `INSERT INTO chat_messages (user_id, user_name, message, is_support) VALUES ($1,$2,$3,$4) RETURNING *`;
  const { rows } = await pool.query(sql, [user_id || null, user_name || null, message, !!is_support]);
  return rows[0];
};

const fetchMessages = async ({ limit = 50, before, userId } = {}) => {
  let sql = `SELECT * FROM chat_messages`;
  const where = [];
  const params = [];
  if (typeof userId !== 'undefined' && userId !== null) {
    params.push(userId);
    where.push(`user_id = $${params.length}`);
  }
  if (before) {
    params.push(before);
    where.push(`created_at < $${params.length}`);
  }
  if (where.length) {
    sql += ` WHERE ` + where.join(' AND ');
  }
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  const { rows } = await pool.query(sql, params);
  // retornar em ordem cronológica
  return rows.reverse();
};

module.exports = { createTableIfNotExists, insertMessage, fetchMessages };
