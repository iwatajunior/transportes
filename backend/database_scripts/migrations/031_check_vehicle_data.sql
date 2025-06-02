-- Verificar os dados do veículo específico
SELECT * FROM veiculos WHERE veiculoid = 3;

-- Verificar se há alguma viagem associada a este veículo
SELECT * FROM viagens WHERE veiculo_alocado_id = 3 OR veiculo_solicitado_id = 3;
