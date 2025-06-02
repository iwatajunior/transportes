-- Verificar dados do veículo 4
SELECT * FROM veiculos WHERE veiculoid = 4;

-- Verificar viagens associadas ao veículo 4
SELECT * FROM viagens WHERE veiculo_alocado_id = 4 OR veiculo_solicitado_id = 4;
