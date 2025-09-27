import axios from 'axios';

// Prefer .env override. Otherwise, use the current page hostname to support LAN access, fallback to localhost
const resolvedHost = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
const API_URL = process.env.REACT_APP_API_URL || `http://${resolvedHost}:3001/api/v1`;

// Criar uma instância do Axios com a URL base e outras configurações globais
const apiClient = axios.create({
    baseURL: API_URL,
    // Você pode adicionar outros padrões aqui, como headers
    // headers: { 'Content-Type': 'application/json' }
});

// Interceptor para adicionar o token JWT a todas as requisições automaticamente
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient; // Exportação padrão da instância configurada

// Funções específicas podem continuar existindo e usando a mesma instância ou fazendo chamadas diretas
export const loginUser = async (credentials) => {
  try {
    console.log('DEBUG - Dados de login:', credentials);
    const response = await apiClient.post(`/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network error or server unreachable during login');
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    // apiClient já incluirá o token automaticamente devido ao interceptor
    const response = await apiClient.post(`/vehicles`, vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network error or server unreachable');
  }
};

export const getVehicles = async () => {
  try {
    // apiClient já incluirá o token automaticamente
    const response = await apiClient.get(`/vehicles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network error or server unreachable');
  }
};

export const getVehicleById = async (id) => {
  try {
    // apiClient já incluirá o token automaticamente e usa a baseURL
    const response = await apiClient.get(`/vehicles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vehicle ${id}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network error or server unreachable when fetching vehicle by ID');
  }
};

export const updateVehicle = async (id, vehicleData) => {
  try {
    // apiClient já incluirá o token automaticamente e usa a baseURL
    // O método PUT substitui todo o recurso, enquanto PATCH atualiza parcialmente.
    const response = await apiClient.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle ${id}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network error or server unreachable when updating vehicle');
  }
};

export const deleteVehicle = async (id) => {
  try {
    // apiClient já incluirá o token automaticamente e usa a baseURL
    const response = await apiClient.delete(`/vehicles/${id}`);
    return response.data; // Geralmente retorna uma mensagem de sucesso ou o objeto deletado/desativado
  } catch (error) {
    console.error(`Error deleting vehicle ${id}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network error or server unreachable when deleting vehicle');
  }
};

export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users'); // Rota para listar usuários
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network error or server unreachable when fetching users');
  }
};

