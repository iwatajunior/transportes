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
        
        // Lê todos os arquivos SQL do diretório database_scripts
        const scriptsDir = path.join(__dirname, '..', '..', 'database_scripts');
        const files = fs.readdirSync(scriptsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ordena os arquivos para garantir a ordem correta
        
        for (const file of files) {
            console.log(`Executando script: ${file}`);
            const scriptPath = path.join(scriptsDir, file);
            const scriptSQL = fs.readFileSync(scriptPath, 'utf8');
            
            try {
                await client.query('BEGIN');
                await client.query(scriptSQL);
                await client.query('COMMIT');
                console.log(`Script ${file} executado com sucesso!`);
            } catch (error) {
                await client.query('ROLLBACK');
                // Ignora erros de tipos já existentes ou tabelas já existentes
                if (error.code === '42710' || error.code === '42P07') {
                    console.log(`Ignorando erro de tipo/tabela já existente em ${file}`);
                    continue;
                }
                console.error(`Erro ao executar script ${file}:`, error);
                throw error;
            }
        }
        
        console.log('Migração executada com sucesso!');
    } catch (error) {
        console.error('Erro ao executar migração:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error); 