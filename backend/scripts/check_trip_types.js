// backend/scripts/check_trip_types.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10)
});

pool.query('SELECT DISTINCT tipo_veiculo_desejado::text, count(*) as quantidade FROM viagens GROUP BY tipo_veiculo_desejado ORDER BY tipo_veiculo_desejado::text', (err, res) => {
    if (err) {
        console.error('Erro ao executar a query:', err);
    } else {
        console.log('Tipos de veículos desejados nas viagens:');
        res.rows.forEach(row => {
            console.log(`Tipo: ${row.tipo_veiculo_desejado}, Quantidade: ${row.quantidade}`);
        });
    }
    pool.end();
});
