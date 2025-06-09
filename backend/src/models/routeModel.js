const pool = require('../config/db');

const routeModel = {
    /**
     * Cria uma nova rota no banco de dados.
     * @param {object} routeData - Dados da rota a ser criada.
     * @returns {Promise<object>} O objeto da rota criada.
     */
    async create(routeData) {
        const {
            identificacao,
            cidadeOrigem,
            cidadeDestino,
            cidadesIntermediariasIda,
            cidadesIntermediariasVolta,
            dataSaida,
            dataRetorno
        } = routeData;

        const query = `
            INSERT INTO rotas (
                identificacao,
                cidade_origem,
                cidade_destino,
                cidades_intermediarias_ida,
                cidades_intermediarias_volta,
                data_saida,
                data_retorno,
                data_cadastro
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            RETURNING *;
        `;
        const values = [
            identificacao,
            cidadeOrigem,
            cidadeDestino,
            JSON.stringify(cidadesIntermediariasIda),
            JSON.stringify(cidadesIntermediariasVolta),
            dataSaida,
            dataRetorno
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar rota no modelo:', error);
            throw error;
        }
    },

    /**
     * Busca todas as rotas cadastradas.
     * @returns {Promise<Array>} Lista de rotas.
     */
    async findAll(onlyActive = false) {
        const query = `
            SELECT * FROM get_routes($1::boolean) as rotas;
        `;

        try {
            const result = await pool.query(query, [onlyActive]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar rotas:', error);
            throw error;
        }
    },

    /**
     * Busca uma rota específica pelo ID.
     * @param {number} id - ID da rota.
     * @returns {Promise<object>} Dados da rota.
     */
    async findById(id) {
        const query = `
            SELECT * FROM rotas
            WHERE id = $1;
        `;

        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar rota por ID:', error);
            throw error;
        }
    },

    async update(id, routeData) {
        const {
            identificacao,
            cidade_origem,
            cidade_destino,
            data_saida,
            data_retorno,
            cidades_intermediarias_ida,
            cidades_intermediarias_volta,
            status
        } = routeData;

        const query = `
            UPDATE rotas 
            SET 
                identificacao = $1,
                cidade_origem = $2,
                cidade_destino = $3,
                data_saida = $4,
                data_retorno = $5,
                cidades_intermediarias_ida = $6,
                cidades_intermediarias_volta = $7,
                status = $8,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *
        `;

        const values = [
            identificacao,
            cidade_origem,
            cidade_destino,
            data_saida,
            data_retorno,
            JSON.stringify(cidades_intermediarias_ida),
            JSON.stringify(cidades_intermediarias_volta),
            status,
            id
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao atualizar rota:', error);
            throw error;
        }
    }
};

module.exports = routeModel; 