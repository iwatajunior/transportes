const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function createTables() {
    try {
        // Ler o arquivo SQL
        const sqlPath = path.join(__dirname, '../migrations/create_rotas_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Executar a migração
        await pool.query(sql);
        console.log('Tabela de rotas criada com sucesso!');

        // Verificar se a tabela foi criada
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'rotas'
            );
        `);

        if (result.rows[0].exists) {
            console.log('Tabela rotas existe no banco de dados.');
        } else {
            console.log('ERRO: Tabela rotas não foi criada!');
        }

    } catch (error) {
        console.error('Erro ao criar tabela:', error);
    } finally {
        // Fechar a conexão
        await pool.end();
    }
}

// Executar o script
createTables(); 