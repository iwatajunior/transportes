// backend/src/models/userModel.js
const { Pool } = require('pg');
const { normalizePerfil } = require('../utils/profileNormalizer');
require('dotenv').config(); // Garante que as variáveis de .env sejam carregadas

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // Descomente e ajuste se precisar de SSL
});

/**
 * Encontra um usuário pelo email.
 * @param {string} email - O email do usuário a ser encontrado.
 * @returns {Promise<object|null>} O objeto do usuário se encontrado, ou null caso contrário.
 */
const findByEmail = async (email) => {
    const query = 'SELECT userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro, senha FROM usuarios WHERE email = $1'; // Colunas em minúsculas, tabela usuarios, incluí senha para consistência
    try {
        const result = await pool.query(query, [email]);
        return result.rows[0] || null; // Retorna o primeiro usuário encontrado ou null
    } catch (error) {
        console.error('Erro ao buscar usuário por email no banco de dados:', error);
        throw error; // Re-lança o erro para ser tratado pelo controller
    }
};

/**
 * Cria um novo usuário no banco de dados.
 * @param {object} userData - Os dados do usuário a serem criados.
 * @param {string} userData.nome - Nome do usuário.
 * @param {string} userData.email - Email do usuário.
 * @param {string} userData.senha - Senha já hasheada do usuário.
 * @param {string} userData.perfil - Perfil do usuário (Requisitante, Motorista, Gestor).
 * @param {string} [userData.setor] - Setor do usuário (opcional).
 * @param {string} [userData.fotoPerfilURL] - URL da foto de perfil (opcional).
 * @returns {Promise<object>} O objeto do usuário criado.
 */
const create = async (userData) => {
    const {
        nome,
        email,
        senha, // Senha já deve vir hasheada do controller
        perfil,
        setor,
        fotoperfilurl, // Nome do campo exatamente como está no banco
    } = userData;

    const query = `
        INSERT INTO usuarios (nome, email, senha, perfil, setor, fotoperfilurl, ativo, datacadastro)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP)
        RETURNING userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro;
    `;
    // Os valores de fotoperfilurl e setor podem ser null se não forem fornecidos
    const values = [nome, email, senha, perfil, setor || null, fotoperfilurl || null]; // Usando o mesmo nome do banco

    try {
        const result = await pool.query(query, values);
        return result.rows[0]; // Retorna o usuário recém-criado
    } catch (error) {
        console.error('Erro ao criar usuário no banco de dados:', error);
        // TODO: Tratar erros específicos do banco, como violação de constraint UNIQUE para Email (error.code === '23505')
        throw error; // Re-lança o erro para ser tratado pelo controller
    }
};

/**
 * Encontra um usuário pelo ID.
 * @param {number} id - O ID do usuário a ser encontrado.
 * @returns {Promise<object|null>} O objeto do usuário se encontrado, ou null caso contrário.
 */
const findById = async (id) => {
    const query = 'SELECT userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro FROM usuarios WHERE userid = $1'; // Tabela e colunas minúsculas
    try {
        console.log('[userModel.findById] Buscando usuário:', id);
        console.log('[userModel.findById] Query:', query);
        const result = await pool.query(query, [id]);
        console.log('[userModel.findById] Resultado:', result.rows[0]);
        return result.rows[0] || null; // Retorna o primeiro usuário encontrado ou null
    } catch (error) {
        console.error('Erro ao buscar usuário por ID no banco de dados:', error);
        throw error; // Re-lança o erro para ser tratado pelo controller
    }
};

/**
 * Busca todos os usuários no banco de dados.
 * @returns {Promise<Array<object>>} Uma lista de todos os usuários (sem a senha).
 */
const getAll = async () => {
    const query = 'SELECT userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro FROM usuarios ORDER BY nome ASC'; // Tabela e colunas minúsculas
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar todos os usuários no banco de dados:', error);
        throw error;
    }
};

