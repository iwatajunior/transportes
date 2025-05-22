// C:\Users\Senac\CascadeProjects\TRANSPORTES\backend\src\controllers\authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Adicionado para gerar token
const userModel = require('../models/userModel');
const loginAttemptModel = require('../models/loginAttemptModel');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/authSchemas'); // Adicionado forgotPasswordSchema e resetPasswordSchema
const { sendPasswordResetEmail } = require('../utils/emailService');

// Registrar novo usuário
exports.registerUser = async (req, res) => {
    // Validar os dados de entrada
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        // Mapeia os detalhes do erro para uma lista de mensagens
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: "Erro de validação nos dados fornecidos.", details: errorMessages });
    }

    // Usar 'value' que contém os dados validados e possivelmente transformados (ex: trim)
    const { nome, email, senha, perfil, setor } = value;

    try {
        // Verificar se o usuário já existe (pelo email)
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Este email já está cadastrado.' });
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        // Criar novo usuário no banco
        const newUser = await userModel.create({
            nome,
            email,
            senha: hashedPassword, // Salvar a senha com hash
            perfil,
            setor: setor || null // Garante que setor seja null se não fornecido e validado como opcional
        });

        // Remover a senha do objeto de usuário antes de enviar a resposta
        const userResponse = { ...newUser };
        delete userResponse.senha; // Não expor o hash da senha

        res.status(201).json({ message: 'Usuário registrado com sucesso!', user: userResponse });

    } catch (err) {
        console.error('Erro no registro do usuário:', err);
        // Verifica se o erro é de violação de constraint única (ex: email)
        if (err.code === '23505') { // Código de erro do PostgreSQL para unique_violation
            // Tenta identificar qual constraint foi violada (pode ser mais complexo dependendo do driver/ORM)
            // Para o email, já verificamos acima, mas pode haver outras constraints únicas.
            if (err.constraint && err.constraint.includes('email')) {
                 return res.status(400).json({ message: 'Este email já está cadastrado (conflito no banco).' });
            }
            return res.status(400).json({ message: 'Erro de duplicidade de dados no banco.' });
        }
        return res.status(500).json({ message: 'Erro interno no servidor ao tentar registrar usuário.' });
    }
};

// Login do usuário
exports.loginUser = async (req, res) => {
    console.log('!!!! AUTHCONTROLLER: CHEGOU NO INÍCIO DA FUNÇÃO loginUser !!!!');
    console.log('DEBUG - Dados recebidos no login:', req.body);
    
    // Validar os dados de entrada
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        console.log('DEBUG - Erro de validação:', error.details);
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: "Erro de validação nos dados fornecidos.", details: errorMessages });
    }

    const { email, senha, password } = req.body;
    const senhaToUse = senha || password;

    try {
        // Verificar se o usuário existe
        const user = await userModel.findByEmail(email);
        
        // Preparar dados da tentativa de login
        const attemptData = {
            userid: user ? user.userid : null,
            email: email,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            status: false,
            motivo: null
        };

        if (!user) {
            attemptData.motivo = 'Usuário não encontrado';
            try {
                await loginAttemptModel.create(attemptData);
            } catch (error) {
                console.error('Erro ao registrar tentativa de login:', error);
                // Não bloqueia o fluxo em caso de erro ao registrar a tentativa
            }
            return res.status(400).json({ message: 'Credenciais inválidas. Sua tentativa de acesso foi registrada!' });
        }

        // Verificar se o usuário está ativo
        if (!user.ativo) {
            attemptData.motivo = 'Usuário inativo';
            try {
                await loginAttemptModel.create(attemptData);
            } catch (error) {
                console.error('Erro ao registrar tentativa de login:', error);
                // Não bloqueia o fluxo em caso de erro ao registrar a tentativa
            }
            return res.status(403).json({ message: 'Usuário inativo. Contate o administrador.' });
        }

        // Verificar se o usuário está com status ativo
        if (!user.status) {
            attemptData.motivo = 'Usuário bloqueado';
            try {
                await loginAttemptModel.create(attemptData);
            } catch (error) {
                console.error('Erro ao registrar tentativa de login:', error);
                // Não bloqueia o fluxo em caso de erro ao registrar a tentativa
            }
            return res.status(403).json({ message: 'Usuário bloqueado. Sua tentativa foi registrada!' });
        }

        // Verificar senha
            const isMatch = await bcrypt.compare(senhaToUse, user.senha);

            if (!isMatch) {
            attemptData.motivo = 'Senha incorreta';
            try {
                await loginAttemptModel.create(attemptData);
            } catch (error) {
                console.error('Erro ao registrar tentativa de login:', error);
                // Não bloqueia o fluxo em caso de erro ao registrar a tentativa
            }
                return res.status(400).json({ message: 'Credenciais inválidas (senha incorreta).' });
            }

        // Login bem-sucedido
        attemptData.status = true;
        try {
            await loginAttemptModel.create(attemptData);
        } catch (error) {
            console.error('Erro ao registrar tentativa de login:', error);
            // Não bloqueia o fluxo em caso de erro ao registrar a tentativa
        }

        // Gerar token JWT
            const payload = {
                userId: user.userid,
                email: user.email,
            perfil: user.perfil.toLowerCase(),
                nome: user.nome,
                fotoperfilurl: user.fotoperfilurl
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            
            const { senha: removedPassword, ...userWithoutPassword } = user;

            return res.status(200).json({
                message: 'Login bem-sucedido!',
                token,
                user: userWithoutPassword
            });

    } catch (err) {
        console.error('[AUTH CONTROLLER] Erro principal no loginUser:', err);
        if (err.isJoi) {
            const errorMessages = err.details.map(detail => detail.message);
            return res.status(400).json({ message: "Erro de validação nos dados fornecidos.", details: errorMessages });
        }
        return res.status(500).json({ 
            message: err.message || 'Erro interno no servidor ao tentar fazer login.',
            errorStack: err.stack 
        });
    }
};

