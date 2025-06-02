const pool = require('../config/db');
const { USER_ROLES } = require('../utils/userConstants'); // Importar USER_ROLES

const tripModel = {
    /**
     * Cria um novo registro de viagem.
     * @param {object} tripData - Dados da viagem.
     * Ex: { data_saida, horario_saida, data_retorno_prevista, horario_retorno_previsto, destino_completo, finalidade, quantidade_passageiros, tipo_veiculo_desejado, solicitante_usuarioid, observacoes }
     * @returns {Promise<object>} O objeto da viagem criada.
     */
    async create(tripData) {
        const {
            data_saida,
            horario_saida,
            data_retorno_prevista,
            horario_retorno_previsto,
            destino_completo,
            finalidade,
            quantidade_passageiros,
            tipo_veiculo_desejado, // Adicionado
            veiculo_solicitado_id, // Continua aqui, mas será null ou opcional na criação pelo requisitante
            solicitante_usuarioid,
            observacoes // pode ser null
            // status_viagem tem DEFAULT 'Pendente' no DB
        } = tripData;

        const query = `
            INSERT INTO viagens (
                data_saida, horario_saida, data_retorno_prevista, horario_retorno_previsto,
                destino_completo, finalidade, quantidade_passageiros, tipo_veiculo_desejado, 
                veiculo_solicitado_id, solicitante_usuarioid, observacoes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;
        const values = [
            data_saida, horario_saida, data_retorno_prevista, horario_retorno_previsto,
            destino_completo, finalidade, quantidade_passageiros, tipo_veiculo_desejado,
            veiculo_solicitado_id, solicitante_usuarioid, observacoes
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar viagem no modelo:', error);
            throw error;
        }
    },

    /**
     * Busca uma viagem pelo ID.
     * @param {number} id - O ID da viagem.
     * @returns {Promise<object|null>} O objeto da viagem ou null se não encontrada.
     */
    async findById(id) {
        // Junta com a tabela usuarios para pegar o nome do solicitante
        // Junta com a tabela veiculos (opcionalmente) para pegar a placa do veículo alocado
        // TODO: Considerar juntar com motorista também se necessário
        const query = `
            SELECT 
                v.viagemid as tripid,
                v.data_saida, v.horario_saida, v.data_retorno_prevista, v.horario_retorno_previsto,
                v.destino_completo, v.finalidade, v.quantidade_passageiros, v.tipo_veiculo_desejado,
                v.veiculo_solicitado_id, v.solicitante_usuarioid, v.observacoes, v.status_viagem,
                v.veiculo_alocado_id, v.motorista_usuarioid,
                u_sol.nome AS solicitante_nome, 
                ve.placa AS veiculo_alocado_placa,
                ve.modelo AS veiculo_alocado_modelo, -- Adicionado modelo do veículo
                u_mot.nome AS motorista_alocado_nome, -- Alias corrigido
                v.veiculo_alocado_id AS veiculoid, -- Seleciona o ID do veículo com alias esperado
                v.motorista_usuarioid AS motoristaid, -- Seleciona o ID do motorista com alias esperado
                v.km_inicial, -- Adicionado KM inicial
                v.km_final    -- Adicionado KM final
            FROM viagens v
            LEFT JOIN usuarios u_sol ON v.solicitante_usuarioid = u_sol.userid -- Join para solicitante
            LEFT JOIN veiculos ve ON v.veiculo_alocado_id = ve.veiculoid -- Join para veículo
            LEFT JOIN usuarios u_mot ON v.motorista_usuarioid = u_mot.userid -- Join para motorista
            WHERE v.viagemid = $1;
        `;
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Erro ao buscar viagem (${id}) com detalhes no modelo:`, error);
            throw error;
        }
    },

    /**
     * Busca todas as viagens, com filtros baseados no perfil do usuário.
     * - Requisitante: vê apenas suas próprias viagens.
     * - Gestor/Administrador: vê todas as viagens.
     * TODO: Adicionar joins com usuarios (solicitante, motorista) e veiculos para dados mais completos.
     * @param {object} userData - Dados do usuário logado { userId, perfil }
     * @returns {Promise<Array>} Um array de objetos de viagem.
     */
    async findAll(userData = {}) {
        const { userId } = userData;
        // Mantemos o perfil original para comparar com USER_ROLES e também obtemos a versão em minúsculas para comparações mais flexíveis
        const perfil = userData.perfil;
        const perfilLower = userData.perfil?.toLowerCase();

        // Base da query com JOINs para buscar dados relacionados
        let queryText = `
            SELECT 
                v.viagemid as tripid,
                v.data_saida, v.horario_saida, v.data_retorno_prevista, v.horario_retorno_previsto,
                v.destino_completo, v.finalidade, v.quantidade_passageiros, v.tipo_veiculo_desejado,
                v.veiculo_solicitado_id, v.solicitante_usuarioid, v.observacoes, v.status_viagem,
                v.veiculo_alocado_id, v.motorista_usuarioid, v.km_inicial, v.km_final,
                u_sol.nome AS solicitante_nome,
                u_sol.fotoperfilurl AS solicitante_avatar,
                u_mot.fotoperfilurl AS motorista_avatar,
                ve.placa AS veiculo_alocado_placa,
                ve.modelo AS veiculo_alocado_modelo, -- Adicionado modelo
                u_mot.nome AS motorista_nome,
                v.km_inicial, -- Adicionado KM inicial
                v.km_final    -- Adicionado KM final
            FROM viagens v
            LEFT JOIN usuarios u_sol ON v.solicitante_usuarioid = u_sol.userid
            LEFT JOIN veiculos ve ON v.veiculo_alocado_id = ve.veiculoid
            LEFT JOIN usuarios u_mot ON v.motorista_usuarioid = u_mot.userid
        `;
        const queryParams = [];
        let conditions = [];

        // IMPORTANTE: Verifique se USER_ROLES está importado e acessível aqui.
        // Ex: const USER_ROLES = require('../utils/userRoles');

        if (!perfil) {
            console.error('Erro: Perfil do usuário não fornecido em tripModel.findAll.');
            return []; // Retorna vazio se o perfil não for fornecido, por segurança.
        }

        // Aplica filtro baseado no perfil
        // Verificamos tanto o perfil original quanto a versão em minúsculas para maior flexibilidade
        if (perfil === USER_ROLES.REQUISITANTE || perfilLower === 'requisitante' || perfilLower === 'usuario requisitante') {
            console.log(`Perfil requisitante identificado: ${perfil}. Filtrando viagens do usuário ${userId}.`);
            conditions.push(`v.solicitante_usuarioid = $${queryParams.push(userId)}`); // Adiciona userId aos params e usa o novo índice
        } else if (perfil === USER_ROLES.GESTOR || perfil === USER_ROLES.ADMINISTRADOR || 
                   perfilLower === 'gestor' || perfilLower === 'administrador' || 
                   perfilLower === 'usuario gestor') {
            console.log(`Perfil gestor/admin identificado: ${perfil}. Mostrando todas as viagens.`);
            // Gestor/Admin vê tudo, nenhuma condição adicional por perfil.
        } else if (perfil === USER_ROLES.MOTORISTA || perfilLower === 'motorista') {
            console.log(`Perfil motorista identificado: ${perfil}. Filtrando viagens do motorista ${userId}.`);
            conditions.push(`v.motorista_usuarioid = $${queryParams.push(userId)}`); // Motorista vê suas viagens
        } else {
            console.warn(`Perfil '${perfil}' não explicitamente tratado em tripModel.findAll. Retornando vazio por segurança.`);
            return []; // Retorna lista vazia por segurança para perfis não mapeados.
        }

        // Adiciona cláusula WHERE se houver condições
        if (conditions.length > 0) {
            queryText += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        // Ordena por status na ordem especificada e depois por data de criação
        queryText += ` ORDER BY
            CASE v.status_viagem
                WHEN 'Pendente' THEN 1
                WHEN 'Agendada' THEN 2
                WHEN 'Andamento' THEN 3
                WHEN 'Concluida' THEN 4
                WHEN 'Cancelada' THEN 5
                ELSE 6
            END,
            v.data_criacao DESC`;

        try {
            const { rows } = await pool.query(queryText, queryParams);
            console.log('Resultados da query findAll:', rows); // Log adicionado
            return rows;
        } catch (error) {
            console.error('Erro ao buscar todas as viagens no modelo com filtros:', error);
            console.error('Query que falhou:', queryText, 'Params:', queryParams); // Mantendo este log de erro específico
            throw error; // Propaga o erro para o controller tratar.
        }
    },

    /**
     * Atualiza uma viagem existente.
     * @param {number} id - O ID da viagem a ser atualizada.
     * @param {object} tripData - Dados a serem atualizados.
     * @returns {Promise<object|null>} O objeto da viagem atualizada ou null se não encontrada.
     */
    async update(id, tripData) {
        const fields = [];
        const values = [];
        let queryIndex = 1;

        // Campos permitidos para atualização (baseado no schema e tabela)
        const allowedFields = [
            'data_saida', 'horario_saida', 'data_retorno_prevista', 'horario_retorno_previsto',
            'data_retorno_efetiva', 'horario_retorno_efetivo', 'destino_completo', 'finalidade',
            'quantidade_passageiros', 'tipo_veiculo_desejado', // Adicionado
            'veiculo_solicitado_id', 'veiculo_alocado_id',
            'motorista_usuarioid', 'status_viagem', 'observacoes'
        ];

        for (const key in tripData) {
            if (Object.prototype.hasOwnProperty.call(tripData, key) && allowedFields.includes(key)) {
                if (tripData[key] !== undefined) { // Garante que não tentamos atualizar com 'undefined'
                    fields.push(`${key} = $${queryIndex++}`);
                    values.push(tripData[key]);
                }
            }
        }

        if (fields.length === 0) {
            // Nenhum campo válido para atualizar, retorna os dados atuais ou erro
            // console.warn('Nenhum campo válido para atualização fornecido para a viagem ID:', id);
            // return this.findById(id); // Ou pode lançar um erro/retornar null dependendo da política
             throw new Error('Nenhum campo válido para atualização fornecido.');
        }
        
        // Adiciona o ID da viagem ao final do array de valores para a cláusula WHERE
        values.push(id);

        const query = `
            UPDATE viagens
            SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
            WHERE viagemid = $${queryIndex}
            RETURNING *;
        `;

        try {
            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Erro ao atualizar viagem (${id}) no modelo:`, error);
            throw error;
        }
    },

    /**
     * Deleta uma viagem pelo ID.
     * @param {number} id - O ID da viagem a ser deletada.
     * @returns {Promise<object|null>} O objeto da viagem deletada ou null se não encontrada.
     */
    async deleteById(id) {
        const query = `
            DELETE FROM viagens WHERE viagemid = $1 RETURNING *;
        `;
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Erro ao deletar viagem (${id}) no modelo:`, error);
            throw error;
        }
    },

    /**
     * Aloca um veículo e um motorista para uma viagem específica.
     * @param {number} tripId - O ID da viagem a ser atualizada.
     * @param {number|null} vehicleId - O ID do veículo a ser alocado (ou null para desassociar).
     * @param {number|null} driverId - O ID do motorista a ser alocado (ou null para desassociar).
     * @returns {Promise<object|null>} O objeto da viagem atualizado com os nomes/placas ou null se não encontrado.
     */
    async allocateResources(tripId, vehicleId, driverId) {
        const updateQuery = `
            UPDATE viagens 
            SET veiculo_alocado_id = $1, motorista_usuarioid = $2
            WHERE viagemid = $3
            RETURNING viagemid;
        `;
        const selectQuery = `
            SELECT 
                v.*, 
                u_sol.nome AS solicitante_nome,
                ve.placa AS veiculo_alocado_placa,
                u_mot.nome AS motorista_nome
            FROM viagens v
            LEFT JOIN usuarios u_sol ON v.solicitante_usuarioid = u_sol.userid
            LEFT JOIN veiculos ve ON v.veiculo_alocado_id = ve.veiculoid
            LEFT JOIN usuarios u_mot ON v.motorista_usuarioid = u_mot.userid
            WHERE v.viagemid = $1;
        `;

        try {
            // Primeiro, atualiza os IDs
            const updateResult = await pool.query(updateQuery, [vehicleId, driverId, tripId]);
            
            // Se a atualização não retornou o ID (ou seja, não encontrou a viagem), retorna null
            if (updateResult.rowCount === 0) {
                return null;
            }

            // Se atualizou, busca a viagem completa com os dados associados
            const selectResult = await pool.query(selectQuery, [tripId]);
            return selectResult.rows[0] || null; // Retorna a viagem atualizada

        } catch (error) {
            console.error(`Erro ao alocar recursos para viagem (${tripId}) no modelo:`, error);
            throw error; // Re-lança para ser tratado pelo controller
        }
    }
    // NÃO HÁ MAIS updateStatus AQUI DENTRO
}; // Fim do objeto tripModel