export const getUserById = async (userId) => {
  try {
    console.log(`[getUserById] Buscando usuário com ID: ${userId}`);
    const response = await apiClient.get(`/users/${userId}`);
    console.log(`[getUserById] Resposta recebida:`, response.data);
    
    // Verificar se a resposta tem a estrutura esperada
    if (response.data && response.data.user) {
      console.log(`[getUserById] Dados do usuário encontrados:`, response.data.user);
      return response.data.user;
    } else if (response.data) {
      console.log(`[getUserById] Dados recebidos sem estrutura user:`, response.data);
      return response.data; // Retorna os dados como estão, caso não estejam na estrutura esperada
    } else {
      console.warn(`[getUserById] Resposta sem dados para o usuário ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`[getUserById] Erro ao buscar usuário ${userId}:`, error);
    console.error('[getUserById] Status do erro:', error.response?.status);
    console.error('[getUserById] Dados do erro:', error.response?.data);
    
    // Lançar um erro mais descritivo
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      } else {
        throw error.response.data || new Error(`Erro ${error.response.status} ao buscar usuário`);
      }
    } else {
      throw new Error('Erro de rede ou servidor indisponível ao buscar usuário');
    }
  }
};

export const updateUser = async (userId, formData) => {
  try {
    console.log(`[updateUser] Enviando atualização para usuário ${userId}`);
    
    // Log dos dados sendo enviados
    if (formData instanceof FormData) {
      console.log(`[updateUser] Perfil no formData:`, formData.get('perfil'));
      console.log(`[updateUser] Nome no formData:`, formData.get('nome'));
      console.log(`[updateUser] Email no formData:`, formData.get('email'));
      console.log(`[updateUser] Setor no formData:`, formData.get('setor'));
      console.log(`[updateUser] Foto no formData:`, formData.get('foto') ? 'Foto presente' : 'Sem foto');
    } else {
      console.log('[updateUser] Dados:', formData);
    }
    
    const response = await apiClient.put(`/users/${userId}`, formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    
    console.log(`[updateUser] Resposta da API (status):`, response.status);
    console.log(`[updateUser] Resposta da API (dados):`, response.data);
    
    if (response.data && response.data.user) {
      console.log(`[updateUser] Dados do usuário atualizados:`, response.data.user);
    }
    
    return response.data;
  } catch (error) {
    console.error(`[updateUser] Erro ao atualizar usuário ${userId}:`, error);
    
    if (error.response) {
      console.error(`[updateUser] Status do erro:`, error.response.status);
      console.error(`[updateUser] Dados do erro:`, error.response.data);
      
      // Criar um erro mais descritivo
      const errorMessage = error.response.data?.message || `Erro ${error.response.status} ao atualizar usuário`;
      const enhancedError = new Error(errorMessage);
      enhancedError.statusCode = error.response.status;
      enhancedError.responseData = error.response.data;
      
      throw enhancedError;
    } else if (error.request) {
      console.error(`[updateUser] Erro de requisição (sem resposta):`, error.request);
      throw new Error('Erro de conexão: o servidor não respondeu à solicitação');
    } else {
      console.error(`[updateUser] Erro geral:`, error.message);
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }
};

export const updateUserStatus = async (userId, status) => {
    try {
        console.log(`[api.updateUserStatus] Iniciando atualização do status do usuário ${userId} para ${status}`);
        const response = await apiClient.patch(`/users/${userId}/status`, { status });
        console.log(`[api.updateUserStatus] Resposta da API:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[api.updateUserStatus] Erro ao atualizar status:`, error);
        if (error.response) {
            console.error(`[api.updateUserStatus] Status do erro:`, error.response.status);
            console.error(`[api.updateUserStatus] Dados do erro:`, error.response.data);
        }
        throw error.response ? error.response.data : new Error('Erro ao atualizar status do usuário');
    }
};

// Add other API functions here as needed
// export const getUsers = async () => { ... };

// Função para buscar dados do perfil do usuário logado
export const getUserProfile = async () => {
    try {
        const response = await apiClient.get('/auth/profile'); // Novo endpoint no backend
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Network error or server unreachable when fetching user profile');
    }
};

// Função para o usuário logado atualizar o próprio perfil (nome, senha e foto)
export const updateUserProfile = async (profileData) => {
    try {
        console.log('[updateUserProfile] Dados recebidos:', profileData);
        console.log('[updateUserProfile] É FormData?', profileData instanceof FormData);
        
        if (profileData instanceof FormData) {
            // Log dos dados do FormData
            for (let pair of profileData.entries()) {
                console.log('[updateUserProfile] FormData conteúdo -', pair[0] + ':', pair[1]);
            }
        }

        // Configuração especial para FormData (upload de arquivos)
        const config = {
            headers: {
                'Content-Type': profileData instanceof FormData ? 'multipart/form-data' : 'application/json'
            }
        };

        console.log('[updateUserProfile] Config:', config);
        
        const response = await apiClient.put('/users/profile', profileData, config);
        console.log('[updateUserProfile] Resposta:', response.data);
        return response.data;
    } catch (error) {
        console.error('[updateUserProfile] Erro:', error);
        console.error('[updateUserProfile] Resposta de erro:', error.response?.data);
        throw error.response ? error.response.data : new Error('Network error or server unreachable when updating user profile');
    }
};

export const getLoginAttempts = async (page = 1, limit = 50) => {
  try {
    console.log('[api.getLoginAttempts] Iniciando busca de tentativas de login...');
    const response = await apiClient.get(`/auth/login-attempts?page=${page}&limit=${limit}`);
    console.log('[api.getLoginAttempts] Resposta da API:', response.data);
    
    if (!response.data || !response.data.attempts) {
      console.error('[api.getLoginAttempts] Resposta inválida:', response.data);
      throw new Error('Formato de resposta inválido do servidor');
    }
    
    return response.data;
  } catch (error) {
    console.error('[api.getLoginAttempts] Erro:', error);
    if (error.response) {
      console.error('[api.getLoginAttempts] Status do erro:', error.response.status);
      console.error('[api.getLoginAttempts] Dados do erro:', error.response.data);
      throw new Error(error.response.data.message || 'Erro ao buscar tentativas de login');
    }
    throw new Error('Erro de rede ou servidor indisponível ao buscar tentativas de login');
  }
};
