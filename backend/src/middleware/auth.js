const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Middleware para autenticar o token JWT
exports.authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido.' });
        }

        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar o usuário no banco para garantir que ainda existe e está ativo
        const user = await userModel.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        if (!user.ativo) {
            return res.status(403).json({ message: 'Usuário inativo.' });
        }

        if (!user.status) {
            return res.status(403).json({ message: 'Usuário bloqueado.' });
        }

        // Adicionar o usuário ao objeto request
        req.user = {
            userId: user.userid,
            email: user.email,
            perfil: user.perfil,
            nome: user.nome
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado.' });
        }
        console.error('Erro na autenticação:', error);
        return res.status(500).json({ message: 'Erro interno na autenticação.' });
    }
};

// Middleware para verificar se o usuário é administrador
exports.isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (req.user.perfil.toLowerCase() !== 'gestor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas gestores podem acessar este recurso.' });
    }

    next();
}; 