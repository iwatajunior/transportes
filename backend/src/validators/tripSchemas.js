const Joi = require('joi');

// ATENÇÃO: Estes devem ser os mesmos valores do ENUM 'status_viagem_enum' no seu banco de dados.
// Se você usou os valores simplificados ('Em_Andamento', 'Concluida') no DB, mantenha-os aqui.
// Se conseguiu usar acentos no DB, atualize os valores neste array para corresponder.
const statusViagemEnum = ['Pendente', 'Aprovada', 'Agendada', 'Andamento', 'Concluida', 'Cancelada', 'Recusada'];

// Novo ENUM para tipo de veículo desejado
const tipoVeiculoEnum = ['Passeio', 'Carga', 'Misto'];

const createTripSchema = Joi.object({
    data_saida: Joi.date().iso().required().messages({
        'date.base': 'Data de saída deve ser uma data válida.',
        'date.format': 'Data de saída deve estar no formato ISO (YYYY-MM-DD).',
        'any.required': 'Data de saída é obrigatória.'
    }),
    horario_saida: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
        'string.base': 'Horário de saída deve ser um texto.',
        'string.pattern.base': 'Horário de saída deve estar no formato HH:MM (ex: 14:30).',
        'any.required': 'Horário de saída é obrigatório.'
    }),
    data_retorno_prevista: Joi.date().iso().required().min(Joi.ref('data_saida')).messages({
        'date.base': 'Data de retorno prevista deve ser uma data válida.',
        'date.format': 'Data de retorno prevista deve estar no formato ISO (YYYY-MM-DD).',
        'date.min': 'Data de retorno prevista não pode ser anterior à data de saída.',
        'any.required': 'Data de retorno prevista é obrigatória.'
    }),
    horario_retorno_previsto: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
        'string.base': 'Horário de retorno previsto deve ser um texto.',
        'string.pattern.base': 'Horário de retorno previsto deve estar no formato HH:MM (ex: 17:00).',
        'any.required': 'Horário de retorno previsto é obrigatório.'
    }),
    destino_completo: Joi.string().trim().min(5).max(255).required().messages({
        'string.base': 'Destino deve ser um texto.',
        'string.empty': 'Destino não pode ser vazio.',
        'string.min': 'Destino deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Destino deve ter no máximo {#limit} caracteres.',
        'any.required': 'Destino é obrigatório.'
    }),
    finalidade: Joi.string().trim().min(5).max(500).required().messages({
        'string.base': 'Finalidade deve ser um texto.',
        'string.empty': 'Finalidade não pode ser vazia.',
        'string.min': 'Finalidade deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Finalidade deve ter no máximo {#limit} caracteres.',
        'any.required': 'Finalidade é obrigatória.'
    }),
    quantidade_passageiros: Joi.number().integer().min(1).max(100).required().messages({ // Ajuste o max se necessário
        'number.base': 'Quantidade de passageiros deve ser um número.',
        'number.integer': 'Quantidade de passageiros deve ser um número inteiro.',
        'number.min': 'Quantidade de passageiros deve ser no mínimo {#limit}.',
        'number.max': 'Quantidade de passageiros deve ser no máximo {#limit}.',
        'any.required': 'Quantidade de passageiros é obrigatória.'
    }),
    tipo_veiculo_desejado: Joi.string().valid(...tipoVeiculoEnum).required().messages({
        'string.base': 'Tipo de veículo desejado deve ser um texto.',
        'any.only': `Tipo de veículo desejado deve ser um dos seguintes: ${tipoVeiculoEnum.join(', ')}.`,
        'any.required': 'Tipo de veículo desejado é obrigatório.'
    }),
    // veiculo_solicitado_id foi removido da criação pelo requisitante
    solicitante_usuarioid: Joi.number().integer().min(1).required().messages({ // Mantido, pois o controller o injeta
         'number.base': 'ID do solicitante deve ser um número.',
         'number.integer': 'ID do solicitante deve ser um número inteiro.',
         'number.min': 'ID do solicitante deve ser no mínimo {#limit}.',
         'any.required': 'ID do solicitante é obrigatório (geralmente definido pelo sistema).'
    }),
    observacoes: Joi.string().trim().max(1000).optional().allow('', null).messages({
        'string.base': 'Observações devem ser um texto.',
        'string.max': 'Observações devem ter no máximo {#limit} caracteres.'
    })
});

const updateTripSchema = Joi.object({
    data_saida: Joi.date().iso().optional(),
    horario_saida: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    data_retorno_prevista: Joi.date().iso().optional().min(Joi.ref('data_saida')),
    horario_retorno_previsto: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    data_retorno_efetiva: Joi.date().iso().optional().allow(null),
    horario_retorno_efetivo: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().allow(null),
    destino_completo: Joi.string().trim().min(5).max(255).optional(),
    finalidade: Joi.string().trim().min(5).max(500).optional(),
    quantidade_passageiros: Joi.number().integer().min(1).max(100).optional(),
    tipo_veiculo_desejado: Joi.string().valid(...tipoVeiculoEnum).optional(),
    veiculo_solicitado_id: Joi.number().integer().min(1).optional().allow(null), // Mantido para gestor
    veiculo_alocado_id: Joi.number().integer().min(1).optional().allow(null),
    motorista_usuarioid: Joi.number().integer().min(1).optional().allow(null),
    status_viagem: Joi.string().valid(...statusViagemEnum).optional(),
    observacoes: Joi.string().trim().max(1000).optional().allow('', null)
}).min(1).messages({ // Exige que pelo menos um campo seja enviado para atualização
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização.'
});

module.exports = {
    createTripSchema,
    updateTripSchema,
    statusViagemEnum,
    tipoVeiculoEnum // Exportar novo enum
};
