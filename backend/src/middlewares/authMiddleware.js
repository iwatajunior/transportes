const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado.' });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Token inválido.' });
            }
            return res.status(403).json({ message: 'Falha na autenticação do token.' });
        }
        req.user = user; // Adiciona os dados do usuário (payload do token) ao objeto req
        next();
    });
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.perfil) {
            return res.status(403).json({ message: 'Perfil do usuário não encontrado no token. Acesso negado.' });
        }

        const userRole = req.user.perfil.toLowerCase(); // Converte para minúsculas
        const allowedRolesLower = allowedRoles.map(role => role.toLowerCase()); // Converte permitidos para minúsculas

        // Log para depuração
        console.log(`[AuthMiddleware] Verificando permissão: User Role='${userRole}', Allowed Roles='${allowedRolesLower.join(', ')}'`);

        if (!allowedRolesLower.includes(userRole)) {
            return res.status(403).json({ 
                message: `Acesso negado. Seu perfil '${req.user.perfil}' não tem permissão para acessar este recurso. Perfis permitidos: ${allowedRoles.join(', ')}.` 
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
