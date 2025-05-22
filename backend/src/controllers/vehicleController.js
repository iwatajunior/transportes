const vehicleModel = require('../models/vehicleModel');
const { vehicleSchema, updateVehicleSchema } = require('../validators/vehicleSchemas');
const userModel = require('../models/userModel'); // Para verificar se o usuário responsável existe

// Criar novo veículo
exports.createVehicle = async (req, res) => {
    console.log('API HINT: Dentro de exports.createVehicle');
    console.log('API HINT: Dados recebidos:', JSON.stringify(req.body, null, 2));
    console.log('API HINT: Usuário logado:', JSON.stringify(req.user, null, 2));
    
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Adicionar o ID do usuário logado como usuário responsável
    const vehicleData = {
        ...req.body,
        usuario_responsavel_id: req.user.userId
    };

    console.log('API HINT: Dados do veículo com usuário:', JSON.stringify(vehicleData, null, 2));

    // Validar os dados de entrada
    const { error, value } = vehicleSchema.validate(vehicleData, { abortEarly: false, stripUnknown: true });
    if (error) {
        console.log('API HINT: Erro de validação:', JSON.stringify(error.details, null, 2));
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: "Erro de validação nos dados do veículo.", details: errorMessages });
    }

    console.log('API HINT: Dados validados (value):', JSON.stringify(value, null, 2));

    try {
        const { placa } = value;

        // Verificar se a placa já existe
        const existingVehicle = await vehicleModel.findByPlate(placa);
        if (existingVehicle) {
            return res.status(400).json({ message: `A placa ${placa} já está cadastrada.` });
        }

        // Verificar se o usuário responsável existe e está ativo
        const responsibleUser = await userModel.findById(req.user.userId);
        if (!responsibleUser) {
            return res.status(400).json({ message: `Usuário responsável não encontrado.` });
        }
        if (!responsibleUser.ativo) {
            return res.status(400).json({ message: `Usuário responsável está inativo.` });
        }

        console.log('API HINT: Antes de chamar vehicleModel.create com value:', JSON.stringify(value, null, 2));
        const newVehicle = await vehicleModel.create(value);
        res.status(201).json({ message: 'Veículo cadastrado com sucesso!', vehicle: newVehicle });
    } catch (err) {
        console.error('Erro ao criar veículo:', err);
        if (err.code === '23503' && err.constraint && err.constraint.includes('veiculos_usuario_responsavel_id_fkey')) {
            return res.status(400).json({ message: `Erro ao associar usuário responsável ao veículo.` });
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