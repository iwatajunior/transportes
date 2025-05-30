// backend/scripts/check_status.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10)
});

pool.query('SELECT DISTINCT status_viagem::text, count(*) as quantidade FROM viagens GROUP BY status_viagem ORDER BY status_viagem::text', (err, res) => {
    if (err) {
        console.error('Erro ao executar a query:', err);
    } else {
        console.log('Status das viagens:');
        res.rows.forEach(row => {
            console.log(`Status: ${row.status_viagem}, Quantidade: ${row.quantidade}`);
        });
    }
    pool.end();
});
