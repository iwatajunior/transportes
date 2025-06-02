const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

const migrationSQL = `
    -- Adiciona a coluna origem à tabela viagens
    ALTER TABLE viagens
    ADD COLUMN origem VARCHAR(255) NOT NULL DEFAULT 'Sede';

    -- Atualiza os registros existentes
    UPDATE viagens
    SET origem = 'Sede';
`;

async function runMigration() {
    try {
        await pool.query(migrationSQL);
        console.log('Migração executada com sucesso!');
    } catch (error) {
        console.error('Erro ao executar migração:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
