-- Verificar as colunas da tabela viagens
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'viagens'
ORDER BY ordinal_position;
