-- Verificar todos os ENUMs relacionados aos veículos
SELECT n.nspname as "Schema",
       t.typname as "Name",
       array_agg(e.enumlabel) as "Values"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
WHERE t.typname IN ('tipo_veiculo', 'tipo_veiculo_enum', 'status_veiculo', 'status_veiculo_enum', 'tipo_uso_veiculo')
GROUP BY n.nspname, t.typname 
ORDER BY n.nspname, t.typname;

-- Verificar as colunas que usam esses ENUMs
SELECT 
    c.relname as table_name,
    a.attname as column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
FROM pg_class c 
JOIN pg_attribute a ON c.oid = a.attrelid 
JOIN pg_type t ON a.atttypid = t.oid 
WHERE c.relname IN ('veiculos', 'viagens')
AND a.attnum > 0 
AND NOT a.attisdropped 
AND t.typname IN ('tipo_veiculo', 'tipo_veiculo_enum', 'status_veiculo', 'status_veiculo_enum', 'tipo_uso_veiculo');
