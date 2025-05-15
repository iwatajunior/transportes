import React from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom'; // Para v5
import { jwtDecode } from 'jwt-decode';
import { normalizePerfil } from '../../utils/userConstants';

const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error("Erro ao decodificar token:", error);
            localStorage.removeItem('token');
            return null;
        }
    }
    return null;
};

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
    const location = useLocation();
    console.log(`[ProtectedRoute] Verificando rota: ${location.pathname}`);
    const decodedToken = getDecodedToken();

    // 1. Verificar se há token
    if (!decodedToken) {
        console.log(`[ProtectedRoute] Token não encontrado para ${location.pathname}. Redirecionando para /login.`);
        return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
    }

    console.log(`[ProtectedRoute] Token encontrado para ${location.pathname}. Perfil: ${decodedToken.perfil}`);

    // 2. Verificar perfil usando normalizePerfil
    if (!decodedToken.perfil) {
        console.error('[ProtectedRoute] Perfil do usuário não encontrado no token.');
        // Considerar remover token inválido aqui também
        localStorage.removeItem('token'); 
        return <Redirect to={{ pathname: '/login', state: { from: location, error: 'Token inválido' } }} />;
    }
    
    // Normalizar o perfil do usuário
    const userProfile = normalizePerfil(decodedToken.perfil);

    // 3. Verificar permissões
    if (allowedRoles && allowedRoles.length > 0) {
        // Verificar se o perfil do usuário está entre os permitidos (case-insensitive)
        const hasRole = allowedRoles.some(role => 
            role.toLowerCase() === userProfile.toLowerCase()
        );
        
        if (!hasRole) {
            console.warn(`[ProtectedRoute] Acesso negado para rota ${location.pathname}. Perfil do usuário normalizado: ${userProfile} (token original: ${decodedToken.perfil}). Perfis permitidos: ${allowedRoles.join(', ')}`);
            // Redireciona para /login com mensagem de erro
            return <Redirect to={{ pathname: '/login', state: { from: location, error: 'Acesso negado' } }} />;
        }
    }

    // 4. Acesso permitido: Renderiza a rota com o componente
    console.log(`[ProtectedRoute] Acesso permitido para ${location.pathname}. Renderizando componente via Route.`);
    return <Route {...rest} component={Component} />;
};

export default ProtectedRoute;
