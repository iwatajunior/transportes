// Valores do enum perfil_usuario_enum no banco de dados
const USER_ROLES = Object.freeze({
    REQUISITANTE: 'Requisitante',
    GESTOR: 'Gestor',
    MOTORISTA: 'Motorista',
    ADMINISTRADOR: 'administrador',
    USUARIO_REQUISITANTE: 'usuario requisitante',
    USUARIO_GESTOR: 'usuario gestor',
    MOTORISTA_LOWER: 'motorista'
});

module.exports = {
    USER_ROLES
};
