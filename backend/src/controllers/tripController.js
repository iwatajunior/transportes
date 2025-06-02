const { checkVehicleConflict, checkDriverConflict, ...tripModel } = require('../models/tripModel');
const { createTripSchema, updateTripSchema } = require('../validators/tripSchemas');

const tripController = {
    /**
     * Cria uma nova viagem.
     * O ID do solicitante é pego do usuário autenticado.
     */
    async createTrip(req, res) {
        try {
            // O ID do usuário autenticado deve ser anexado ao objeto req pelo middleware de autenticação
            // Payload do token contém: { userId: user.userid, email: user.email, perfil: user.perfil }
           if (!req.user || !req.user.userId) { // Correção: espera 'userId' com 'I' maiúsculo
                return res.status(401).json({ message: 'Usuário não autenticado ou ID do usuário não encontrado no token.' });
            }
            const solicitante_usuarioid = req.user.userId; // Correção

            const tripData = { ...req.body, solicitante_usuarioid };

            const { error, value } = createTripSchema.validate(tripData);
            if (error) {
                // A primeira mensagem de erro é geralmente a mais relevante.
                return res.status(400).json({ message: 'Erro de validação.', details: error.details[0].message });
            }

            const newTrip = await tripModel.create(value);
            res.status(201).json({ message: 'Viagem registrada com sucesso!', trip: newTrip });
        } catch (error) {
            console.error('Erro no controller ao criar viagem:', error);
            if (error.message && error.message.includes('Nenhum campo válido')) { // Exemplo de erro específico do model
                 return res.status(400).json({ message: error.message });
            }
            // Verifica erros de constraint do PostgreSQL (ex: FK não encontrada)
            if (error.code && (error.code === '23503' || error.code === '23502')) { // foreign_key_violation or not_null_violation
                 return res.status(400).json({ message: 'Erro ao registrar viagem: Verifique os dados fornecidos (ex: ID de veículo inexistente ou campos obrigatórios ausentes).', details: error.detail || error.message });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao registrar viagem.' });
        }
    },

    /**
     * Obtém uma viagem pelo ID.
     */
    async getTripById(req, res) {
        try {
            console.log('DEBUG - getTripById - ID recebido:', req.params.id);
            console.log('DEBUG - getTripById - User:', req.user);
            
            const { id } = req.params;
            const trip = await tripModel.findById(Number(id));
            
            console.log('DEBUG - getTripById - Viagem encontrada:', trip);
            
            if (!trip) {
                console.log('DEBUG - getTripById - Viagem não encontrada');
                return res.status(404).json({ message: 'Viagem não encontrada.' });
            }
            res.status(200).json(trip);
        } catch (error) {
            console.error('Erro no controller ao buscar viagem por ID:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar viagem.' });
        }
    },

    /**
     * Obtém todas as viagens.
     * TODO: Implementar filtros (por usuário, status, data) e paginação.
     * TODO: Considerar quais informações de usuários e veículos devem ser juntadas aqui.
     */
    async getAllTrips(req, res) {
        try {
            const userData = {
                userId: req.user.userId, // ou req.user.userid dependendo da consistência do seu token/authMiddleware
                perfil: req.user.perfil
            };

            // Validação básica para garantir que os dados do usuário estão presentes
            if (!userData.userId || !userData.perfil) {
                console.error('userId ou perfil não encontrado em req.user em getAllTrips');
                return res.status(401).json({ message: 'Informações de autenticação incompletas.' });
            }
        
            const trips = await tripModel.findAll(userData);
            res.status(200).json(trips);
        } catch (error) {
            console.error('Erro no controller ao buscar todas as viagens:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar viagens.' });
        }
    },

    /**
     * Atualiza uma viagem existente.
     * TODO: Definir regras de permissão (ex: admin pode mudar tudo, solicitante só pode cancelar ou alterar alguns campos antes de 'Pendente' ou 'Agendada').
     */
    async updateTrip(req, res) {
        try {
            const { id } = req.params;
            const tripData = req.body;

            const { error, value } = updateTripSchema.validate(tripData);
            if (error) {
                return res.status(400).json({ message: 'Erro de validação.', details: error.details[0].message });
            }

            // Verificar se a viagem existe antes de tentar atualizar
            const existingTrip = await tripModel.findById(Number(id));
            if (!existingTrip) {
                return res.status(404).json({ message: 'Viagem não encontrada para atualização.' });
            }

            // Lógica de permissão (exemplo básico):
            // if (req.user.perfil !== 'gestor' && existingTrip.solicitante_usuarioid !== req.user.userid) {
            //     return res.status(403).json({ message: 'Você não tem permissão para atualizar esta viagem.' });
            // }
            // if (req.user.perfil !== 'gestor' && existingTrip.status_viagem !== 'Pendente') {
            //     return res.status(403).json({ message: 'Viagens não pendentes não podem ser alteradas pelo solicitante.' });
            // }

            const updatedTrip = await tripModel.update(Number(id), value);
            if (!updatedTrip) { // O model.update pode retornar null se o ID não for encontrado na query de update
                return res.status(404).json({ message: 'Viagem não encontrada após tentativa de atualização.' });
            }
            res.status(200).json({ message: 'Viagem atualizada com sucesso!', trip: updatedTrip });
        } catch (error) {
            console.error('Erro no controller ao atualizar viagem:', error);
            if (error.message && error.message.includes('Nenhum campo válido')) {
                 return res.status(400).json({ message: error.message });
            }
            if (error.code && (error.code === '23503' || error.code === '23502')) { // foreign_key_violation or not_null_violation
                 return res.status(400).json({ message: 'Erro ao atualizar viagem: Verifique os dados fornecidos (ex: ID de veículo/usuário inexistente).', details: error.detail || error.message });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar viagem.' });
        }
    },

    /**
     * Deleta uma viagem.
     * TODO: Definir regras de permissão (ex: admin pode deletar, solicitante só se 'Pendente').
     *       Considerar se é um delete físico ou lógico (mudar status para 'Cancelada').
     *       O model atual faz delete físico.
     */
    async deleteTrip(req, res) {
        try {
            const { id } = req.params;

            // Verificar se a viagem existe antes de tentar deletar
            const existingTrip = await tripModel.findById(Number(id));
            if (!existingTrip) {
                return res.status(404).json({ message: 'Viagem não encontrada para exclusão.' });
            }

            // Lógica de permissão (exemplo básico):
            // if (req.user.perfil !== 'gestor' && existingTrip.solicitante_usuarioid !== req.user.userid) {
            //     return res.status(403).json({ message: 'Você não tem permissão para excluir esta viagem.' });
            // }
            // if (req.user.perfil !== 'gestor' && existingTrip.status_viagem !== 'Pendente') {
            //    return res.status(403).json({ message: 'Apenas viagens pendentes podem ser excluídas pelo solicitante.' });
            // }


            const deletedTrip = await tripModel.deleteById(Number(id));
            // O model.deleteById retorna o item deletado ou null se não encontrado.
            // Já verificamos a existência acima, então aqui esperamos que funcione.
            if (!deletedTrip) {
                 // Isso não deveria acontecer se a verificação anterior passou, mas é uma salvaguarda.
                return res.status(404).json({ message: 'Viagem não encontrada durante a exclusão.' });
            }
            res.status(200).json({ message: 'Viagem excluída com sucesso!', trip: deletedTrip });
            // Se fosse um soft delete, seria res.status(200).json({ message: 'Viagem cancelada com sucesso!' });
        } catch (error) {
            console.error('Erro no controller ao deletar viagem:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao deletar viagem.' });
        }
    },

    /**
     * Aloca um veículo e um motorista a uma viagem específica.
     * Acessível apenas por Gestor e Administrador (via middleware de rota).
     */
    async allocateTripResources(req, res) {
        try {
            const { id } = req.params; // ID da viagem
            const { vehicleId, driverId } = req.body; // IDs do veículo e motorista a serem alocados

            const tripId = Number(id);
            const veiculo_alocado_id = vehicleId ? Number(vehicleId) : null;
            const motorista_usuarioid = driverId ? Number(driverId) : null;

            // Validação básica dos IDs recebidos
            if (isNaN(tripId) || (vehicleId && isNaN(veiculo_alocado_id)) || (driverId && isNaN(motorista_usuarioid))) {
                return res.status(400).json({ message: 'IDs inválidos fornecidos para viagem, veículo ou motorista.' });
            }
            
            // Verificar se a viagem existe antes de tentar alocar
            const existingTrip = await tripModel.findById(tripId);
            if (!existingTrip) {
                return res.status(404).json({ message: 'Viagem não encontrada para alocação.' });
            }

            // TODO: Adicionar validação extra se necessário:
            // - Verificar se o veículo e o motorista existem e estão disponíveis/ativos?
            // - Verificar o status da viagem (ex: só alocar se 'Pendente' ou 'Agendada')?
            // if (!['Pendente', 'Agendada'].includes(existingTrip.status_viagem)) {
            //     return res.status(400).json({ message: `Não é possível alocar recursos para uma viagem com status '${existingTrip.status_viagem}'.` });
            // }

            // *** VERIFICAÇÃO DE CONFLITOS ***
            // Corrige a criação das datas, extraindo YYYY-MM-DD da data completa
            const startDateString = existingTrip.data_saida.toISOString ? existingTrip.data_saida.toISOString().split('T')[0] : existingTrip.data_saida.split('T')[0];
            const endDateString = existingTrip.data_retorno_prevista.toISOString ? existingTrip.data_retorno_prevista.toISOString().split('T')[0] : existingTrip.data_retorno_prevista.split('T')[0];

            const startTime = new Date(`${startDateString}T${existingTrip.horario_saida}`);
            const endTime = new Date(`${endDateString}T${existingTrip.horario_retorno_previsto}`);
            // Adiciona verificação se as datas são válidas antes de logar/usar
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                console.error(`[Erro Conflito Trip ${tripId}] Datas inválidas calculadas:`, { startDateString, endDateString, horario_saida: existingTrip.horario_saida, horario_retorno_previsto: existingTrip.horario_retorno_previsto });
                return res.status(500).json({ message: 'Erro interno ao processar datas da viagem para verificação de conflito.' });
            }


            // Verifica conflito do Veículo (se um ID de veículo for fornecido)
            if (veiculo_alocado_id) {

                const vehicleConflict = await checkVehicleConflict(veiculo_alocado_id, startTime, endTime, tripId);

                if (vehicleConflict) {
                    return res.status(409).json({ 
                        message: `Conflito de agendamento: O veículo (ID: ${veiculo_alocado_id}) já está alocado em outra viagem neste período.` 
                    });
                }
            }

            // Verifica conflito do Motorista (se um ID de motorista for fornecido)
            if (motorista_usuarioid) {

                const driverConflict = await checkDriverConflict(motorista_usuarioid, startTime, endTime, tripId);

                if (driverConflict) {
                    return res.status(409).json({ 
                        message: `Conflito de agendamento: O motorista (ID: ${motorista_usuarioid}) já está alocado em outra viagem neste período.` 
                    });
                }
            }
            // *** FIM VERIFICAÇÃO DE CONFLITOS ***

            // Chama a função no modelo para atualizar o banco de dados
            const updatedTrip = await tripModel.allocateResources(tripId, veiculo_alocado_id, motorista_usuarioid);

            if (!updatedTrip) {
                return res.status(404).json({ message: 'Falha ao alocar recursos. Viagem não encontrada ou não atualizada.' });
            }

            res.status(200).json({ message: 'Recursos alocados com sucesso!', trip: updatedTrip });

        } catch (error) {
            console.error('Erro no controller ao alocar recursos para viagem:', error);
             // Verifica erros de constraint do PostgreSQL (ex: FK não encontrada para veículo/motorista)
            if (error.code && error.code === '23503') { // foreign_key_violation
                 return res.status(400).json({ message: 'Erro ao alocar recursos: Verifique se o veículo e o motorista selecionados existem e estão ativos.', details: error.detail || error.message });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao alocar recursos.' });
        }
    },

    /**
     * Atualiza o status de uma viagem específica.
     * Acessível apenas por Gestor e Administrador.
     */
    async updateTripStatus(req, res) {
        try {
            const { id } = req.params;
            const { status: newStatus } = req.body;

            // Validação do perfil do usuário (assumindo que req.user é preenchido pelo authMiddleware)
            const userPerfil = (req.user?.perfil || '').toLowerCase();
            if (!req.user || (userPerfil !== 'gestor' && userPerfil !== 'administrador')) {
                return res.status(403).json({ message: 'Acesso negado. Somente gestores ou administradores podem alterar o status da viagem.' });
            }

            const tripId = Number(id);
            if (isNaN(tripId)) {
                return res.status(400).json({ message: 'ID da viagem inválido.' });
            }

            const allowedStatus = ["Pendente", "Agendada", "Andamento", "Concluida", "Cancelada"];
            if (!newStatus || !allowedStatus.includes(newStatus)) {
                return res.status(400).json({ message: `Status inválido. Status permitidos: ${allowedStatus.join(', ')}.` });
            }

            const existingTrip = await tripModel.findById(tripId);
            if (!existingTrip) {
                return res.status(404).json({ message: 'Viagem não encontrada.' });
            }

            // Regras de transição de status (exemplo)
            // if (existingTrip.status_viagem === "Concluída" && newStatus !== "Concluída") {
            //     return res.status(400).json({ message: 'Viagens concluídas não podem ter seu status alterado.' });
            // }
            // if (existingTrip.status_viagem === "Cancelada" && newStatus !== "Cancelada") {
            //     return res.status(400).json({ message: 'Viagens canceladas não podem ter seu status alterado.' });
            // }

            const updatedTrip = await tripModel.updateStatus(tripId, newStatus);
            if (!updatedTrip) {
                return res.status(404).json({ message: 'Falha ao atualizar o status da viagem. Viagem não encontrada após a tentativa.' });
            }

            res.status(200).json({ message: `Status da viagem atualizado para ${newStatus} com sucesso!`, trip: updatedTrip });

        } catch (error) {
            console.error('Erro no controller ao atualizar status da viagem:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar status da viagem.' });
        }
    },

    /**
     * Registra a quilometragem inicial de uma viagem.
     * Acessível apenas pelo motorista alocado à viagem.
     */
    async recordStartKm(req, res) {
        try {
            const { id } = req.params;
            const { km_inicial } = req.body;
            const userId = req.user?.userId;
            const tripId = Number(id);

            if (isNaN(tripId)) {
                return res.status(400).json({ message: 'ID da viagem inválido.' });
            }

            if (km_inicial === undefined || km_inicial === null || typeof km_inicial !== 'number' || km_inicial < 0) {
                return res.status(400).json({ message: 'Quilometragem inicial inválida ou não fornecida. Deve ser um número não negativo.' });
            }

            const existingTrip = await tripModel.findById(tripId);

            if (!existingTrip) {
                return res.status(404).json({ message: 'Viagem não encontrada.' });
            }

            if (!existingTrip.motorista_usuarioid) {
                return res.status(400).json({ message: 'Nenhum motorista alocado a esta viagem ainda.' });
            }

            if (existingTrip.motorista_usuarioid !== userId) {
                return res.status(403).json({ message: 'Acesso negado. Apenas o motorista alocado pode registrar a KM inicial.' });
            }

            if (existingTrip.km_inicial !== null) {
                return res.status(400).json({ message: 'KM inicial já registrada para esta viagem.' });
            }
            
            // Opcional: Verificar status (ex: não permitir se "Concluída" ou "Cancelada")
            // if (['Concluída', 'Cancelada'].includes(existingTrip.status_viagem)) {
            //     return res.status(400).json({ message: `Não é possível registrar KM inicial para viagem com status ${existingTrip.status_viagem}.` });
            // }

            const updatedTrip = await tripModel.updateKm(tripId, { km_inicial });

            if (!updatedTrip) {
                // Isso pode acontecer se a viagem for deletada entre o findById e o updateKm
                return res.status(404).json({ message: 'Falha ao registrar KM inicial. Viagem não encontrada durante a atualização.' });
            }

            res.status(200).json({ message: 'KM inicial registrada com sucesso!', trip: updatedTrip });

        } catch (error) {
            console.error('Erro no controller ao registrar KM inicial:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao registrar KM inicial.' });
        } // Fechamento do catch
    }, // Fechamento de recordStartKm e vírgula
    async recordEndKm(req, res) {
        try {
            const { id } = req.params;
            const { km_final } = req.body;
            const userId = req.user.userId; 
            const tripId = Number(id);

            if (km_final === undefined || isNaN(Number(km_final)) || Number(km_final) < 0) {
                return res.status(400).json({ message: 'Quilometragem final inválida ou não fornecida.' });
            }

            const existingTrip = await tripModel.findById(tripId);
            if (!existingTrip) {
                return res.status(404).json({ message: 'Viagem não encontrada.' });
            }

            if (existingTrip.motorista_usuarioid !== userId) {
                return res.status(403).json({ message: 'Apenas o motorista alocado pode registrar a quilometragem final.' });
            }
            
            if (existingTrip.km_inicial === null) {
                return res.status(400).json({ message: 'Quilometragem inicial deve ser registrada antes da final.' });
            }

            if (existingTrip.km_final !== null) {
                return res.status(400).json({ message: 'Quilometragem final já registrada para esta viagem.' });
            }

            if (Number(km_final) < existingTrip.km_inicial) {
                return res.status(400).json({ message: 'Quilometragem final não pode ser menor que a inicial.' });
            }

             if (!['Em Andamento', 'Concluída'].includes(existingTrip.status_viagem)) {
                return res.status(400).json({ message: 'A quilometragem final só pode ser registrada para viagens em andamento ou concluídas.' });
            }

            const updatedTrip = await tripModel.updateKm(tripId, { km_final: Number(km_final) });
            if (!updatedTrip) {
                return res.status(500).json({ message: 'Erro ao atualizar a quilometragem final no modelo.' });
            }

            res.status(200).json({ 
                message: 'Quilometragem final registrada com sucesso!', 
                trip: updatedTrip 
            });
        } catch (error) {
            console.error('Erro no controller ao registrar KM final:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao registrar quilometragem final.' });
        }
    },

    /**
     * Gerencia (registra/edita) a quilometragem inicial de uma viagem por um Gestor/Admin.
     */
    async manageStartKm(req, res) {
        try {
            const { id } = req.params; 
            const { km_inicial } = req.body;
            const tripId = Number(id);

            if (km_inicial === undefined || isNaN(Number(km_inicial)) || Number(km_inicial) < 0) {
                return res.status(400).json({ message: 'Quilometragem inicial inválida ou não fornecida.' });
            }

            const existingTrip = await tripModel.findById(tripId);
            if (!existingTrip) {
                return res.status(404).json({ message: 'Viagem não encontrada.' });
            }
            
            const updatedTrip = await tripModel.updateKm(tripId, { km_inicial: Number(km_inicial) });
            if (!updatedTrip) {
                return res.status(500).json({ message: 'Erro ao atualizar a quilometragem inicial no modelo.' });
            }

            res.status(200).json({
                message: "Quilometragem inicial gerenciada com sucesso!",
                trip: updatedTrip
            });

        } catch (error) {
            console.error('Erro no controller ao gerenciar KM inicial:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao gerenciar quilometragem inicial.' });
        }
    },

    /**
     * Gerencia (registra/edita) a quilometragem final de uma viagem por um Gestor/Admin.
     */
    async manageEndKm(req, res) {
        try {
            const { id } = req.params;
            const { km_final } = req.body;
            const tripId = Number(id);

            if (km_final === undefined || isNaN(Number(km_final)) || Number(km_final) < 0) {
                return res.status(400).json({ message: 'Quilometragem final inválida ou não fornecida.' });
            }

            const existingTrip = await tripModel.findById(tripId);
            if (!existingTrip) {
                return res.status(404).json({ message: 'Viagem não encontrada.' });
            }
            
            if (existingTrip.km_inicial === null) {
                return res.status(400).json({ message: 'Quilometragem inicial deve ser registrada antes da final.' });
            }

            if (Number(km_final) < existingTrip.km_inicial) {
                return res.status(400).json({ message: 'Quilometragem final não pode ser menor que a inicial.' });
            }

            const updatedTrip = await tripModel.updateKm(tripId, { km_final: Number(km_final) });
            if (!updatedTrip) {
                return res.status(500).json({ message: 'Erro ao atualizar a quilometragem final no modelo.' });
            }

            res.status(200).json({ 
                message: 'Quilometragem final gerenciada com sucesso!', 
                trip: updatedTrip 
            });
        } catch (error) {
            console.error('Erro no controller ao gerenciar KM final:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao gerenciar quilometragem final.' });
        }
    }
};

module.exports = tripController;
