const pool = require('../config/db'); // Certifique-se que o caminho para seu db.js está correto

const vehicleModel = {
    /**
     * Cria um novo veículo no banco de dados.
     * @param {object} vehicleData - Dados do veículo a ser criado.
     * Ex: { placa, marca, modelo, ano_fabricacao, capacidade_passageiros, tipo_combustivel, km_atual, observacoes, data_ultima_revisao }
     * O status_veiculo será 'Disponível' por padrão na criação, a menos que especificado.
     * @returns {Promise<object>} O objeto do veículo criado.
     */
async create(vehicleData) {
    // vehicleData agora vem do controller com nomes de campo já alinhados com o DB (ex: ano, tipo)
    // devido à validação com o vehicleSchema atualizado.
    const {
        placa,                  // DB: placa
        marca,                  // DB: marca
        modelo,                 // DB: modelo
        ano,                    // DB: ano (antes era ano_fabricacao)
        capacidade,             // DB: capacidade (antes era capacidade_passageiros)
        tipo,                   // DB: tipo (antes era tipo_veiculo)
        tipo_uso,               // DB: tipo_uso (NOVO CAMPO)
        status,                 // DB: status (antes era status_veiculo, default do schema se não fornecido)
        quilometragematual,     // DB: quilometragematual (antes era km_atual)
        ultimamanutencao,       // DB: ultimamanutencao (antes era data_ultima_revisao)
        dataproximarevisao,     // DB: dataproximarevisao (antes era data_proxima_revisao)
        observacoes,            // DB: observacoes
        usuarioresponsavelid    // DB: usuarioresponsavelid (antes era usuario_responsavel_id)
    } = vehicleData;

    // Nomes das colunas na query SQL DEVEM corresponder aos da tabela `veiculos`
    const query = `
        INSERT INTO veiculos (
            placa, marca, modelo, ano, tipo, capacidade, tipo_uso, 
            status, quilometragematual, ultimamanutencao, 
            dataproximarevisao, observacoes, usuarioresponsavelid
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
    `;
    // Ordem dos valores DEVE corresponder à ordem das colunas na query e aos placeholders $1, $2, etc.
    const values = [
        placa,                  // $1
        marca,                  // $2
        modelo,                 // $3
        ano,                    // $4 
        tipo,                   // $5 
        capacidade,             // $6 
        tipo_uso || null,       // $7 (NOVO CAMPO - usa null se não fornecido)
        status,                 // $8 
        quilometragematual,     // $9 
        ultimamanutencao || null,    // $10 
        dataproximarevisao || null,   // $11 
        observacoes || null,            // $12 
        usuarioresponsavelid        // $13 
    ];

    try {
        // console.log('Executing query in create:', query, values); // Optional: for debugging
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao criar veículo no modelo:', error);
        throw error;
    }
},

    /**
     * Lista todos os veículos cadastrados.
     * @returns {Promise<Array<object>>} Uma lista de todos os veículos.
     */
    async findAll() {
        const query = 'SELECT * FROM Veiculos ORDER BY veiculoid ASC';
        try {
            console.log('Executing query in findAll:', query); // Debugging query
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar todos os veículos no modelo:', error);
            throw error;
        }
    },

    /**
     * Busca um veículo específico pelo seu ID.
     * @param {number} id - O ID do veículo.
     * @returns {Promise<object|null>} O objeto do veículo encontrado ou null se não existir.
     */
    async findById(id) {
        const query = 'SELECT * FROM Veiculos WHERE veiculoid = $1';
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Erro ao buscar veículo por ID (${id}) no modelo:`, error);
            throw error;
        }
    },
    
    /**
     * Busca veículos por placa.
     * @param {string} placa - A placa do veículo.
     * @returns {Promise<object|null>} O objeto do veículo encontrado ou null se não existir.
     */
    async findByPlate(placa) {
        const query = 'SELECT * FROM Veiculos WHERE placa = $1;';
        try {
            const result = await pool.query(query, [placa]);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Erro ao buscar veículo pela placa (${placa}) no modelo:`, error);
            throw error;
        }
    },

    /**
     * Atualiza os dados de um veículo existente.
     * @param {number} id - O ID do veículo a ser atualizado.
     * @param {object} vehicleData - Campos a serem atualizados.
     * @returns {Promise<object|null>} O objeto do veículo atualizado ou null se não encontrado.
     */
    async update(id, vehicleData) {
        const fields = [];
        const values = [];
        let queryIndex = 1;

        // Constrói a query dinamicamente baseada nos campos fornecidos
        for (const key in vehicleData) {
            if (vehicleData[key] !== undefined) { // Permite null, mas não undefined
                fields.push(`${key} = $${queryIndex++}`);
                values.push(vehicleData[key]);
            }
        }

        if (fields.length === 0) {
            // Se nenhum campo for fornecido para atualização, busca e retorna o veículo existente
            return this.findById(id);
        }
        
        // Removido: fields.push(`data_atualizacao = CURRENT_TIMESTAMP`);

        values.push(id); // Adiciona o ID do veículo como último valor para a cláusula WHERE // Adiciona o ID do veículo como último valor para a cláusula WHERE

        const query = `
            UPDATE Veiculos
            SET ${fields.join(', ')}
            WHERE veiculoid = $${queryIndex} 
            RETURNING *;
        `;

        try {
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Erro ao atualizar veículo (${id}) no modelo:`, error);
            throw error;
        }
    },

    /**
     * "Remove" um veículo (soft delete) atualizando seu status para 'Inativo'.
     * @param {number} id - O ID do veículo a ser desativado.
     * @returns {Promise<object|null>} O objeto do veículo atualizado para 'Inativo' ou null se não encontrado.
     */
    async deactivate(id) {
        const query = `
            UPDATE Veiculos
            SET status = 'Inativo' 
            WHERE veiculoid = $1
            RETURNING *;
        `;
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Erro ao desativar veículo (${id}) no modelo:`, error);
            throw error;
        }
    },
    
    /**
     * Remove um veículo permanentemente do banco de dados.
     * CUIDADO: Esta ação é irreversível.
     * @param {number} id - O ID do veículo a ser deletado.
     * @returns {Promise<object|null>} O objeto do veículo deletado ou null se não encontrado.
     */
    async hardDelete(id) {
        const query = 'DELETE FROM Veiculos WHERE veiculo_id = $1 RETURNING *;';
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Erro ao deletar permanentemente veículo (${id}) no modelo:`, error);
            throw error;
        }
    },

    /**
     * Busca veículos que podem ser alocados (status 'Disponível' ou 'Em Uso').
     * Retorna apenas ID, placa, marca e modelo para o dropdown.
     * @returns {Promise<Array<object>>} Uma lista de veículos disponíveis.
     */
    async findAvailableVehicles() {
        // Modificado para buscar veículos 'Disponível' OU 'Em Uso'. 
        const query = `
        SELECT veiculoid, placa, marca, modelo 
        FROM Veiculos 
        WHERE status = 'Disponível'
        ORDER BY marca, modelo, placa;
    `;
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar veículos disponíveis no modelo:', error);
            throw error;
        }
    }
};

module.exports = vehicleModel;
