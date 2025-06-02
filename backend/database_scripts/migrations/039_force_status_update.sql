-- Forçar a atualização do status do veículo 6 para EmManutencao
UPDATE veiculos 
SET status = 'EmManutencao'::status_veiculo
WHERE veiculoid = 6;

-- Verificar se a atualização foi bem-sucedida
SELECT status::text as status FROM veiculos WHERE veiculoid = 6;
