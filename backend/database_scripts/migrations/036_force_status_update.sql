-- Forçar a atualização do status do veículo 4 para EmManutencao
UPDATE veiculos 
SET status = 'EmManutencao'::status_veiculo
WHERE veiculoid = 4;

-- Verificar se a atualização foi bem-sucedida
SELECT status::text as status FROM veiculos WHERE veiculoid = 4;