/**
 * Atualiza o status de uma viagem específica.
 * @param {number} tripId - O ID da viagem.
 * @param {string} newStatus - O novo status para a viagem.
 * @returns {Promise<object|null>} O objeto da viagem atualizada ou null se não encontrada.
 */
async function updateStatus(tripId, newStatus) {
    const updateStatusQuery = `
        UPDATE viagens
        SET status_viagem = $1, data_atualizacao = CURRENT_TIMESTAMP
        WHERE viagemid = $2
        RETURNING *;
    `;
    try {
        const result = await pool.query(updateStatusQuery, [newStatus, tripId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Erro ao atualizar status da viagem ${tripId} para ${newStatus} no modelo:`, error);
        throw error;
    }
}

/**
 * Verifica se um veículo específico já está alocado em outra viagem
 * que conflita com o intervalo de tempo fornecido.
 * @param {number} vehicleId - ID do veículo a verificar.
 * @param {string|Date} startTime - Timestamp de início do novo intervalo.
 * @param {string|Date} endTime - Timestamp de fim do novo intervalo.
 * @param {number|null} excludeTripId - ID da viagem a ser excluída da verificação (para atualizações).
 * @returns {Promise<boolean>} True se houver conflito, False caso contrário.
 */
async function checkVehicleConflict(vehicleId, startTime, endTime, excludeTripId = null) {

    const conflictCheckQuery = ` 
        SELECT EXISTS (
            SELECT 1
            FROM viagens
            WHERE veiculo_alocado_id = $1
              AND ( (data_saida::text || ' ' || horario_saida::text)::timestamp < $3 
                AND (data_retorno_prevista::text || ' ' || horario_retorno_previsto::text)::timestamp > $2
              )
              AND ($4::integer IS NULL OR viagemid != $4)
              AND status_viagem IN ('Agendada', 'Andamento')
        );
    `;
    try {
        const { rows } = await pool.query(conflictCheckQuery, [vehicleId, startTime, endTime, excludeTripId]);

        return rows[0].exists;
    } catch (error) {
        console.error('Erro ao verificar conflito de veículo:', error);
        throw error;
    }
}

/**
 * Verifica se um motorista específico já está alocado em outra viagem
 * que conflita com o intervalo de tempo fornecido.
 * @param {number} driverId - ID do motorista a verificar.
 * @param {string|Date} startTime - Timestamp de início do novo intervalo.
 * @param {string|Date} endTime - Timestamp de fim do novo intervalo.
 * @param {number|null} excludeTripId - ID da viagem a ser excluída da verificação (para atualizações).
 * @returns {Promise<boolean>} True se houver conflito, False caso contrário.
 */
async function checkDriverConflict(driverId, startTime, endTime, excludeTripId = null) {

    const conflictCheckQuery = ` 
        SELECT EXISTS (
            SELECT 1
            FROM viagens
            WHERE motorista_usuarioid = $1
              AND ( (data_saida::text || ' ' || horario_saida::text)::timestamp < $3 
                AND (data_retorno_prevista::text || ' ' || horario_retorno_previsto::text)::timestamp > $2
              )
              AND ($4::integer IS NULL OR viagemid != $4)
              AND status_viagem IN ('Agendada', 'Andamento')
        );
    `;
    try {
        const { rows } = await pool.query(conflictCheckQuery, [driverId, startTime, endTime, excludeTripId]);

        return rows[0].exists;
    } catch (error) {
        console.error('Erro ao verificar conflito de motorista:', error);
        throw error;
    }
}

/**
 * Atualiza a quilometragem inicial ou final de uma viagem.
 * @param {number} tripId - O ID da viagem.
 * @param {object} kmData - Objeto contendo { km_inicial: number } ou { km_final: number }.
 * @returns {Promise<object|null>} O objeto da viagem atualizado com detalhes (incluindo nomes) ou null se não encontrada.
 */
async function updateKm(tripId, kmData) {
    const fields = Object.keys(kmData); // ["km_inicial"] ou ["km_final"]
    const values = Object.values(kmData);

    if (fields.length !== 1) {
        console.error("Erro em updateKm: kmData deve conter exatamente um campo (km_inicial ou km_final).", kmData);
        throw new Error("Dados de KM inválidos. Forneça apenas km_inicial ou km_final.");
    }

    const fieldToUpdate = fields[0]; // km_inicial ou km_final
    if (fieldToUpdate !== 'km_inicial' && fieldToUpdate !== 'km_final') {
        console.error(`Erro em updateKm: Tentativa de atualizar campo inválido: ${fieldToUpdate}`);
        throw new Error(`Campo inválido para atualização de KM: ${fieldToUpdate}`);
    }

    // Adiciona o tripId ao final dos valores para a cláusula WHERE
    values.push(tripId);

    const query = `
        UPDATE viagens
        SET ${fieldToUpdate} = $1
        WHERE viagemid = $2
        RETURNING viagemid; -- Retorna apenas o ID para confirmar o update
    `;

    try {
        // Primeiro, executa o update
        const updateResult = await pool.query(query, values);
        
        if (updateResult.rows.length === 0) {
            console.warn(`updateKm: Viagem com ID ${tripId} não encontrada para atualização.`);
            return null; // Viagem não encontrada
        }

        // Se o update foi bem-sucedido, busca a viagem completa com todos os detalhes
        // Usando a função findById que já faz os JOINs necessários
        const updatedTripDetails = await tripModel.findById(tripId);
        return updatedTripDetails;

    } catch (error) {
        console.error(`Erro ao atualizar ${fieldToUpdate} para viagem ${tripId}:`, error);
        throw error;
    }
}

// Exporta os métodos do objeto tripModel E as funções auxiliares standalone
module.exports = {
    ...tripModel, // Inclui todos os métodos de tripModel (create, findById, etc.)
    updateStatus, // Inclui a função standalone updateStatus
    checkVehicleConflict, // Exporta explicitamente para clareza
    checkDriverConflict, // Exporta explicitamente para clareza
    updateKm // Exporta a nova função
};
