-- Verificar se há alguma validação no backend
SELECT proname, prosrc 
FROM pg_proc 
WHERE prosrc LIKE '%validate%';
