const pool = require('../config/db');

async function addStatusColumn() {
  try {
    // Adiciona a coluna status
    await pool.query(`
      ALTER TABLE rotas 
      ADD COLUMN IF NOT EXISTS status VARCHAR(10) DEFAULT 'ativo' NOT NULL;
    `);

    // Atualiza todas as rotas existentes para terem status 'ativo'
    await pool.query(`
      UPDATE rotas 
      SET status = 'ativo' 
      WHERE status IS NULL;
    `);

    console.log('Coluna status adicionada com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar coluna status:', error);
  } finally {
    pool.end();
  }
}

addStatusColumn(); 