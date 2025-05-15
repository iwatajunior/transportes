// Utilitário para normalizar o valor do perfil para um dos valores válidos do enum perfil_usuario_enum
const { USER_ROLES } = require('./userConstants');

/**
 * Normaliza o valor do perfil para um dos valores válidos do enum perfil_usuario_enum
 * @param {string} perfil - O valor do perfil a ser normalizado
 * @returns {string} - Um valor válido do enum perfil_usuario_enum
 */
const normalizePerfil = (perfil) => {
    if (!perfil) return USER_ROLES.REQUISITANTE;
    
    // Verificar se já é um valor válido
    if (Object.values(USER_ROLES).includes(perfil)) {
        return perfil;
    }
    
    // Normalizar baseado no texto
    const perfilLower = String(perfil).toLowerCase();
    
    if (perfilLower === 'requisitante' || perfilLower.includes('requisitante')) {
        return USER_ROLES.REQUISITANTE;
    } else if (perfilLower === 'motorista' || perfilLower.includes('motor')) {
        return USER_ROLES.MOTORISTA;
    } else if (perfilLower === 'gestor' || perfilLower.includes('gestor')) {
        return USER_ROLES.GESTOR;
    } else if (perfilLower === 'administrador' || perfilLower.includes('admin')) {
        return USER_ROLES.ADMINISTRADOR;
    } else if (perfilLower.includes('usuario requisitante')) {
        return USER_ROLES.USUARIO_REQUISITANTE;
    } else if (perfilLower.includes('usuario gestor')) {
        return USER_ROLES.USUARIO_GESTOR;
    }
    
    // Valor padrão
    return USER_ROLES.REQUISITANTE;
};

module.exports = {
    normalizePerfil
};
