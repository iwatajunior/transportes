// Script para listar viagens do banco de dados
const axios = require('axios');

// Função para obter um token de autenticação
async function login() {
  try {
    const response = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@example.com', // Substitua pelo seu email
      senha: 'senha123' // Substitua pela sua senha
    });
    return response.data.token;
  } catch (error) {
    console.error('Erro ao fazer login:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Função para listar todas as viagens
async function listarViagens(token) {
  try {
    const response = await axios.get('http://localhost:3001/api/v1/trips', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('\n===== LISTA DE VIAGENS =====\n');
    
    if (response.data.length === 0) {
      console.log('Nenhuma viagem encontrada.');
      return;
    }
    
    response.data.forEach((viagem, index) => {
      console.log(`Viagem #${index + 1} (ID: ${viagem.viagemid}):`);
      console.log(`- Destino: ${viagem.destino_completo}`);
      console.log(`- Data de Saída: ${new Date(viagem.data_saida).toLocaleDateString()} às ${viagem.horario_saida}`);
      console.log(`- Data de Retorno Prevista: ${new Date(viagem.data_retorno_prevista).toLocaleDateString()} às ${viagem.horario_retorno_previsto}`);
      console.log(`- Status: ${viagem.status_viagem}`);
      console.log(`- Finalidade: ${viagem.finalidade}`);
      console.log(`- Quantidade de Passageiros: ${viagem.quantidade_passageiros}`);
      console.log(`- Veículo Solicitado: ${viagem.veiculo_solicitado_id || 'Não especificado'}`);
      console.log(`- Tipo de Veículo Desejado: ${viagem.tipo_veiculo_desejado || 'Não especificado'}`);
      console.log(`- Solicitante ID: ${viagem.solicitante_usuarioid}`);
      console.log('----------------------------');
    });
  } catch (error) {
    console.error('Erro ao listar viagens:', error.response?.data || error.message);
  }
}

// Executar o script
(async () => {
  try {
    const token = await login();
    await listarViagens(token);
  } catch (error) {
    console.error('Erro ao executar o script:', error);
  }
})();
