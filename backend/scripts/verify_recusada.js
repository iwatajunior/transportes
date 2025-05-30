// backend/scripts/verify_recusada.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10)
});

async function checkRecusadaIntegration() {
    try {
        // Verificar se há registros com status Recusada
        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM viagens WHERE status_viagem::text = $1',
            ['Recusada']
        );
        console.log(`\nRegistros com status Recusada: ${countResult.rows[0].count}`);

        // Verificar se há views que referenciam o status Recusada
        const viewsResult = await pool.query(
            'SELECT viewname FROM pg_views WHERE definition::text LIKE $1',
            ['%Recusada%']
        );
        console.log('\nViews que referenciam Recusada:', viewsResult.rows.map(row => row.viewname));

        // Verificar se há triggers que referenciam o status Recusada
        const triggersResult = await pool.query(
            'SELECT proname FROM pg_proc WHERE prosrc::text LIKE $1',
            ['%Recusada%']
        );
        console.log('\nTriggers que referenciam Recusada:', triggersResult.rows.map(row => row.proname));

        // Verificar se há procedimentos que referenciam o status Recusada
        const procsResult = await pool.query(
            'SELECT proname FROM pg_proc WHERE prosrc::text LIKE $1',
            ['%Recusada%']
        );
        console.log('\nProcedimentos que referenciam Recusada:', procsResult.rows.map(row => row.proname));

    } catch (err) {
        console.error('Erro ao verificar integração:', err);
    } finally {
        pool.end();
    }
}

checkRecusadaIntegration();
