const { createCaronas, updateStatus, listByViagem } = require('../models/caronasModel');

// POST /api/v1/caronas
async function create(req, res) {
  try {
    const { viagemId, requisitantes, motivo } = req.body || {};

    if (!viagemId || !Array.isArray(requisitantes) || requisitantes.length === 0) {
      return res.status(400).json({ message: 'viagemId e requisitantes são obrigatórios.' });
    }

    // Garante números inteiros
    const tripIdNum = Number(viagemId);
    const reqIds = requisitantes.map((r) => Number(r)).filter((n) => Number.isInteger(n) && n > 0);

    if (!Number.isInteger(tripIdNum) || reqIds.length === 0) {
      return res.status(400).json({ message: 'IDs inválidos fornecidos.' });
    }

    const rows = await createCaronas(tripIdNum, reqIds, motivo ?? null);
    return res.status(201).json({ message: 'Caronas criadas com sucesso', caronas: rows });
  } catch (error) {
    console.error('[caronasController] Erro ao criar caronas:', error);
    return res.status(500).json({ message: 'Erro ao criar caronas' });
  }
}

module.exports = {
  create,
  // GET /api/v1/caronas?viagemId=123&status=Pendente
  async list(req, res) {
    try {
      const viagemId = Number(req.query.viagemId);
      let status = req.query.status || null;
      if (status) status = String(status).toLowerCase();
      if (!viagemId) return res.status(400).json({ message: 'viagemId é obrigatório' });
      const rows = await listByViagem(viagemId, status);
      return res.json({ caronas: rows });
    } catch (error) {
      console.error('[caronasController] Erro ao listar caronas:', error);
      return res.status(500).json({ message: 'Erro ao listar caronas' });
    }
  },
  // PUT /api/v1/caronas/:id/status
  async updateCaronaStatus(req, res) {
    try {
      const { id } = req.params;
      let { status } = req.body || {};
      if (!id || !status) {
        return res.status(400).json({ message: 'Parâmetros inválidos. Informe id e status.' });
      }
      // Normaliza status e mapeia variações
      status = String(status).toLowerCase();
      if (status === 'reprovada') status = 'reprovado';
      const allowed = new Set(['pendente', 'aprovado', 'reprovado']);
      if (!allowed.has(status)) {
        return res.status(400).json({ message: 'Status inválido. Use: pendente, aprovado, reprovado.' });
      }
      const updated = await updateStatus(Number(id), status);
      if (!updated) return res.status(404).json({ message: 'Carona não encontrada' });
      return res.json({ message: 'Status atualizado com sucesso', carona: updated });
    } catch (error) {
      console.error('[caronasController] Erro ao atualizar status da carona:', error);
      return res.status(500).json({ message: 'Erro ao atualizar status da carona' });
    }
  }
};
