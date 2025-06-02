-- Atualizar os veículos com status nulo para Disponivel
UPDATE veiculos 
SET status = 'Disponivel'::status_veiculo
WHERE status IS NULL;

-- Verificar quantos registros foram atualizados
SELECT status::text as status, COUNT(*) as quantidade 
FROM veiculos 
GROUP BY status 
ORDER BY status;
