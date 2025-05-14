const vehicleModel = require('../models/vehicleModel');
const { vehicleSchema, updateVehicleSchema } = require('../validators/vehicleSchemas');
const userModel = require('../models/userModel'); // Para verificar se o usuário responsável existe

// Criar novo veículo
exports.createVehicle = async (req, res) => {
    console.log('API HINT: Dentro de exports.createVehicle'); // Log 1
    // Validar os dados de entrada
    const { error, value } = vehicleSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: "Erro de validação nos dados do veículo.", details: errorMessages });
    }

    // Desestruturar placa e usuario_responsavel_id aqui APENAS se precisar deles individualmente ANTES do try/catch para alguma lógica específica
    // Geralmente, se 'value' já contém tudo o que vehicleModel.create precisa, não é estritamente necessário desestruturar aqui.
    // const { placa, usuario_responsavel_id } = value; // Removido daqui para evitar confusão se não usado imediatamente

    console.log('API HINT: Dados validados (value):', JSON.stringify(value, null, 2)); // Log 2

    try {
        // É importante que 'value' contenha 'placa' e 'usuario_responsavel_id' para as verificações abaixo.
        // Se 'value' não os contiver diretamente (por exemplo, se a validação os removeu ou aninhou), ajuste aqui.
        const { placa, usuario_responsavel_id } = value; // Desestruturando dentro do try, mais próximo de onde são usados

        // Verificar se a placa já existe
        const existingVehicle = await vehicleModel.findByPlate(placa);
        if (existingVehicle) {
            return res.status(400).json({ message: `A placa ${placa} já está cadastrada.` });
        }

        // Verificar se o usuário responsável existe e está ativo
        // Certifique-se de que usuario_responsavel_id está presente em 'value'
        if (usuario_responsavel_id === undefined || usuario_responsavel_id === null) {
             console.error('API HINT: usuario_responsavel_id não foi fornecido ou é nulo em "value" antes da checagem do usuário.');
             // Decide se isso é um erro ou se é opcional. Pelo schema, parece ser obrigatório.
             return res.status(400).json({ message: 'ID do usuário responsável não fornecido.' });
        }
        const responsibleUser = await userModel.findById(usuario_responsavel_id);
        if (!responsibleUser) {
            return res.status(400).json({ message: `Usuário responsável com ID ${usuario_responsavel_id} não encontrado.` });
        }
        if (!responsibleUser.ativo) {
            return res.status(400).json({ message: `Usuário responsável com ID ${usuario_responsavel_id} está inativo.` });
        }

        console.log('API HINT: Antes de chamar vehicleModel.create com value:', JSON.stringify(value, null, 2)); // Log 3 (mostrando 'value' completo)
        const newVehicle = await vehicleModel.create(value); // 'value' deve conter todos os campos validados
        res.status(201).json({ message: 'Veículo cadastrado com sucesso!', vehicle: newVehicle });
    } catch (err) {
        console.error('Erro ao criar veículo:', err);
        // Tratar outros erros específicos do banco se necessário (ex: FK constraint)
        // A desestruturação de usuario_responsavel_id aqui pode falhar se err ocorreu antes de value ser definido
        // Vamos garantir que ele venha do 'value' que foi validado
        const validated_usuario_id = value && value.usuario_responsavel_id ? value.usuario_responsavel_id : 'ID não disponível (erro antes da validação completa)';

        if (err.code === '23503' && err.constraint && err.constraint.includes('veiculos_usuario_responsavel_id_fkey')) {
             return res.status(400).json({ message: `Usuário responsável com ID ${validated_usuario_id} não encontrado ou inválido (referência de chave estrangeira falhou).` });
        }
        res.status(500).json({ message: 'Erro interno no servidor ao tentar cadastrar veículo.' });
    }
};

// Listar todos os veículos
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await vehicleModel.findAll();
        // Sempre retorna 200, com a lista de veículos (pode estar vazia)
        res.status(200).json({ vehicles: vehicles || [] });
    } catch (err) {
        console.error('Erro ao buscar veículos:', err);
        res.status(500).json({ message: 'Erro interno no servidor ao tentar buscar veículos.', error: err.message });
    }
};

