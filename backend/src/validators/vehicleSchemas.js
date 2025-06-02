const Joi = require('joi');

// Enum para status_veiculo (espelhando o ENUM do SQL)
const statusVeiculoEnum = ['Disponivel', 'EmManutencao', 'Indisponivel'];

// Enum para tipo_veiculo (espelhando o ENUM do SQL)
const tipoVeiculoEnum = ['Carro', 'Van', 'Ônibus', 'Moto'];

const vehicleSchema = Joi.object({
    placa: Joi.string().trim().uppercase().pattern(/^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/).required().messages({
        'string.base': 'Placa deve ser uma string.',
        'string.empty': 'Placa não pode ser vazia.',
        'string.pattern.base': 'Placa deve estar no formato AAA-1234 ou AAA1B34.',
        'any.required': 'Placa é um campo obrigatório.'
    }),
    marca: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'Marca deve ser uma string.',
        'string.empty': 'Marca não pode ser vazia.',
        'string.min': 'Marca deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Marca deve ter no máximo {#limit} caracteres.',
        'any.required': 'Marca é um campo obrigatório.'
    }),
    modelo: Joi.string().trim().min(1).max(50).required().messages({
        'string.base': 'Modelo deve ser uma string.',
        'string.empty': 'Modelo não pode ser vazio.',
        'string.min': 'Modelo deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Modelo deve ter no máximo {#limit} caracteres.',
        'any.required': 'Modelo é um campo obrigatório.'
    }),
    ano: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required().messages({
        'number.base': 'Ano de fabricação deve ser um número.',
        'number.integer': 'Ano de fabricação deve ser um número inteiro.',
        'number.min': 'Ano de fabricação deve ser no mínimo 1900.',
        'number.max': `Ano de fabricação não pode ser maior que ${new Date().getFullYear() + 1}.`,
        'any.required': 'Ano de fabricação é obrigatório.'
    }),
    tipo_uso: Joi.string().valid('Carga', 'Passeio', 'Misto').optional().messages({
        'any.only': 'Tipo de uso deve ser Carga, Passeio ou Misto.'
    }),
    capacidade: Joi.number().integer().min(1).max(100).required().messages({
        'number.base': 'Capacidade deve ser um número.',
        'number.integer': 'Capacidade deve ser um número inteiro.',
        'number.min': 'Capacidade deve ser no mínimo {#limit}.',
        'number.max': 'Capacidade deve ser no máximo {#limit}.',
        'any.required': 'Capacidade é um campo obrigatório.'
    }),
    tipo: Joi.string().valid(...tipoVeiculoEnum).required().messages({
        'string.base': 'Tipo deve ser uma string.',
        'any.only': `Tipo deve ser um dos seguintes valores: [${tipoVeiculoEnum.join(', ')}]`,
        'any.required': 'Tipo é um campo obrigatório.'
    }),
    status: Joi.string().valid(...statusVeiculoEnum).default('Disponível').optional().messages({
        'string.base': 'Status deve ser uma string.',
        'any.only': `Status deve ser um dos seguintes valores: [${statusVeiculoEnum.join(', ')}]`
    }),
    quilometragematual: Joi.number().integer().min(0).required().messages({
        'number.base': 'Quilometragem atual deve ser um número.',
        'number.integer': 'Quilometragem atual deve ser um número inteiro.',
        'number.min': 'Quilometragem atual não pode ser negativa.',
        'any.required': 'Quilometragem atual é um campo obrigatório.'
    }),
    ultimamanutencao: Joi.date().iso().allow(null).optional().messages({ // Formato YYYY-MM-DD
        'date.base': 'Data da última manutenção deve ser uma data válida.',
        'date.format': 'Data da última manutenção deve estar no formato ISO (YYYY-MM-DD).'
    }),
    dataproximarevisao: Joi.date().iso().allow(null).optional().min(Joi.ref('ultimamanutencao')).messages({ // Garante que a próxima revisão seja após a última
        'date.base': 'Data da próxima revisão deve ser uma data válida.',
        'date.format': 'Data da próxima revisão deve estar no formato ISO (YYYY-MM-DD).',
        'date.min': 'Data da próxima revisão deve ser posterior à data da última manutenção.'
    }),
    observacoes: Joi.string().trim().allow('', null).max(500).optional().messages({
        'string.base': 'Observações deve ser uma string.',
        'string.max': 'Observações deve ter no máximo {#limit} caracteres.'
    }),
    usuario_responsavel_id: Joi.number().integer().min(1).required().messages({
        'number.base': 'ID do usuário responsável deve ser um número.',
        'number.integer': 'ID do usuário responsável deve ser um número inteiro.',
        'number.min': 'ID do usuário responsável deve ser no mínimo {#limit}.',
        'any.required': 'ID do usuário responsável é um campo obrigatório.'
    })
});

// Esquema para atualização pode ser mais flexível, permitindo que nem todos os campos sejam enviados.
// No entanto, os campos enviados ainda devem seguir as regras de validação.
// Para simplificar, podemos usar o mesmo schema para POST e PUT,
// e o controller pode lidar com quais campos são atualizáveis.
// Se precisarmos de regras diferentes para PUT (ex: alguns campos não podem ser alterados após a criação),
// podemos criar um updateVehicleSchema específico.
// Por ora, vamos usar o mesmo para consistência.
const updateVehicleSchema = vehicleSchema.fork(
    // Lista de campos que são obrigatórios no schema base, mas opcionais na atualização
    ['placa', 'marca', 'modelo', 'ano', 'capacidade', 'tipo', 'quilometragematual', 'usuario_responsavel_id'],
    (schema) => schema.optional()
).min(1); // Exige que pelo menos um campo seja enviado para atualização // Exige que pelo menos um campo seja enviado para atualização

module.exports = {
    vehicleSchema, // Para criar (POST)
    updateVehicleSchema // Para atualizar (PUT)
};
