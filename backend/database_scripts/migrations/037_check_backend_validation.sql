-- Verificar se há alguma validação no banco de dados
SELECT proname, prosrc 
FROM pg_proc 
WHERE prosrc LIKE '%status%' 
OR prosrc LIKE '%validation%' 
OR prosrc LIKE '%check%';

-- Verificar se há algum trigger que valide o status
SELECT tgname, tgtype, tgdeferrable, tginitdeferred, tgargs 
FROM pg_trigger 
WHERE tgrelid = 'veiculos'::regclass;
