// backend/scripts/check_recusada_integration.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10)
});

// Verificar se o tipo ENUM ainda existe
pool.query('SELECT typname FROM pg_type WHERE typname = 'status_viagem' AND typname::text = 'Recusada';', (err, res) => {
    if (err) {
        console.error('Erro ao verificar tipo ENUM:', err);
    } else {
        console.log('Verificação de tipo ENUM Recusada:', res.rows.length > 0 ? 'Existe' : 'Não existe');
    }
});

// Verificar se há registros com status Recusada
pool.query('SELECT COUNT(*) as count FROM viagens WHERE status_viagem::text = 'Recusada';', (err, res) => {
    if (err) {
        console.error('Erro ao verificar registros:', err);
    } else {
        console.log(`Registros com status Recusada: ${res.rows[0].count}`);
    }
});

// Verificar se há views que referenciam o status Recusada
pool.query('SELECT viewname FROM pg_views WHERE definition::text LIKE '%Recusada%';', (err, res) => {
    if (err) {
        console.error('Erro ao verificar views:', err);
    } else {
        console.log('Views que referenciam Recusada:', res.rows.map(row => row.viewname));
    }
});

// Verificar se há triggers que referenciam o status Recusada
pool.query('SELECT proname FROM pg_proc WHERE prosrc::text LIKE '%Recusada%';', (err, res) => {
    if (err) {
        console.error('Erro ao verificar triggers:', err);
    } else {
        console.log('Triggers que referenciam Recusada:', res.rows.map(row => row.proname));
    }
});

pool.end();
