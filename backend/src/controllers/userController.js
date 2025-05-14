const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { createUserSchema, loginUserSchema, updateUserSchema } = require('../validators/userSchemas'); 
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1); // Sai se o JWT_SECRET não estiver configurado
}

const userController = {
    async register(req, res) {
        try {
            // Validar os dados da requisição com o schema do Joi
            const validatedData = await createUserSchema.validateAsync(req.body, {
                abortEarly: false, // Retorna todos os erros de uma vez
                // stripUnknown: true // Remove campos não definidos no schema (cuidado se precisar deles)
            });

            // Verificar se o email já existe
            const existingUser = await userModel.findByEmail(validatedData.email);
            if (existingUser) {
                return res.status(409).json({ message: 'Este email já está cadastrado.' });
            }

            // Hash da senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(validatedData.senha, salt);

            // Preparar dados para o modelo (removendo confirmarSenha se existisse no body, Joi já validou)
            const userDataToSave = {
                nome: validatedData.nome,
                email: validatedData.email,
                senha: hashedPassword, // Enviar a senha hasheada
                perfil: validatedData.perfil,
                setor: validatedData.setor // Joi garante que é opcional ou string
            };

            const newUser = await userModel.create(userDataToSave);

            // Não retornar a senha, mesmo hasheada, na resposta
            const { senha, ...userWithoutPassword } = newUser;

            res.status(201).json({
                message: 'Usuário registrado com sucesso!',
                user: userWithoutPassword
            });

        } catch (error) {
            if (error.isJoi) {
                // Erros de validação do Joi
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));
                return res.status(400).json({ message: "Erro de validação.", errors });
            }
            console.error('Erro no controller ao registrar usuário:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
        }
    },

    async login(req, res) {
        try {
            const validatedData = await loginUserSchema.validateAsync(req.body, { abortEarly: false });

            const user = await userModel.findByEmail(validatedData.email);
            if (!user) {
                return res.status(401).json({ message: 'Credenciais inválidas. (Usuário não encontrado)' });
            }

            const isMatch = await bcrypt.compare(validatedData.senha, user.senha);
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciais inválidas. (Senha incorreta)' });
            }

            if (!user.ativo) { // Verifica se o usuário está ativo
                return res.status(403).json({ message: 'Usuário inativo. Contate o administrador.' });
            }


            const tokenPayload = {
                userId: user.userid, // Note que no banco é UserID, em JS é comum camelCase
                email: user.email,
                perfil: user.perfil
            };

            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora

            // Não retornar a senha na resposta
            const { senha, ...userWithoutPassword } = user;

            // Log antes de enviar a resposta
            console.log(`[Login Success] Enviando token para usuário ID: ${user.userid}, Email: ${user.email}, Perfil: ${user.perfil}`);

            res.status(200).json({
                message: 'Login bem-sucedido!',
                token,
                user: userWithoutPassword
            });

        } catch (error) {
            if (error.isJoi) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));
                return res.status(400).json({ message: "Erro de validação.", errors });
            }
            console.error('Erro no controller ao fazer login:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login.' });
        }
    },

    async getAllUsers(req, res) {
        try {
            const users = await userModel.getAll();
            res.status(200).json(users);
        } catch (error) {
            console.error('Erro no controller ao buscar todos os usuários:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar usuários.' });
        }
    },

    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            console.log('[userController.getUserById] Buscando usuário:', userId);
            const user = await userModel.findById(userId);
            console.log('[userController.getUserById] Usuário encontrado:', user);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
            // A senha já é omitida por userModel.findById
            res.status(200).json(user);
        } catch (error) {
            console.error(`Erro no controller ao buscar usuário por ID (${req.params.userId}):`, error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar perfil.' });
        }
    },

    async updateCurrentUserProfile(req, res) {
        console.log('[updateCurrentUserProfile] Iniciando atualização de perfil');
        console.log('[updateCurrentUserProfile] Headers:', req.headers);
        console.log('[updateCurrentUserProfile] Body:', req.body);
        console.log('[updateCurrentUserProfile] File:', req.file);

        const userId = req.user.userId;
        const { senha } = req.body;
        const foto = req.file;

        console.log('[updateCurrentUserProfile] UserId:', userId);
        console.log('[updateCurrentUserProfile] Senha fornecida:', !!senha);
        console.log('[updateCurrentUserProfile] Foto fornecida:', !!foto);

        // Se não houver senha nem foto, retorna erro
        if ((!senha || senha.trim() === '') && !foto) {
            console.log('[updateCurrentUserProfile] Nenhuma alteração solicitada');
            return res.status(400).json({ message: 'Nenhuma alteração solicitada. Forneça uma nova senha ou foto.' });
        }

        const updateData = {};

        try {
            // Processar senha se fornecida
            if (senha && senha.trim() !== '') {
                if (senha.length < 6) {
                    return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
                }
                const salt = await bcrypt.genSalt(10);
                updateData.senha = await bcrypt.hash(senha, salt);
            }

            // Processar foto se fornecida
            if (foto) {
                console.log('[updateCurrentUserProfile] Arquivo recebido:', {
                    filename: foto.filename,
                    path: foto.path,
                    mimetype: foto.mimetype,
                    size: foto.size
                });
                
                // O multer já salvou o arquivo, apenas precisamos atualizar o caminho no banco
                // Não incluir /uploads/ no início pois o frontend já adiciona
                updateData.fotoperfilurl = foto.filename;
            }

            const updatedUser = await userModel.updateSelfProfile(userId, updateData);

            if (!updatedUser) {
                return res.status(404).json({ message: 'Usuário não encontrado ou nenhuma alteração realizada.' });
            }

            // Não retornar a senha na resposta
            const { senha: _, ...userWithoutPassword } = updatedUser;

            res.status(200).json({
                message: 'Perfil atualizado com sucesso!',
                user: userWithoutPassword
            });

        } catch (error) {
            console.error(`Erro no controller ao atualizar perfil do usuário ${userId}:`, error);
            res.status(500).json({ message: 'Erro interno do servidor ao tentar atualizar o perfil.' });
        }
    },

    async updateUser(req, res) {
        console.log("[userController.updateUser] req.body ANTES da validação:", JSON.stringify(req.body, null, 2));
        console.log("[userController.updateUser] req.file ANTES da validação:", req.file);

        const { userId } = req.params;
        // Com multer, os campos de texto estão em req.body e o arquivo (se houver) em req.file
        const textFields = req.body;
        const imageFile = req.file;

        try {
            // Validar os dados de texto de entrada (req.body)
            const { error, value: validatedTextData } = updateUserSchema.validate(textFields, { abortEarly: false, stripUnknown: true });
            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));
                return res.status(400).json({ message: "Erro de validação.", errors });
            }

            // Se a senha for fornecida e não estiver vazia, hasheá-la
            if (validatedTextData.senha) {
                validatedTextData.senha = await bcrypt.hash(validatedTextData.senha, 10);
            } else {
                delete validatedTextData.senha; // Remove o campo senha se estiver vazio
            }

            // Adicionar o caminho/nome do arquivo da imagem aos dados a serem atualizados, se um arquivo foi enviado
            if (imageFile) {
                console.log("[userController] Entrou no bloco if (imageFile).");
                const fileName = `${Date.now()}-${imageFile.originalname.replace(/\s+/g, '_')}`;
                console.log(`[userController] Nome do arquivo gerado: ${fileName}`);
                const uploadsDir = path.join(__dirname, '..', 'uploads');
                console.log(`[userController] Diretório de uploads calculado: ${uploadsDir}`);
                const filePath = path.join(uploadsDir, fileName);
                console.log(`[userController] Caminho completo do arquivo calculado: ${filePath}`);

                try {
                    console.log("[userController] Entrando no bloco try para salvar imagem.");
                    if (!fs.existsSync(uploadsDir)) {
                        console.log(`[userController] Diretório ${uploadsDir} não existe. Tentando criar...`);
                        fs.mkdirSync(uploadsDir, { recursive: true });
                        console.log(`[userController] Diretório ${uploadsDir} criado com sucesso.`);
                    } else {
                        console.log(`[userController] Diretório ${uploadsDir} já existe.`);
                    }
                    
                    console.log(`[userController] Tentando salvar arquivo em: ${filePath}`);
                    fs.writeFileSync(filePath, imageFile.buffer);
                    console.log(`[userController] Imagem salva com sucesso em: ${filePath}`);
                    // Usar o caminho relativo para as fotos
                    validatedTextData.fotoperfilurl = `/uploads/${fileName}`; 
                    console.log(`[userController] fotoUrl para o banco definida como: ${validatedTextData.fotoperfilurl}`);
                } catch (saveError) {
                    console.error("[userController] CAPTUROU ERRO AO SALVAR IMAGEM:", saveError);
                }
            } else if (textFields.removerFoto === 'true') {
                // Se o frontend enviar um campo específico para indicar a remoção da foto
                validatedTextData.fotoperfilurl = null; // ou string vazia, dependendo do modelo
                console.log("[userController] Solicitação para remover foto.");
            } else {
                // Se nenhuma imagem foi enviada e não há pedido para remover,
                // não alteramos fotoUrl, para manter a foto existente (se houver).
                // O updateUserSchema deveria lidar com fotoUrl sendo opcional.
                // Se fotoUrl estiver nos textFields e for undefined/null e não houver imageFile,
                // significa que o campo foi enviado vazio, talvez para limpar.
                // A lógica exata de como limpar/manter depende do schema e do modelo.
                // Se o campo fotoUrl não estiver no schema de validação obrigatório, pode ser omitido.
                if (textFields.fotoperfilurl === undefined && !imageFile) {
                     delete validatedTextData.fotoperfilurl; // Não tenta atualizar se não veio novo e não é pra remover
                }
            }

            // Verificar se há dados para atualizar (após processar senha e foto)
            if (Object.keys(validatedTextData).length === 0 && !imageFile) {
                // Se removerFoto foi o único campo e já tratado, ou se nada mudou.
                if (!(textFields.removerFoto === 'true' && Object.keys(validatedTextData).length === 1 && validatedTextData.fotoperfilurl === null)) {
                    return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
                }
            }

            // Verificar se o email (se alterado e fornecido) já existe para outro usuário
            if (validatedTextData.email) {
                const existingUserByEmail = await userModel.findByEmail(validatedTextData.email);
                if (existingUserByEmail && existingUserByEmail.userid !== parseInt(userId, 10)) {
                    return res.status(409).json({ message: 'Este email já está em uso por outro usuário.' });
                }
            }

            // Se não houver dados válidos para atualizar (ex: apenas campos vazios ou inalterados)
            // e nenhuma imagem nova ou instrução para remover foto.
            if (Object.keys(validatedTextData).length === 0 && !imageFile && !(textFields.removerFoto === 'true')) {
                 // Adicionamos uma verificação mais robusta para "Nenhum dado fornecido" acima.
                 // Se chegou aqui e validatedTextData está vazio, mas havia um imageFile ou removerFoto, está ok.
                 // Se não, e validatedTextData está vazio, então realmente não há o que fazer.
                 // Esta condição pode precisar de ajuste fino dependendo de como updateUserSchema lida com campos opcionais
                 // e como o modelo userModel.update reage a um objeto de dados vazio.
                 // Por segurança, se validatedTextData estiver vazio e não for para alterar foto, retorne.
                if (!imageFile && !(textFields.removerFoto === 'true')) {
                    return res.status(400).json({ message: "Nenhum dado válido fornecido para atualização após a validação." });
                }
            }

            const finalUpdatedUser = await userModel.update(userId, validatedTextData);

            if (!finalUpdatedUser) {
                // Isso pode acontecer se o usuário não existir ou se os dados fornecidos não resultarem em alteração no banco
                return res.status(404).json({ message: 'Usuário não encontrado ou nenhuma alteração efetivada no banco de dados.' });
            }

            res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: finalUpdatedUser });

        } catch (error) {
            // Tratamento de erro específico para email duplicado vindo do model
            if (error.message && error.message.includes('endereço de e-mail fornecido já está em uso')) {
                return res.status(409).json({ message: error.message });
            }
            console.error(`Erro no controller ao atualizar usuário ${userId}:`, error);
            res.status(500).json({ message: 'Erro interno do servidor ao tentar atualizar o usuário.' });
        }
    },

    // Exemplo de uma rota protegida que poderia buscar o perfil do usuário logado
    async getProfile(req, res) {
        // req.user é populado pelo middleware de autenticação (authMiddleware.js - a ser criado)
        if (!req.user || !req.user.userId) {
             return res.status(401).json({ message: 'Não autorizado ou token inválido.' });
        }
        try {
            const user = await userModel.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
            const { senha, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            console.error(`Erro no controller ao buscar perfil do usuário ${req.user.userId}:`, error);
            res.status(500).json({ message: 'Erro interno ao buscar perfil.' });
        }
    },
    /**
     * Busca todos os usuários ativos com perfil de Motorista.
     * Acessível por Gestor/Admin (via middleware de rota).
     */
    async getDrivers(req, res) {
        try {
            const drivers = await userModel.findDrivers(); // Chama a função do model
            res.status(200).json(drivers); // Retorna a lista de motoristas (id, nome)
        } catch (error) {
            console.error('Erro no controller ao buscar motoristas:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar motoristas.' });
        }
    }
};

module.exports = userController;
