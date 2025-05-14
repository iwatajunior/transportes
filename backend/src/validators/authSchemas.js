const Joi = require('joi');

const registerSchema = Joi.object({
    nome: Joi.string().trim().min(3).max(100).required()
        .messages({
            'string.base': `"nome" deve ser do tipo texto`,
            'string.empty': `"nome" não pode ser vazio`,
            'string.min': `"nome" deve ter no mínimo {#limit} caracteres`,
            'string.max': `"nome" deve ter no máximo {#limit} caracteres`,
            'any.required': `"nome" é um campo obrigatório`
        }),
    email: Joi.string().trim().email({ tlds: { allow: false } }).required() // tlds: { allow: false } para simplificar, não valida TLDs como .com, .org etc.
        .messages({
            'string.base': `"email" deve ser do tipo texto`,
            'string.empty': `"email" não pode ser vazio`,
            'string.email': `"email" deve ser um email válido`,
            'any.required': `"email" é um campo obrigatório`
        }),
    senha: Joi.string().min(8).max(100).required()
        // Exemplo de regra mais complexa para senha (opcional):
        // .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'))
        .messages({
            'string.base': `"senha" deve ser do tipo texto`,
            'string.empty': `"senha" não pode ser vazia`,
            'string.min': `"senha" deve ter no mínimo {#limit} caracteres`,
            'string.max': `"senha" deve ter no máximo {#limit} caracteres`,
            // 'string.pattern.base': `"senha" deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial`,
            'any.required': `"senha" é um campo obrigatório`
        }),
    perfil: Joi.string().valid('Requisitante', 'Motorista', 'Gestor').required()
        .messages({
            'string.base': `"perfil" deve ser do tipo texto`,
            'any.only': `"perfil" deve ser um dos seguintes valores: {#valids}`,
            'any.required': `"perfil" é um campo obrigatório`
        }),
    setor: Joi.string().trim().min(2).max(100).optional().allow(null, '') // Opcional, permite nulo ou string vazia
        .messages({
            'string.base': `"setor" deve ser do tipo texto`,
            'string.min': `"setor" deve ter no mínimo {#limit} caracteres`,
            'string.max': `"setor" deve ter no máximo {#limit} caracteres`
        })
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email({ tlds: { allow: false } }).required()
        .messages({
            'string.base': `"email" deve ser do tipo texto`,
            'string.empty': `"email" não pode ser vazio`,
            'string.email': `"email" deve ser um email válido`,
            'any.required': `"email" é um campo obrigatório`
        }),
    senha: Joi.string().min(6).max(100)
        .messages({
            'string.base': `"senha" deve ser do tipo texto`,
            'string.empty': `"senha" não pode ser vazia`,
            'string.min': `"senha" deve ter no mínimo {#limit} caracteres`,
            'string.max': `"senha" deve ter no máximo {#limit} caracteres`
        }),
    password: Joi.string().min(6).max(100)
        .messages({
            'string.base': `"password" deve ser do tipo texto`,
            'string.empty': `"password" não pode ser vazia`,
            'string.min': `"password" deve ter no mínimo {#limit} caracteres`,
            'string.max': `"password" deve ter no máximo {#limit} caracteres`
        })
}).or('senha', 'password'); // Pelo menos um dos campos de senha deve estar presente

const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().email({ tlds: { allow: false } }).required()
        .messages({
            'string.base': `"email" deve ser do tipo texto`,
            'string.empty': `"email" não pode ser vazio`,
            'string.email': `"email" deve ser um email válido`,
            'any.required': `"email" é um campo obrigatório`
        })
});

const resetPasswordSchema = Joi.object({
    senha: Joi.string().min(8).max(100).required()
        .messages({
            'string.base': `"senha" deve ser do tipo texto`,
            'string.empty': `"senha" não pode ser vazia`,
            'string.min': `"nova senha" deve ter no mínimo {#limit} caracteres`,
            'string.max': `"nova senha" deve ter no máximo {#limit} caracteres`,
            'any.required': `"senha" é um campo obrigatório`
        }),
    // Opcional: Adicionar confirmação de senha
    // confirmarSenha: Joi.string().required().valid(Joi.ref('senha'))
    //     .messages({
    //         'any.only': 'As senhas não coincidem',
    //         'any.required': 'A confirmação da senha é obrigatória'
    //     })
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};