// Buscar veículo por ID
exports.getVehicleById = async (req, res) => {
    const { id } = req.params;
    try {
        const vehicle = await vehicleModel.findById(parseInt(id, 10));
        if (!vehicle) {
            return res.status(404).json({ message: `Veículo com ID ${id} não encontrado.` });
        }
        res.status(200).json(vehicle);
    } catch (err) {
        console.error(`Erro ao buscar veículo por ID (${id}):`, err);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// Atualizar veículo
exports.updateVehicle = async (req, res) => {
    const { id } = req.params;
    const vehicleId = parseInt(id, 10);

    // Validar os dados de entrada
    const { error, value } = updateVehicleSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: "Erro de validação nos dados de atualização do veículo.", details: errorMessages });
    }
    
    if (Object.keys(value).length === 0) {
        return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
    }

    // Desestruturar placa e usuario_responsavel_id do 'value' validado
    const { placa, usuario_responsavel_id } = value;

    try {
        // Verificar se o veículo a ser atualizado existe
        const currentVehicle = await vehicleModel.findById(vehicleId);
        if (!currentVehicle) {
            return res.status(404).json({ message: `Veículo com ID ${vehicleId} não encontrado para atualização.` });
        }

        // Se a placa está sendo alterada, verificar se a nova placa já existe em outro veículo
        if (placa && placa !== currentVehicle.placa) {
            const existingVehicleWithNewPlate = await vehicleModel.findByPlate(placa);
            if (existingVehicleWithNewPlate && existingVehicleWithNewPlate.veiculo_id !== vehicleId) {
                return res.status(400).json({ message: `A placa ${placa} já está cadastrada em outro veículo.` });
            }
        }
        
        // Se o usuário responsável está sendo alterado, verificar se ele existe e está ativo
        // Certifique-se que usuario_responsavel_id existe em 'value' se for fornecido
        if (value.hasOwnProperty('usuario_responsavel_id')) { // Checa se a chave existe, mesmo que o valor seja null/undefined
            if (usuario_responsavel_id !== null && usuario_responsavel_id !== undefined && usuario_responsavel_id !== currentVehicle.usuario_responsavel_id) {
                 const responsibleUser = await userModel.findById(usuario_responsavel_id);
                if (!responsibleUser) {
                    return res.status(400).json({ message: `Novo usuário responsável com ID ${usuario_responsavel_id} não encontrado.` });
                }
                if (!responsibleUser.ativo) {
                    return res.status(400).json({ message: `Novo usuário responsável com ID ${usuario_responsavel_id} está inativo.` });
                }
            } else if ((usuario_responsavel_id === null || usuario_responsavel_id === undefined) && currentVehicle.usuario_responsavel_id !== null) {
                // Caso esteja tentando definir usuario_responsavel_id como null/undefined,
                // o schema de validação deve permitir isso (Joi.number().allow(null))
                // Se o banco não permite null, isso causará um erro no BD.
            }
        }


        const updatedVehicle = await vehicleModel.update(vehicleId, value);
        if (!updatedVehicle) { 
             return res.status(404).json({ message: `Veículo com ID ${vehicleId} não pôde ser atualizado ou não foi encontrado.` });
        }
        res.status(200).json({ message: 'Veículo atualizado com sucesso!', vehicle: updatedVehicle });
    } catch (err) {
        console.error(`Erro ao atualizar veículo (${vehicleId}):`, err);
        // Usa o usuario_responsavel_id do 'value' que foi validado, se disponível
        const validated_usuario_id_update = value && value.usuario_responsavel_id ? value.usuario_responsavel_id : 'ID não disponível';
         if (err.code === '23503' && err.constraint && err.constraint.includes('veiculos_usuario_responsavel_id_fkey')) {
             return res.status(400).json({ message: `Usuário responsável com ID ${validated_usuario_id_update} não encontrado (referência inválida).` });
        }
        res.status(500).json({ message: 'Erro interno no servidor ao tentar atualizar veículo.' });
    }
};

// Desativar veículo (Soft Delete)
exports.deleteVehicle = async (req, res) => {
    const { id } = req.params;
    const vehicleId = parseInt(id, 10);
    try {
        const vehicleToDeactivate = await vehicleModel.findById(vehicleId);
        if (!vehicleToDeactivate) {
            return res.status(404).json({ message: `Veículo com ID ${vehicleId} não encontrado para desativação.` });
        }
        // Não permitir desativar um veículo que já está 'Inativo'
        if (vehicleToDeactivate.status === 'Inativo') { // Correção: status em vez de status_veiculo
            return res.status(400).json({ message: `Veículo com ID ${vehicleId} já está inativo.`});
        }

        const deactivatedVehicle = await vehicleModel.deactivate(vehicleId);
         if (!deactivatedVehicle) { 
            return res.status(404).json({ message: `Veículo com ID ${vehicleId} não pôde ser desativado.` });
        }
        res.status(200).json({ message: `Veículo com ID ${vehicleId} desativado com sucesso.`, vehicle: deactivatedVehicle });
    } catch (err) {
        console.error(`Erro ao desativar veículo (${id}):`, err);
        res.status(500).json({ message: 'Erro interno no servidor ao tentar desativar veículo.' });
    }
};

// Futuramente: exports.hardDeleteVehicle para remoção física, se necessário e permitido.

// Buscar veículos disponíveis (Status 'Disponível' ou 'Em Uso')
exports.getAvailableVehicles = async (req, res) => {
    try {
        const availableVehicles = await vehicleModel.findAvailableVehicles();
        res.status(200).json({ vehicles: availableVehicles || [] });
    } catch (err) {
        console.error('Erro ao buscar veículos disponíveis:', err);
        res.status(500).json({ message: 'Erro interno no servidor ao buscar veículos disponíveis.', error: err.message });
    }
};