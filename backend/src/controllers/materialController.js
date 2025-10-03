const Material = require('../models/materialModel');

class MaterialController {
  static async create(req, res) {
    try {
      const { rota_id, cidade_origem_id, cidade_destino_id, tipo, quantidade, observacoes, status } = req.body;
      const user_id = req.user.userId; // Corrigindo para usar userId do token

      if (!rota_id || !cidade_origem_id || !cidade_destino_id || !tipo || !quantidade) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      const materialData = {
        rota_id,
        cidade_origem_id,
        cidade_destino_id,
        tipo,
        quantidade,
        observacoes,
        user_id,
        status: status || 'pendente'
      };

      const material = await Material.create(materialData);
      return res.status(201).json(material);
    } catch (error) {
      console.error('Erro ao criar material:', error);
      console.error('Stack trace:', error.stack);
      
      // Tentar extrair uma mensagem mais específica do erro
      const errorMessage = error.message || 'Erro interno do servidor';
      console.error('Mensagem de erro:', errorMessage);
      
      return res.status(500).json({ error: errorMessage });
    }
  }

  static async getByRotaId(req, res) {
    try {
      console.log('=== getByRotaId ===');
      console.log('Headers:', req.headers);
      console.log('Params:', req.params);
      console.log('Query:', req.query);
      
      const { rotaId } = req.params;
      console.log('Buscando materiais para rotaId:', rotaId);
      
      // Verificar se o rotaId é um número válido
      if (isNaN(rotaId)) {
        return res.status(400).json({ error: 'ID da rota inválido' });
      }

      const materials = await Material.findByRotaId(rotaId);
      
      // Verificar se o resultado é um array
      if (!Array.isArray(materials)) {
        console.error('Resultado não é um array:', materials);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      console.log('Materiais encontrados:', materials);
      console.log('Tipo dos materiais:', typeof materials);
      console.log('É array?', Array.isArray(materials));
      console.log('Quantidade:', materials.length);
      
      res.json(materials);
    } catch (error) {
      console.error('Erro em getByRotaId:', error);
      console.error('Stack trace:', error.stack);
      
      // Tentar extrair uma mensagem mais específica do erro
      const errorMessage = error.message || 'Erro interno do servidor';
      console.error('Mensagem de erro:', errorMessage);
      
      res.status(500).json({ error: errorMessage });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { tipo, quantidade, observacoes, status, entregue } = req.body;

      const materialData = {
        tipo,
        quantidade,
        observacoes,
        // aceita atualização de status explícita
        ...(typeof status !== 'undefined' ? { status } : {}),
        // compatibilidade: se vier 'entregue' true, define status 'entregue'
        ...(entregue === true ? { status: 'entregue' } : {})
      };

      const material = await Material.update(id, materialData);
      return res.json(material);
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      return res.status(500).json({ error: 'Erro ao atualizar material' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Material.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      return res.status(500).json({ error: 'Erro ao deletar material' });
    }
  }
}

module.exports = MaterialController; 