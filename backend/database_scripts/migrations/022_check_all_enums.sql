-- Verificar todos os ENUMs do sistema
SELECT n.nspname as "Schema",
       t.typname as "Name",
       array_agg(e.enumlabel) as "Values"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
GROUP BY n.nspname, t.typname 
ORDER BY n.nspname, t.typname;

-- Verificar todas as colunas que usam ENUMs
SELECT 
    c.relname as table_name,
    a.attname as column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
FROM pg_class c 
JOIN pg_attribute a ON c.oid = a.attrelid 
JOIN pg_type t ON a.atttypid = t.oid 
WHERE c.relkind = 'r' -- apenas tabelas regulares
AND a.attnum > 0 
AND NOT a.attisdropped 
AND t.typtype = 'e' -- apenas ENUMs
ORDER BY c.relname, a.attname;
