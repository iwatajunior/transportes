const pool = require('../config/db');

/**
 * Cria múltiplas caronas para uma viagem.
 * @param {number} viagemId - ID da viagem
 * @param {number[]} requisitantes - Array de IDs de usuários selecionados para a carona
 * @param {string} motivo - Motivo da carona (opcional)
 * @returns {Promise<Array>} Linhas criadas na tabela caronas
 */
async function createCaronas(viagemId, requisitantes = [], motivo = null) {
  if (!viagemId || !Array.isArray(requisitantes) || requisitantes.length === 0) {
    throw new Error('Parâmetros inválidos para criar caronas');
  }

  // Monta valores dinamicamente: (viagemid, requisitante, motivo, status)
  const values = [];
  const placeholders = requisitantes.map((reqId, idx) => {
    const base = idx * 4; // 4 colunas por linha
    values.push(viagemId, reqId, motivo, 'pendente');
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  }).join(',');

  const query = `
    INSERT INTO caronas (viagemid, requisitante, motivo, status)
    VALUES ${placeholders}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows;
}

module.exports = {
  createCaronas,
  /**
   * Lista caronas por viagem, com filtro opcional por status
   * @param {number} viagemId
   * @param {string|null} status
   */
  async listByViagem(viagemId, status = null) {
    const params = [viagemId];
    let whereStatus = '';
    if (status) {
      whereStatus = ' AND c.status = $2';
      params.push(status);
    }
    const query = `
      SELECT 
        c.*, 
        u.nome AS requisitante_nome,
        u.setor AS requisitante_setor
      FROM caronas c
      LEFT JOIN usuarios u ON u.userid = c.requisitante
      WHERE c.viagemid = $1
      ${whereStatus}
      ORDER BY c.caronaid DESC;
    `;
    const { rows } = await pool.query(query, params);
    return rows;
  },
  /**
   * Atualiza o status de uma carona específica.
   * @param {number} caronaId
   * @param {string} newStatus
   * @returns {Promise<object|null>} Linha atualizada ou null
   */
  async updateStatus(caronaId, newStatus) {
    const { rows } = await pool.query(
      'UPDATE caronas SET status = $1 WHERE caronaid = $2 RETURNING *;',
      [newStatus, caronaId]
    );
    return rows[0] || null;
  }
};
