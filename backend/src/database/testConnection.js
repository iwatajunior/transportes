const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'transportes_db',
    password: 'senac2025',
    port: 5432
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
        
        // Testar a tabela de tentativas de login
        const result = await client.query('SELECT * FROM tentativas_login LIMIT 5');
        console.log('Registros de tentativas de login:', result.rows);
        
        client.release();
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    } finally {
        await pool.end();
    }
}

testConnection(); 