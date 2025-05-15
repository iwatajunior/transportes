const Joi = require('joi');
const { USER_ROLES } = require('../utils/userConstants');

const createUserSchema = Joi.object({
    nome: Joi.string().min(3).max(100).required().messages({
        'string.base': 'Nome deve ser um texto.',
        'string.empty': 'Nome não pode ser vazio.',
        'string.min': 'Nome deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Nome deve ter no máximo {#limit} caracteres.',
        'any.required': 'Nome é obrigatório.'
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'Email deve ser um texto.',
        'string.email': 'Email deve ser um endereço de e-mail válido.',
        'string.empty': 'Email não pode ser vazio.',
        'any.required': 'Email é obrigatório.'
    }),
    senha: Joi.string().min(6).required().messages({
        'string.base': 'Senha deve ser um texto.',
        'string.empty': 'Senha não pode ser vazia.',
        'string.min': 'Senha deve ter no mínimo {#limit} caracteres.',
        'any.required': 'Senha é obrigatória.'
    }),
    perfil: Joi.string().valid(...Object.values(USER_ROLES)).required().messages({
        'string.base': 'Perfil deve ser um texto.',
        'any.only': `Perfil deve ser um dos seguintes: ${Object.values(USER_ROLES).join(', ')}.`,
        'any.required': 'Perfil é obrigatório.'
    }),
    setor: Joi.string().min(2).max(100).optional().allow('', null).messages({
        'string.base': 'Setor deve ser um texto.',
        'string.min': 'Setor deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Setor deve ter no máximo {#limit} caracteres.'
    })
    // fotoPerfilURL: Joi.string().uri().optional().allow('', null)
});

const loginUserSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email deve ser um endereço de e-mail válido.',
        'any.required': 'Email é obrigatório.'
    }),
    senha: Joi.string().required().messages({
        'any.required': 'Senha é obrigatória.'
    })
});

const updateUserSchema = Joi.object({
    nome: Joi.string().min(3).max(100).optional().messages({
        'string.base': 'Nome deve ser um texto.',
        'string.min': 'Nome deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Nome deve ter no máximo {#limit} caracteres.'
    }),
    email: Joi.string().email().optional().messages({
        'string.base': 'Email deve ser um texto.',
        'string.email': 'Email deve ser um endereço de e-mail válido.'
    }),
    senha: Joi.string().min(6).optional().allow('', null).messages({ // Permite vazio para não alterar
        'string.base': 'Senha deve ser um texto.',
        'string.min': 'Senha deve ter no mínimo {#limit} caracteres se fornecida.'
    }),
    perfil: Joi.string().optional().custom((value, helpers) => {
        // O enum perfil_usuario_enum tem 7 valores possíveis:
        // 'Requisitante', 'Motorista', 'Gestor', 'administrador', 'usuario requisitante', 'usuario gestor', 'motorista'
        const enumValues = [
            'Requisitante', 'Motorista', 'Gestor', 
            'administrador', 'usuario requisitante', 'usuario gestor', 'motorista'
        ];
        
        // Verificar se o valor já é um dos valores válidos do enum
        if (enumValues.includes(value)) {
            return value;
        }
        
        // Verificar se o valor é um dos valores definidos em USER_ROLES
        if (Object.values(USER_ROLES).includes(value)) {
            return value;
        }
        
        // Tentar normalizar o valor
        const lowerValue = String(value).toLowerCase();
        if (lowerValue.includes('requisitante')) {
            return 'Requisitante';
        } else if (lowerValue.includes('motor')) {
            return 'Motorista';
        } else if (lowerValue === 'gestor' || lowerValue.includes('aprovador') || lowerValue.includes('admin')) {
            return 'Gestor';
        }
        
        // Se não conseguir normalizar, retornar erro
        return helpers.error('any.only', { value });
    }).messages({
        'string.base': 'Perfil deve ser um texto.',
        'any.only': `Perfil deve ser um dos seguintes: ${Object.values(USER_ROLES).join(', ')}.`
    }),
    setor: Joi.string().min(2).max(100).optional().allow('', null).messages({
        'string.base': 'Setor deve ser um texto.',
        'string.min': 'Setor deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Setor deve ter no máximo {#limit} caracteres.'
    }),
    ativo: Joi.boolean().optional()
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização.'
}); // Exige que pelo menos um campo seja enviado para atualização

module.exports = {
    createUserSchema,
    loginUserSchema,
    updateUserSchema
};
