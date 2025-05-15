// Script para apagar usuários específicos do banco de dados
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function deleteUsers(userIds) {
    try {
        // Conectar ao banco
        const client = await pool.connect();
        
        console.log(`Tentando excluir usuários com IDs: ${userIds.join(', ')}`);
        
        // Executar a exclusão para cada ID
        for (const userId of userIds) {
            try {
                const result = await client.query('DELETE FROM usuarios WHERE userid = $1', [userId]);
                console.log(`Usuário ID ${userId}: ${result.rowCount} registro(s) excluído(s)`);
            } catch (err) {
                console.error(`Erro ao excluir usuário ID ${userId}:`, err.message);
            }
        }
        
        // Liberar a conexão
        client.release();
        console.log('Operação concluída');
        
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error.message);
    } finally {
        // Encerrar o pool de conexões
        await pool.end();
    }
}

// IDs dos usuários a serem excluídos
const userIdsToDelete = [13, 11, 12, 10];

// Executar a função
deleteUsers(userIdsToDelete);
