-- Verificar as colunas da tabela veiculos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'veiculos'
ORDER BY ordinal_position;
