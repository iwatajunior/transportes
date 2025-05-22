const pool = require('../config/database');

async function checkLoginAttempts() {
    try {
        console.log('Verificando tabela tentativas_login...');
        
        // Verificar se a tabela existe
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'tentativas_login'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.error('A tabela tentativas_login não existe!');
            return;
        }
        
        console.log('Tabela tentativas_login existe.');
        
        // Contar total de registros
        const countResult = await pool.query('SELECT COUNT(*) FROM tentativas_login');
        console.log('Total de registros:', countResult.rows[0].count);
        
        // Verificar a consulta exata que está sendo usada na página
        console.log('\nVerificando consulta usada na página (últimas 60 minutos):');
        const pageQuery = `
            SELECT * FROM tentativas_login 
            WHERE data_tentativa > NOW() - INTERVAL '60 minutes'
            ORDER BY data_tentativa DESC
        `;
        console.log('Query:', pageQuery);
        
        const pageResults = await pool.query(pageQuery);
        console.log('Resultados da consulta da página:', pageResults.rows.length);
        
        // Mostrar todas as tentativas das últimas 24 horas
        console.log('\nTodas as tentativas das últimas 24 horas:');
        const last24Hours = await pool.query(`
            SELECT 
                id,
                email,
                data_tentativa,
                status,
                motivo,
                EXTRACT(EPOCH FROM (NOW() - data_tentativa))/60 as minutos_antes
            FROM tentativas_login 
            WHERE data_tentativa > NOW() - INTERVAL '24 hours'
            ORDER BY data_tentativa DESC
        `);
        
        if (last24Hours.rows.length === 0) {
            console.log('Nenhuma tentativa de login registrada nas últimas 24 horas.');
        } else {
            last24Hours.rows.forEach(attempt => {
                console.log({
                    id: attempt.id,
                    email: attempt.email,
                    data_tentativa: attempt.data_tentativa,
                    status: attempt.status,
                    motivo: attempt.motivo,
                    minutos_antes: Math.round(attempt.minutos_antes)
                });
            });
        }
        
    } catch (error) {
        console.error('Erro ao verificar tentativas de login:', error);
    } finally {
        await pool.end();
    }
}

checkLoginAttempts(); 