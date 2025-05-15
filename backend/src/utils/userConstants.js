// Valores do enum perfil_usuario_enum no banco de dados
const USER_ROLES = Object.freeze({
    REQUISITANTE: 'Requisitante',
    GESTOR: 'Gestor',
    MOTORISTA: 'Motorista',
    ADMINISTRADOR: 'Administrador'
});

/**
 * Normaliza o valor do perfil para um dos valores válidos
 * @param {string} perfil - O valor do perfil a ser normalizado
 * @returns {string} - O valor normalizado do perfil
 */
const normalizePerfil = (perfil) => {
    if (!perfil) return USER_ROLES.REQUISITANTE;
    
    // Verificar se já é um valor válido
    if (Object.values(USER_ROLES).includes(perfil)) {
        return perfil;
    }
    
    // Normalizar baseado no texto
    const perfilLower = String(perfil).toLowerCase().trim();
    
    if (perfilLower === 'requisitante' || perfilLower.includes('requisitante')) {
        return USER_ROLES.REQUISITANTE;
    } else if (perfilLower === 'motorista' || perfilLower.includes('motor')) {
        return USER_ROLES.MOTORISTA;
    } else if (perfilLower === 'gestor' || perfilLower.includes('gestor')) {
        return USER_ROLES.GESTOR;
    } else if (perfilLower === 'administrador' || perfilLower.includes('admin')) {
        return USER_ROLES.ADMINISTRADOR;
    }
    
    // Valor padrão
    return USER_ROLES.REQUISITANTE;
};

module.exports = {
    USER_ROLES,
    normalizePerfil
};
