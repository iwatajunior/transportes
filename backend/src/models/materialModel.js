const knex = require('../database/connection');

class Material {
  static async create(materialData) {
    try {
      const [material] = await knex('materials')
        .insert(materialData)
        .returning('*');
      return material;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const material = await knex('materials')
        .where('id', id)
        .first();
      return material;
    } catch (error) {
      throw error;
    }
  }

  static async findByRotaId(rotaId) {
    try {
      console.log('Model: Buscando materiais para rota:', rotaId);
      console.log('Model: Tipo do rotaId:', typeof rotaId);
      
      const materials = await knex('materials')
        .select('*')
        .where('rota_id', rotaId);
      
      console.log('Model: Query executada com sucesso');
      console.log('Model: Materiais encontrados:', materials);
      console.log('Model: Tipo dos materiais:', typeof materials);
      console.log('Model: É um array?', Array.isArray(materials));
      console.log('Model: Quantidade de materiais:', materials.length);
      
      return materials;
    } catch (error) {
      console.error('Model: Erro ao buscar materiais:', error);
      console.error('Model: Stack trace:', error.stack);
      throw error;
    }
  }

  static async update(id, materialData) {
    try {
      await knex('materials')
        .where('id', id)
        .update({
          ...materialData,
          updated_at: knex.fn.now()
        });
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await knex('materials')
        .where('id', id)
        .del();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Material; 