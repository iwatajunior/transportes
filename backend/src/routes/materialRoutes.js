const express = require('express');
const MaterialController = require('../controllers/materialController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

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
router.post('/', MaterialController.create);

// Buscar materiais por rota
router.get('/rota/:rotaId', MaterialController.getByRotaId);

// Atualizar material
router.put('/:id', MaterialController.update);

// Deletar material
router.delete('/:id', MaterialController.delete);

module.exports = router; 