const update = async (userId, fieldsToUpdate) => {
    console.log('[userModel.update] Recebido userId:', userId);
    console.log('[userModel.update] Recebido fieldsToUpdate:', JSON.stringify(fieldsToUpdate, null, 2));

    const validFields = ['nome', 'email', 'senha', 'perfil', 'setor', 'fotoperfilurl', 'ativo'];
    let query = 'UPDATE usuarios SET ';
    const values = [];
    let fieldIndex = 1;

    Object.keys(fieldsToUpdate).forEach(key => {
        const lowerKey = key.toLowerCase(); // Normaliza para minúsculas para correspondência
        if (validFields.includes(lowerKey) && fieldsToUpdate[key] !== undefined) {
            // A chave do objeto já é o nome da coluna em minúsculas (ex: fotoperfilurl)
            let dbColumn = key; 
            
            // Tratamento especial para o campo perfil
            if (lowerKey === 'perfil') {
                // Verificar se o valor do perfil é um dos valores válidos do enum
                const perfilValue = fieldsToUpdate[key];
                console.log('[userModel.update] Valor original do perfil:', perfilValue);
                
                // O enum perfil_usuario_enum tem 7 valores possíveis:
                // 'Requisitante', 'Motorista', 'Gestor', 'administrador', 'usuario requisitante', 'usuario gestor', 'motorista'
                
                // Verificar se o perfil já é um dos valores válidos exatos
                const enumValues = [
                    'Requisitante', 'Motorista', 'Gestor', 
                    'administrador', 'usuario requisitante', 'usuario gestor', 'motorista'
                ];
                
                // Declarar a variável validPerfilValue no escopo correto
                let validPerfilValue;
                
                if (enumValues.includes(perfilValue)) {
                    console.log('[userModel.update] O perfil já é um valor válido do enum:', perfilValue);
                    validPerfilValue = perfilValue;
                } else {
                    // Converter para um dos valores exatos do enum perfil_usuario_enum
                    const perfilLower = String(perfilValue).toLowerCase();
                    
                    // Tentar mapear para um dos 7 valores exatos do enum
                    if (perfilLower === 'requisitante' || perfilLower.includes('requisitante')) {
                        // Decidir entre 'Requisitante' e 'usuario requisitante'
                        validPerfilValue = 'Requisitante';
                    } else if (perfilLower === 'motorista' || perfilLower.includes('motor')) {
                        // Decidir entre 'Motorista' e 'motorista'
                        validPerfilValue = 'Motorista';
                    } else if (perfilLower === 'gestor' || perfilLower.includes('gestor')) {
                        // Decidir entre 'Gestor' e 'usuario gestor'
                        validPerfilValue = 'Gestor';
                    } else if (perfilLower.includes('admin')) {
                        validPerfilValue = 'administrador';
                    } else {
                        validPerfilValue = 'Requisitante'; // Valor padrão
                    }
                }
                
                console.log('[userModel.update] Valor normalizado do perfil:', validPerfilValue);
                console.log('[userModel.update] Tipo do valor normalizado:', typeof validPerfilValue);
                
                query += `${dbColumn} = $${fieldIndex}, `;
                values.push(validPerfilValue);
            } else {
                query += `${dbColumn} = $${fieldIndex}, `;
                values.push(fieldsToUpdate[key]);
            }
            
            fieldIndex++;
        }
    });

    if (values.length === 0) {
        // Nenhum campo válido para atualizar, ou todos os valores são undefined
        // Pode retornar o usuário existente ou um erro/mensagem específica
        console.log('Nenhum campo válido fornecido para atualização.');
        return findById(userId); // Ou lançar um erro, ou retornar null/undefined
    }

    // Remove a última vírgula e espaço
    query = query.slice(0, -2);
    query += ` WHERE userid = $${fieldIndex} RETURNING userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro;`;
    values.push(userId);

    console.log('[userModel.update] Query construída:', query);
    console.log('[userModel.update] Valores para a query:', values);

    try {
        console.log('[userModel.update] Executando query...');
        const result = await pool.query(query, values);
        console.log('[userModel.update] Resultado da query:', JSON.stringify(result.rows[0], null, 2));
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        return null; // Ou lançar um erro se nenhum usuário for atualizado/retornado
    } catch (error) {
        console.error('[userModel.update] Erro ao executar query:', error);
        console.error('[userModel.update] Query que falhou:', query);
        console.error('[userModel.update] Valores da query que falhou:', values);
        
        // Verificar se o erro está relacionado ao enum do perfil
        if (error.code === '22P02' && error.message.includes('perfil_usuario_enum')) {
            console.error('[userModel.update] Erro relacionado ao enum do perfil!');
            console.error('[userModel.update] Mensagem de erro completa:', error.message);
            
            // Tentar novamente com um valor garantido do enum
            try {
                // Criar uma nova query com um valor garantido para o perfil
                let newQuery = 'UPDATE usuarios SET ';
                let newValues = [];
                let newFieldIndex = 1;
                
                // Reconstruir a query sem o campo perfil
                Object.keys(fieldsToUpdate).forEach(key => {
                    if (key !== 'perfil' && fieldsToUpdate[key] !== undefined) {
                        const dbColumn = key === 'fotoPerfilURL' ? 'fotoperfilurl' : key.toLowerCase();
                        newQuery += `${dbColumn} = $${newFieldIndex}, `;
                        newValues.push(fieldsToUpdate[key]);
                        newFieldIndex++;
                    }
                });
                
                // Adicionar o perfil com um valor garantido usando a função normalizePerfil
                newQuery += `perfil = $${newFieldIndex}, `;
                const normalizedPerfil = normalizePerfil('Requisitante'); // Usar o valor padrão
                newValues.push(normalizedPerfil);
                newFieldIndex++;
                
                console.log('[userModel.update] Usando valor garantido para perfil:', normalizedPerfil);
                
                // Remover a última vírgula e espaço
                newQuery = newQuery.slice(0, -2);
                newQuery += ` WHERE userid = $${newFieldIndex} RETURNING userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro;`;
                newValues.push(userId);
                
                console.log('[userModel.update] Nova query com perfil garantido:', newQuery);
                console.log('[userModel.update] Novos valores:', newValues);
                
                const retryResult = await pool.query(newQuery, newValues);
                console.log('[userModel.update] Resultado da nova query:', JSON.stringify(retryResult.rows[0], null, 2));
                
                if (retryResult.rows.length > 0) {
                    return retryResult.rows[0];
                }
                return null;
            } catch (retryError) {
                console.error('[userModel.update] Erro na segunda tentativa:', retryError);
                throw error; // Relanço o erro original se a segunda tentativa falhar
            }
        }
        
        throw error;
    }
};


