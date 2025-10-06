import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { connectChatSocket, disconnectChatSocket } from '../services/chatSocket';
import { normalizePerfil } from '../utils/userConstants';

const AuthContext = createContext(null);
const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 hour

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(() => {
        const ts = parseInt(localStorage.getItem('lastActivity') || '0', 10);
        return Number.isFinite(ts) ? ts : 0;
    });

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
                        // Inicializa atividade
                        const now = Date.now();
                        localStorage.setItem('lastActivity', String(now));
                        setLastActivity(now);
                        // Conectar socket com auth atual
                        try { connectChatSocket(); } catch {}
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
        const onAuthUpdated = () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const decodedToken = decodeToken(token);
                if (decodedToken) {
                    const normalizedUser = {
                        ...decodedToken,
                        perfil: normalizePerfil(decodedToken.perfil)
                    };
                    setUser(normalizedUser);
                }
            } catch (e) {
                console.error('[AuthContext] onAuthUpdated decode error', e);
            }
        };
        window.addEventListener('auth-token-updated', onAuthUpdated);
        // Atualiza o contexto quando o perfil for alterado (ex.: nova foto)
        const onProfileUpdated = async () => {
            try {
                const resp = await api.get('/auth/profile');
                const profile = resp?.data || {};
                // Atualiza apenas campos relevantes e normaliza perfil
                setUser((prev) => ({
                    ...(prev || {}),
                    ...profile,
                    perfil: normalizePerfil(profile.perfil || (prev?.perfil || ''))
                }));
            } catch (e) {
                console.error('[AuthContext] onProfileUpdated error', e);
            }
        };
        window.addEventListener('auth-profile-updated', onProfileUpdated);
        return () => window.removeEventListener('auth-token-updated', onAuthUpdated);
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
        const now = Date.now();
        localStorage.setItem('lastActivity', String(now));
        setLastActivity(now);
        try { connectChatSocket(); } catch {}
        
        return normalizedUser;
    };

    const logout = () => {
        try { disconnectChatSocket(); } catch {}
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = '';
        setUser(null);
    };

    // Atualiza lastActivity em eventos de interação e verifica inatividade
    useEffect(() => {
        const markActive = () => {
            const now = Date.now();
            localStorage.setItem('lastActivity', String(now));
            setLastActivity(now);
        };
        const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart', 'visibilitychange'];
        events.forEach((ev) => window.addEventListener(ev, markActive, { passive: true }));
        const onStorage = (e) => {
            if (e.key === 'token' && !e.newValue) {
                // Token foi removido em outra aba: redireciona imediatamente
                try { disconnectChatSocket(); } catch {}
                api.defaults.headers.common['Authorization'] = '';
                setUser(null);
                try { window.location.href = '/login'; } catch {}
            }
        };
        window.addEventListener('storage', onStorage);
        const interval = setInterval(() => {
            const ts = parseInt(localStorage.getItem('lastActivity') || '0', 10);
            const now = Date.now();
            if (user && Number.isFinite(ts) && now - ts > INACTIVITY_LIMIT_MS) {
                // Sessão expirada por inatividade
                try { disconnectChatSocket(); } catch {}
                localStorage.removeItem('token');
                api.defaults.headers.common['Authorization'] = '';
                setUser(null);
                try {
                    // Indica motivo e redireciona para login
                    sessionStorage.setItem('sessionReason', 'timeout');
                    window.location.href = '/login';
                } catch {}
            }
        }, 60 * 1000); // checa a cada 60s
        return () => {
            events.forEach((ev) => window.removeEventListener(ev, markActive));
            window.removeEventListener('storage', onStorage);
            clearInterval(interval);
        };
    }, [user]);

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
