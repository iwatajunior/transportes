const routeModel = require('../models/routeModel');

const routeController = {
    /**
     * Cria uma nova rota.
     * @param {object} req - Request object.
     * @param {object} res - Response object.
     */
    async createRoute(req, res) {
        try {
            const {
                identificacao,
                cidadeOrigem,
                cidadeDestino,
                cidadesIntermediariasIda,
                cidadesIntermediariasVolta,
                dataSaida,
                dataRetorno
            } = req.body;

            // Validações básicas
            if (!identificacao || !cidadeOrigem || !cidadeDestino || !dataSaida || !dataRetorno) {
                return res.status(400).json({
                    message: 'Todos os campos obrigatórios devem ser preenchidos'
                });
            }

            // Validar se a data de retorno é posterior à data de saída
            if (new Date(dataRetorno) <= new Date(dataSaida)) {
                return res.status(400).json({
                    message: 'A data de retorno deve ser posterior à data de saída'
                });
            }

            // Criar a rota no banco de dados
            const rota = await routeModel.create({
                identificacao,
                cidadeOrigem,
                cidadeDestino,
                cidadesIntermediariasIda: cidadesIntermediariasIda || [],
                cidadesIntermediariasVolta: cidadesIntermediariasVolta || [],
                dataSaida,
                dataRetorno
            });

            res.status(201).json({
                message: 'Rota cadastrada com sucesso',
                rota
            });
        } catch (error) {
            console.error('Erro ao cadastrar rota:', error);
            res.status(500).json({
                message: 'Erro ao cadastrar rota',
                error: error.message
            });
        }
    },

    /**
     * Lista todas as rotas.
     * @param {object} req - Request object.
     * @param {object} res - Response object.
     */
    async listRoutes(req, res) {
        try {
            // Se for uma requisição da home, retorna apenas rotas ativas
            const isHomeRequest = req.query.home === 'true';
            const rotas = await routeModel.findAll(isHomeRequest);
            res.json(rotas);
        } catch (error) {
            console.error('Erro ao listar rotas:', error);
            res.status(500).json({
                message: 'Erro ao listar rotas',
                error: error.message
            });
        }
    },

    /**
     * Busca uma rota específica pelo ID.
     * @param {object} req - Request object.
     * @param {object} res - Response object.
     */
    async getRouteById(req, res) {
        try {
            const { id } = req.params;
            const rota = await routeModel.findById(id);

            if (!rota) {
                return res.status(404).json({
                    message: 'Rota não encontrada'
                });
            }

            res.json(rota);
        } catch (error) {
            console.error('Erro ao buscar rota:', error);
            res.status(500).json({
                message: 'Erro ao buscar rota',
                error: error.message
            });
        }
    },

    async updateRoute(req, res) {
        const { id } = req.params;
        const { 
            identificacao, 
            cidade_origem, 
            cidade_destino, 
            data_saida, 
            data_retorno,
            cidades_intermediarias_ida,
            cidades_intermediarias_volta,
            status
        } = req.body;

        try {
            // Verifica se a rota existe
            const existingRoute = await routeModel.findById(id);
            if (!existingRoute) {
                return res.status(404).json({ error: 'Rota não encontrada' });
            }

            // Se estiver atualizando apenas o status
            if (Object.keys(req.body).length === 1 && status !== undefined) {
                if (!['ativo', 'inativo'].includes(status)) {
                    return res.status(400).json({ error: 'Status inválido. Deve ser "ativo" ou "inativo"' });
                }
                
                const updatedRoute = await routeModel.update(id, {
                    ...existingRoute,
                    status
                });
                
                return res.json(updatedRoute);
            }

            // Validação para atualização completa
            if (!identificacao || !cidade_origem || !cidade_destino || !data_saida || !data_retorno) {
                return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
            }

            // Atualiza a rota
            const updatedRoute = await routeModel.update(id, {
                identificacao,
                cidade_origem,
                cidade_destino,
                data_saida,
                data_retorno,
                cidades_intermediarias_ida: cidades_intermediarias_ida || [],
                cidades_intermediarias_volta: cidades_intermediarias_volta || [],
                status: status || existingRoute.status
            });

            res.json(updatedRoute);
        } catch (error) {
            console.error('Erro ao atualizar rota:', error);
            res.status(500).json({ error: 'Erro ao atualizar rota' });
        }
    }
};

module.exports = routeController; 