import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import VehicleForm from '../components/vehicles/VehicleForm';
import { getVehicleById, updateVehicle } from '../services/api'; // Essas funções API precisam ser criadas

const EditVehiclePage = () => {
  const { id } = useParams(); // Pega o ID da URL
  const history = useHistory();
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const fetchVehicle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Nota: A API getVehicleById retornará os dados com nomes de coluna do DB (ex: ano, tipo)
      const data = await getVehicleById(id);
      // Precisamos mapear os nomes do DB para os nomes esperados pelo VehicleForm (ex: ano_fabricacao, tipo_veiculo)
      const formattedData = {
        placa: data.placa || '',
        marca: data.marca || '',
        modelo: data.modelo || '',
        ano_fabricacao: data.ano || '', // DB 'ano' para form 'ano_fabricacao'
        tipo_veiculo: data.tipo || 'Carro', // DB 'tipo' para form 'tipo_veiculo'
        tipo_uso: data.tipo_uso || undefined, // Enviar undefined se falsy, para Joi.optional()
        capacidade_passageiros: data.capacidade || '', // DB 'capacidade' para form 'capacidade_passageiros'
        km_atual: data.quilometragematual || '', // DB 'quilometragematual' para form 'km_atual'
        data_ultima_revisao: data.ultimamanutencao || '', // DB 'ultimamanutencao' para form 'data_ultima_revisao'
        data_proxima_revisao: data.dataproximarevisao || '', // DB 'dataproximarevisao' para form 'data_proxima_revisao'
        observacoes: data.observacoes || '',
        status: data.status, // Adicionar o status vindo da API
        // usuario_responsavel_id será pego pelo formulário se necessário ou pode vir do DB
        usuario_responsavel_id: data.usuarioresponsavelid || '',
      };
      setVehicleData(formattedData);
    } catch (err) {
      setError(err.message || 'Falha ao buscar dados do veículo.');
      setVehicleData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const handleUpdateVehicle = async (formDataFromForm) => {
    setSubmitError(null);
    try {
      // Mapear os dados do formulário de volta para o formato esperado pelo backend/DB
      const dataToSubmit = {
        placa: formDataFromForm.placa,
        marca: formDataFromForm.marca,
        modelo: formDataFromForm.modelo,
        tipo: formDataFromForm.tipo_veiculo,
        tipo_uso: formDataFromForm.tipo_uso || undefined, // Enviar undefined se falsy, para Joi.optional()
        ultimamanutencao: formDataFromForm.data_ultima_revisao || null,
        dataproximarevisao: formDataFromForm.data_proxima_revisao || null,
        observacoes: formDataFromForm.observacoes || null,
        status: formDataFromForm.status,
      };

      // Adicionar campos numéricos apenas se válidos
      const anoForm = formDataFromForm.ano_fabricacao;
      if (anoForm && !isNaN(parseInt(anoForm, 10))) {
        dataToSubmit.ano = parseInt(anoForm, 10);
      }

      const capacidadeForm = formDataFromForm.capacidade_passageiros;
      if (capacidadeForm && !isNaN(parseInt(capacidadeForm, 10))) {
        dataToSubmit.capacidade = parseInt(capacidadeForm, 10);
      }

      const kmAtualForm = formDataFromForm.km_atual;
      if (kmAtualForm && !isNaN(parseInt(kmAtualForm, 10))) {
        dataToSubmit.quilometragematual = parseInt(kmAtualForm, 10);
      }
        
      // usuario_responsavel_id não está sendo alterado neste formulário/lógica.
      // Se fosse, precisaria de tratamento similar para parseInt se viesse como string.


      await updateVehicle(id, dataToSubmit);
      history.push('/veiculos'); // Redireciona para a lista após sucesso
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Falha ao atualizar veículo.');
      if (err.response && err.response.data) {
        console.error("Erro ao atualizar - Resposta Completa do Backend:", JSON.stringify(err.response.data, null, 2));
        if (err.response.data.details && Array.isArray(err.response.data.details)) {
          console.error("Detalhes da Validação do Backend:", err.response.data.details.join('; '));
        }
      } else {
        console.error("Erro ao atualizar (sem resposta detalhada do backend):", err);
      }
    }
  };

  if (loading) return <p>Carregando dados do veículo...</p>;
  if (error) return <p style={{ color: 'red' }}>Erro: {error}</p>;
  if (!vehicleData) return <p>Veículo não encontrado.</p>;

  return (
    <div>
      <h2>Editar Veículo</h2>
      {submitError && <p style={{ color: 'red' }}>Erro ao salvar: {submitError}</p>}
      <VehicleForm onSubmit={handleUpdateVehicle} initialData={vehicleData} />
    </div>
  );
};

export default EditVehiclePage;
