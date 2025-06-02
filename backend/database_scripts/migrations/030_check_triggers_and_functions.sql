-- Verificar triggers na tabela veiculos
SELECT tgname, tgtype, tgdeferrable, tginitdeferred 
FROM pg_trigger 
WHERE tgrelid = 'veiculos'::regclass 
AND tgname NOT LIKE 'RI%';

-- Verificar funções relacionadas a veículos
SELECT proname, prosrc 
FROM pg_proc 
WHERE prosrc LIKE '%veiculo%' 
OR prosrc LIKE '%vehicle%' 
OR prosrc LIKE '%status%';
