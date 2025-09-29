import React from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom'; // Para v5
import { useAuth } from '../../contexts/AuthContext';
import { normalizePerfil } from '../../utils/userConstants';

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
    const location = useLocation();
    const { user } = useAuth();

    // 1) Verifica existência de token no storage para considerar sessão
    const token = localStorage.getItem('token');
    if (!token) {
        return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
    }

    // 2) Obtém perfil de forma robusta a partir do usuário do contexto
    const rawPerfil = user?.perfil || user?.role || user?.userRole || user?.perfil_usuario || user?.profile;
    const userProfile = normalizePerfil(rawPerfil);

    // 3) Checa papéis permitidos, se fornecidos
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRole = allowedRoles.some(role => role.toLowerCase() === userProfile.toLowerCase());
        if (!hasRole) {
            return <Redirect to={{ pathname: '/login', state: { from: location, error: 'Acesso negado' } }} />;
        }
    }

    // 4) Renderiza a rota
    return <Route {...rest} component={Component} />;
};

export default ProtectedRoute;
