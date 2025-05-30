// backend/scripts/check_status_types.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10)
});

// Consulta para listar os tipos de status de viagens
pool.query('SELECT DISTINCT status_viagem::text FROM viagens ORDER BY status_viagem::text', (err, res) => {
    if (err) {
        console.error('Erro ao executar a query:', err);
    } else {
        console.log('Tipos de status de viagens:');
        res.rows.forEach(row => {
            console.log(`Status: ${row.status_viagem}`);
        });
    }
    pool.end();
});
