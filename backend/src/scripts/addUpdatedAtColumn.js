const pool = require('../config/db');

async function addUpdatedAtColumn() {
  try {
    // Adiciona a coluna updated_at
    await pool.query(`
      ALTER TABLE rotas 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    console.log('Coluna updated_at adicionada com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar coluna updated_at:', error);
  } finally {
    pool.end();
  }
}

addUpdatedAtColumn(); 