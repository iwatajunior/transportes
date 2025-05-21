// C:\Users\Senac\CascadeProjects\TRANSPORTES\backend\src\controllers\authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Adicionado para gerar token
const userModel = require('../models/userModel');
const loginAttemptModel = require('../models/loginAttemptModel');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/authSchemas'); // Adicionado forgotPasswordSchema e resetPasswordSchema

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
            return res.status(400).json({ message: 'Credenciais inválidas (usuário não encontrado).' });
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
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Email inválido ou não fornecido.", details: error.details.map(d => d.message) });
    }
    const { email } = value;

    try {
        const user = await userModel.findByEmail(email);

        // Importante: Não revelar se o email existe ou não no sistema por segurança.
        // Envie uma resposta de sucesso mesmo que o email não seja encontrado ou usuário inativo.
        // O email só será enviado se o usuário for encontrado e ativo.
        if (user && user.ativo) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const passwordResetExpires = new Date(Date.now() + 3600000); // Token expira em 1 hora

            await userModel.setResetPasswordToken(user.userid, resetToken, passwordResetExpires);

            // Em um ambiente de produção, aqui você enviaria um email
            // Por agora, vamos logar o link no console
            const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
            console.log('Link para redefinição de senha (simulado):', resetUrl);
            // Para o frontend, seria algo como: `https://seusite.com/reset-password/${resetToken}`
        }

        res.status(200).json({ message: 'Se um usuário com este email existir e estiver ativo, um link de redefinição de senha será enviado.' });

    } catch (err) {
        console.error('Erro em forgotPassword:', err);
        // Não envie detalhes do erro para o cliente em produção por segurança
        res.status(500).json({ message: 'Erro interno no servidor ao tentar processar a solicitação de redefinição de senha.' });
    }
};

// Redefinir a senha
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Dados inválidos para redefinição de senha.", details: error.details.map(d => d.message) });
    }
    const { senha } = value;

    try {
        const user = await userModel.findByResetPasswordToken(token);

        if (!user) {
            return res.status(400).json({ message: 'Token de redefinição de senha inválido, expirado ou usuário inativo.' });
        }

        // Hashear a nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        // Atualizar a senha e limpar o token de redefinição
        // A função update do userModel precisa ser capaz de setar campos para null.
        const fieldsToUpdate = {
            senha: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null
        };

        const updatedUser = await userModel.update(user.userid, fieldsToUpdate);

        if (!updatedUser) {
             // Isso seria inesperado se o userModel.update retornar null mesmo com sucesso (se não retornar o usuário)
             // ou se a atualização falhar por algum motivo não capturado antes.
            console.error('Falha ao atualizar usuário após redefinição de senha, usuário não retornado por userModel.update');
            return res.status(500).json({ message: 'Erro ao finalizar a redefinição da senha.'});
        }

        // Logar o usuário ou apenas enviar mensagem de sucesso
        // Por simplicidade, apenas enviamos uma mensagem de sucesso.
        // Se quisesse logar o usuário, geraria um novo JWT token aqui.

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (err) {
        console.error('Erro em resetPassword:', err);
        res.status(500).json({ message: 'Erro interno no servidor ao tentar redefinir a senha.' });
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
