const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const materialController = require('../controllers/materialController');

// Middleware de logging
router.use((req, res, next) => {
  console.log('=== Material Route ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  next();
});

// Todas as rotas de materiais requerem autenticação
router.use(authenticateToken);

// Criar novo material
router.post('/', materialController.create);

// Buscar materiais por rota
router.get('/rota/:rotaId', materialController.getByRotaId);

// Atualizar material
router.put('/:id', materialController.update);

// Deletar material
router.delete('/:id', materialController.delete);

module.exports = router; 