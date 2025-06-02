-- Verificar se há alguma função de validação no backend
SELECT proname, prosrc 
FROM pg_proc 
WHERE prosrc LIKE '%update_vehicle%' 
OR prosrc LIKE '%validate_vehicle%' 
OR prosrc LIKE '%check_vehicle%';
