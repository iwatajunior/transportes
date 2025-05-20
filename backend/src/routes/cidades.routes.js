const express = require('express');
const router = express.Router();

// Importar o serviço de cidades
const cidadesService = require('../services/cidades.service');

// Rota para listar todas as cidades
router.get('/', async (req, res) => {
  try {
    const cidades = await cidadesService.getCidades();
    res.json(cidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar cidade por ID
router.get('/:id', async (req, res) => {
  try {
    const cidade = await cidadesService.getCidadeById(req.params.id);
    if (!cidade) {
      return res.status(404).json({ error: 'Cidade não encontrada' });
    }
    res.json(cidade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