// Solicitar redefinição de senha
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validação básica do email
        if (!email) {
            return res.status(400).json({ message: 'Email é obrigatório' });
        }

        // Busca o usuário pelo email
        const user = await userModel.findByEmail(email);
        
        // Se o usuário existir e estiver ativo, gera o token de redefinição
        if (user && user.ativo) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

            // Salva o token no banco de dados
            await userModel.setResetPasswordToken(user.userid, resetToken, resetTokenExpires);

            // Envia o email com o link de redefinição
            try {
                await sendPasswordResetEmail(email, resetToken);
            } catch (emailError) {
                console.error('Erro ao enviar email de redefinição:', emailError);
                // Não retorna erro para o cliente para não revelar se o email existe
            }
        }

        // Sempre retorna sucesso para não revelar se o email existe
        res.json({ 
            message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.' 
        });
    } catch (error) {
        console.error('Erro ao processar solicitação de redefinição de senha:', error);
        res.status(500).json({ message: 'Erro ao processar solicitação de redefinição de senha' });
    }
};

// Redefinir senha
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { senha } = req.body;

        // Validação básica da senha
        if (!senha || senha.length < 8) {
            return res.status(400).json({ message: 'A senha deve ter pelo menos 8 caracteres' });
        }

        // Busca o usuário pelo token
        const user = await userModel.findByResetPasswordToken(token);

        // Verifica se o token é válido e não expirou
        if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Atualiza a senha e limpa os campos de redefinição
        await userModel.updatePassword(user.userid, hashedPassword);
        await userModel.clearResetPasswordToken(user.userid);

        res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro ao redefinir senha' });
    }
};

// Obter perfil do usuário logado
exports.getUserProfile = async (req, res) => {
    // O middleware authenticateToken já popula req.user com os dados do usuário (payload do token)
    // E também já verificou se o usuário existe e está ativo ao buscar no userModel.
    // Precisamos buscar do banco para ter todos os dados atualizados, não apenas o que está no token.
    try {
        const user = await userModel.findById(req.user.userId); // req.user.userId vem do token
        if (!user) {
            // Isso não deveria acontecer se o token é válido e o usuário não foi deletado desde a emissão do token
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Remove a senha antes de enviar
        const userProfile = { ...user };
        delete userProfile.senha;

        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno ao buscar perfil do usuário.' });
    }
};