/**
 * Atualiza a senha do próprio usuário.
 * @param {number} userId - O ID do usuário a ser atualizado.
 * @param {object} data - Dados a serem atualizados. Deve conter `senha` (já hasheada).
 * @returns {Promise<object|null>} O objeto do usuário atualizado (sem a senha) ou null se não encontrado.
 */
const updateSelfProfile = async (userId, data) => {
    const { senha, fotoperfilurl } = data;

    // Se não há dados para atualizar, retorna o usuário atual
    if (senha === undefined && fotoperfilurl === undefined) {
        console.error('Tentativa de atualizar perfil sem fornecer dados no modelo.');
        return findById(userId);
    }

    // Construir a query dinamicamente baseada nos campos fornecidos
    let setClause = [];
    let values = [userId]; // Começa com userId que será sempre usado no WHERE
    let paramCount = 1;

    if (senha !== undefined) {
        setClause.push(`senha = $${++paramCount}`);
        values.push(senha);
    }

    if (fotoperfilurl !== undefined) {
        setClause.push(`fotoperfilurl = $${++paramCount}`);
        values.push(fotoperfilurl);
    }

    const query = `
        UPDATE usuarios 
        SET ${setClause.join(', ')} 
        WHERE userid = $1
        RETURNING userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro;
    `;

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error('Erro ao atualizar perfil do usuário no banco de dados:', error);
        throw error;
    }
};

/**
 * Define o token de redefinição de senha e a data de expiração para um usuário.
 * @param {number} userId - O ID do usuário.
 * @param {string} token - O token de redefinição de senha.
 * @param {Date} expires - A data e hora de expiração do token.
 * @returns {Promise<object|null>} O objeto do usuário atualizado ou null se não encontrado.
 */
const setResetPasswordToken = async (userId, token, expires) => {
    const query = `
        UPDATE usuarios
        SET reset_password_token = $1, reset_password_expires = $2
        WHERE userid = $3
        RETURNING userid, email, reset_password_token, reset_password_expires;
    `;
    // Os nomes das colunas `reset_password_token` e `reset_password_expires` devem corresponder aos que você adicionou ao BD.
    const values = [token, expires, userId];
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Erro ao definir token de redefinição de senha:', error);
        throw error;
    }
};

/**
 * Encontra um usuário por um token de redefinição de senha.
 * O token deve ser válido (não expirado) e o usuário deve estar ativo.
 * @param {string} token - O token de redefinição de senha.
 * @returns {Promise<object|null>} O objeto do usuário (incluindo a senha para comparação e atualização) se encontrado e válido, ou null.
 */
const findByResetPasswordToken = async (token) => {
    const query = `
        SELECT userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro, senha, reset_password_token, reset_password_expires
        FROM usuarios
        WHERE reset_password_token = $1 AND reset_password_expires > NOW() AND ativo = TRUE;
    `;
    // A query verifica se o token existe, não expirou (reset_password_expires > NOW()) e se o usuário está ativo.
    // Incluí a senha para que o controller possa usá-la para verificar a senha antiga se necessário, ou simplesmente para ter o objeto completo.
    try {
        const result = await pool.query(query, [token]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Erro ao buscar usuário por token de redefinição de senha:', error);
        throw error;
    }
};

// TODO: Adicionar outras funções conforme necessário (delete, etc.)

/**
 * Busca todos os usuários ativos com perfil de Motorista.
 * @returns {Promise<Array<object>>} Uma lista de objetos de motorista (userid, nome).
 */
const findDrivers = async () => {
    // Usa LOWER(perfil::text) para comparação case-insensitive, fazendo cast do ENUM para texto
    const query = 'SELECT userid, nome FROM usuarios WHERE LOWER(perfil::text) = $1 AND ativo = TRUE ORDER BY nome ASC';
    const values = ['motorista']; // Compara com 'motorista' minúsculo
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar motoristas no banco de dados:', error);
        throw error;
    }
};

module.exports = {
    pool, // Exportar o pool pode ser útil para transações manuais ou queries diretas em outros lugares
    findByEmail,
    create,
    findById,
    getAll,
    update,
    updateSelfProfile,
    setResetPasswordToken,
    findByResetPasswordToken,
    findDrivers // Exporta a nova função
};
