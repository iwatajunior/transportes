const pool = require('../config/database');

class LoginAttemptModel {
    static async create(attemptData) {
        const { userid, email, ip_address, user_agent, status, motivo } = attemptData;
        
        const query = `
            INSERT INTO tentativas_login 
            (userid, email, ip_address, user_agent, status, motivo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [userid, email, ip_address, user_agent, status, motivo];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao registrar tentativa de login:', error);
            throw error;
        }
    }

    static async getAllAttempts(page = 1, limit = 50) {
        console.log('[loginAttemptModel] Buscando tentativas de login...');
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT * FROM tentativas_login 
            ORDER BY data_tentativa DESC
            LIMIT $1 OFFSET $2
        `;
        
        const countQuery = `
            SELECT COUNT(*) FROM tentativas_login
        `;
        
        try {
            console.log('[loginAttemptModel] Executando query:', query);
            const [result, countResult] = await Promise.all([
                pool.query(query, [limit, offset]),
                pool.query(countQuery)
            ]);
            
            console.log('[loginAttemptModel] Tentativas encontradas:', result.rows.length);
            return {
                attempts: result.rows,
                total: parseInt(countResult.rows[0].count),
                page,
                limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            };
        } catch (error) {
            console.error('[loginAttemptModel] Erro ao buscar tentativas de login:', error);
            throw new Error(`Erro ao buscar tentativas de login: ${error.message}`);
        }
    }

    static async getRecentAttempts(email, minutes = 5) {
        const query = `
            SELECT * FROM tentativas_login 
            WHERE email = $1 
            AND data_tentativa > NOW() - INTERVAL '${minutes} minutes'
            ORDER BY data_tentativa DESC
        `;
        
        try {
            const result = await pool.query(query, [email]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar tentativas recentes:', error);
            throw error;
        }
    }

    static async getFailedAttemptsCount(email, minutes = 5) {
        const query = `
            SELECT COUNT(*) 
            FROM tentativas_login 
            WHERE email = $1 
            AND status = false 
            AND data_tentativa > NOW() - INTERVAL '${minutes} minutes'
        `;
        
        try {
            const result = await pool.query(query, [email]);
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Erro ao contar tentativas falhas:', error);
            throw error;
        }
    }
}

module.exports = LoginAttemptModel; 