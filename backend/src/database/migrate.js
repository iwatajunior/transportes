const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Iniciando migração...');
        
        // Lê o arquivo de migração
        const migrationPath = path.join(__dirname, 'migrations', '20240321000000_add_status_to_usuarios.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Executa a migração
        await client.query('BEGIN');
        await client.query(migrationSQL);
        await client.query('COMMIT');
        
        console.log('Migração executada com sucesso!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao executar migração:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error); 