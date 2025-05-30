-- Verificar os valores atuais da coluna tipo
SELECT DISTINCT tipo::text as tipo_atual FROM veiculos;

-- Verificar se a coluna tipo está usando o ENUM correto
SELECT pg_catalog.format_type(a.atttypid, a.atttypmod) as tipo_coluna
FROM pg_class c 
JOIN pg_attribute a ON c.oid = a.attrelid 
WHERE c.relname = 'veiculos' 
AND a.attname = 'tipo'
AND a.attnum > 0 
AND NOT a.attisdropped;
