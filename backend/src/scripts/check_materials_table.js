const knex = require('../database/connection');

async function checkMaterialsTable() {
  try {
    // Verificar se a tabela existe
    const tableExists = await knex.schema.hasTable('materials');
    console.log('Tabela materials existe:', tableExists);

    if (tableExists) {
      // Obter a estrutura da tabela
      const columns = await knex('materials').columnInfo();
      console.log('Estrutura da tabela materials:', columns);

      // Contar registros
      const count = await knex('materials').count('* as total');
      console.log('Total de registros:', count[0].total);

      // Listar alguns registros
      const materials = await knex('materials').select('*').limit(5);
      console.log('Amostra de registros:', materials);
    }
  } catch (error) {
    console.error('Erro ao verificar tabela:', error);
  } finally {
    await knex.destroy();
  }
}

checkMaterialsTable(); 