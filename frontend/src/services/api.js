import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://10.1.1.42:3001/api/v1';

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
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Network error or server unreachable when fetching user by ID');
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error.response ? error.response.data : error.message);
    // Lança o erro para que possa ser tratado pelo chamador (ex: EditUserPage)
    // Isso permite que a página de edição exiba mensagens de erro específicas da API (ex: email já em uso)
    throw error.response ? error.response.data : new Error('Network error or server unreachable when updating user');
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
