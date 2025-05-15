// Script para listar viagens diretamente do banco de dados
const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'transportes_db',
  password: 'senac2025',
  port: 5432,
});

async function listarViagens() {
  try {
    // Conectar ao banco de dados
    const client = await pool.connect();
    console.log('Conectado ao banco de dados com sucesso!');
    
    // Consulta SQL para obter todas as viagens com informações relacionadas
    const query = `
      SELECT 
        v.viagemid, 
        v.data_saida, 
        v.horario_saida, 
        v.data_retorno_prevista, 
        v.horario_retorno_previsto,
        v.destino_completo, 
        v.finalidade, 
        v.quantidade_passageiros,
        v.tipo_veiculo_desejado,
        v.status_viagem,
        v.observacoes,
        u_sol.nome AS solicitante_nome,
        u_mot.nome AS motorista_nome,
        veic.placa AS veiculo_placa,
        veic.modelo AS veiculo_modelo
      FROM viagens v
      LEFT JOIN usuarios u_sol ON v.solicitante_usuarioid = u_sol.userid
      LEFT JOIN usuarios u_mot ON v.motorista_usuarioid = u_mot.userid
      LEFT JOIN veiculos veic ON v.veiculo_id = veic.veiculoid
      ORDER BY v.data_saida DESC, v.horario_saida DESC
    `;
    
    const result = await client.query(query);
    
    console.log('\n===== LISTA DE VIAGENS =====\n');
    
    if (result.rows.length === 0) {
      console.log('Nenhuma viagem encontrada no banco de dados.');
    } else {
      result.rows.forEach((viagem, index) => {
        console.log(`Viagem #${index + 1} (ID: ${viagem.viagemid}):`);
        console.log(`- Destino: ${viagem.destino_completo}`);
        console.log(`- Data de Saída: ${formatDate(viagem.data_saida)} às ${viagem.horario_saida}`);
        console.log(`- Data de Retorno Prevista: ${formatDate(viagem.data_retorno_prevista)} às ${viagem.horario_retorno_previsto}`);
        console.log(`- Status: ${viagem.status_viagem}`);
        console.log(`- Finalidade: ${viagem.finalidade}`);
        console.log(`- Quantidade de Passageiros: ${viagem.quantidade_passageiros}`);
        console.log(`- Tipo de Veículo Desejado: ${viagem.tipo_veiculo_desejado || 'Não especificado'}`);
        console.log(`- Solicitante: ${viagem.solicitante_nome}`);
        
        if (viagem.motorista_nome) {
          console.log(`- Motorista: ${viagem.motorista_nome}`);
        }
        
        if (viagem.veiculo_placa) {
          console.log(`- Veículo: ${viagem.veiculo_modelo} (${viagem.veiculo_placa})`);
        }
        
        if (viagem.observacoes) {
          console.log(`- Observações: ${viagem.observacoes}`);
        }
        
        console.log('----------------------------');
      });
      
      console.log(`Total de viagens: ${result.rows.length}`);
    }
    
    // Liberar o cliente
    client.release();
    
  } catch (error) {
    console.error('Erro ao listar viagens:', error);
  } finally {
    // Encerrar o pool
    await pool.end();
  }
}

// Função para formatar a data
function formatDate(date) {
  if (!date) return 'Data não definida';
  return new Date(date).toLocaleDateString('pt-BR');
}

// Executar a função principal
listarViagens();
