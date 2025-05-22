const pool = require('../config/database');

async function checkDatabaseTime() {
    try {
        console.log('Verificando configuração de data/hora do banco de dados...');
        
        // Verificar timezone do banco
        const timezoneResult = await pool.query('SHOW timezone');
        console.log('Timezone do banco:', timezoneResult.rows[0].TimeZone);
        
        // Verificar data/hora atual do banco
        const currentTimeResult = await pool.query('SELECT NOW() as current_time');
        console.log('Data/hora atual do banco:', currentTimeResult.rows[0].current_time);
        
        // Verificar data/hora do sistema
        console.log('Data/hora do sistema:', new Date());
        
    } catch (error) {
        console.error('Erro ao verificar configuração de data/hora:', error);
    } finally {
        await pool.end();
    }
}

checkDatabaseTime(); 