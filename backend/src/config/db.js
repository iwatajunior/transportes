// backend/src/config/db.js
const { Pool } = require('pg');
// Carregar variáveis de ambiente do .env na raiz do backend (process.cwd())
require('dotenv').config();

// Verificar se as variáveis de ambiente necessárias estão definidas
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        console.error(`ERRO FATAL: Variável de ambiente ${varName} não está definida no arquivo .env`);
        process.exit(1); // Encerra a aplicação se alguma variável essencial não estiver definida
    }
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10), // Certifique-se de que a porta é um número
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false // Exemplo para produção
});

pool.on('connect', () => {
    console.log('Conectado ao PostgreSQL com sucesso usando configuração detalhada!');
});

pool.on('error', (err) => {
    console.error('Erro inesperado no cliente do pool do PostgreSQL:', err);
    // process.exit(-1); // Comentado para não derrubar o servidor em cada erro durante o desenvolvimento, facilitando o debug.
});

module.exports = pool;
