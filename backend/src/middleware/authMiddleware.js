const jwt = require('jsonwebtoken');
require('dotenv').config();
const { USER_ROLES, normalizePerfil } = require('../utils/userConstants'); // Para verificação de roles

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in authMiddleware.");
    process.exit(1);
}

const authMiddleware = {
    // Middleware para verificar se o usuário está autenticado
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

        if (token == null) {
            return res.status(401).json({ message: 'Token não fornecido.' }); // Não autorizado
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).json({ message: 'Token expirado.' }); // Proibido (expirado)
                }
                return res.status(403).json({ message: 'Token inválido.' }); // Proibido (inválido)
            }
            req.user = user; // Adiciona os dados do usuário decodificados ao objeto req
            next(); // Passa para o próximo middleware ou rota
        });
    },

    // Middleware para verificar se o usuário tem um dos perfis permitidos
    // ex: authorizeRoles(USER_ROLES.ADMINISTRADOR, USER_ROLES.GESTOR)
    authorizeRoles(...allowedRoles) {
        return (req, res, next) => {
            if (!req.user || !req.user.perfil) {
                return res.status(401).json({ message: 'Usuário não autenticado ou perfil não definido.' });
            }

            // Normalizar o perfil do usuário
            const normalizedUserProfile = normalizePerfil(req.user.perfil);
            console.log(`[authMiddleware.authorizeRoles] Perfil original: ${req.user.perfil}, Perfil normalizado: ${normalizedUserProfile}, Perfis permitidos: ${allowedRoles.join(', ')}`);
            
            // Verificar se o perfil normalizado está entre os permitidos (case-insensitive)
            const hasRole = allowedRoles.some(role => 
                role.toLowerCase() === normalizedUserProfile.toLowerCase()
            );
            
            if (!hasRole) {
                return res.status(403).json({
                    message: `Acesso negado. Você não tem permissão para este recurso. Perfis permitidos: ${allowedRoles.join(', ')}.`
                });
            }
            next();
        };
    },

    // Atalho para verificar se é administrador
    isAdmin(req, res, next) {
        if (!req.user || !req.user.perfil) {
            return res.status(401).json({ message: 'Usuário não autenticado ou perfil não definido.' });
        }

        // Normalizar o perfil do usuário
        const normalizedUserProfile = normalizePerfil(req.user.perfil);
        console.log(`[authMiddleware.isAdmin] Perfil original: ${req.user.perfil}, Perfil normalizado: ${normalizedUserProfile}, Comparando com: ${USER_ROLES.ADMINISTRADOR}`);
        
        // Verificar se o perfil normalizado é Administrador (case-insensitive)
        if (normalizedUserProfile.toLowerCase() !== USER_ROLES.ADMINISTRADOR.toLowerCase()) {
            return res.status(403).json({
                message: `Acesso negado. Você não tem permissão para este recurso. Perfis permitidos: ${USER_ROLES.ADMINISTRADOR}.`
            });
        }
        next();
    }
};

module.exports = authMiddleware;
