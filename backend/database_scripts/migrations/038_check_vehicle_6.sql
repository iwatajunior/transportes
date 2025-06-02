-- Verificar dados do veículo 6
SELECT * FROM veiculos WHERE veiculoid = 6;

-- Verificar se há alguma viagem associada
SELECT * FROM viagens WHERE veiculo_alocado_id = 6 OR veiculo_solicitado_id = 6;
