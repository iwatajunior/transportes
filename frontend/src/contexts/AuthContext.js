import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { normalizePerfil } from '../utils/userConstants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // Decodifica o token para obter os dados do usuário
                    const decodedToken = decodeToken(token);
                    if (decodedToken) {
                        // Normaliza o perfil usando a função normalizePerfil
                        const normalizedUser = {
                            ...decodedToken,
                            perfil: normalizePerfil(decodedToken.perfil)
                        };
                        setUser(normalizedUser);
                        console.log('Usuário normalizado:', normalizedUser);
                    } else {
                        throw new Error('Token inválido');
                    }
                } catch (error) {
                    console.error('Erro ao carregar usuário:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const decodeToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    };

    const login = async (credentials) => {
        // Primeiro faz o login para obter o token
        const loginResponse = await api.post('/auth/login', credentials);
        const { token, user } = loginResponse.data;
        
        // Salva o token
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Decodifica o token para obter os dados do usuário
        const decodedToken = decodeToken(token);
        console.log('DEBUG - Dados do usuário decodificados do token:', decodedToken);
        
        // Normaliza o perfil usando a função normalizePerfil
        const normalizedUser = {
            ...decodedToken,
            perfil: normalizePerfil(decodedToken.perfil)
        };
        
        // Define o usuário com os dados normalizados
        setUser(normalizedUser);
        console.log('DEBUG - Estado do usuário após setUser:', normalizedUser);
        
        return normalizedUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = '';
        setUser(null);
    };

    if (loading) {
        return null; // ou um componente de loading
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
