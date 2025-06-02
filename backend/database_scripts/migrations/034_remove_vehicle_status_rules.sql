-- Remover qualquer trigger que valide o status do veículo
DROP TRIGGER IF EXISTS check_vehicle_status ON veiculos;

-- Remover qualquer função que valide o status do veículo
DROP FUNCTION IF EXISTS check_vehicle_status;

-- Atualizar o status do veículo para EmManutencao
UPDATE veiculos 
SET status = 'EmManutencao'::status_veiculo
WHERE veiculoid = 3;

-- Verificar o status atual
SELECT status::text as status FROM veiculos WHERE veiculoid = 3;
