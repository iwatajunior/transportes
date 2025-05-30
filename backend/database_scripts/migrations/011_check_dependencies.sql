-- Verificar dependências do tipo status_viagem
SELECT 
    n.nspname as "Schema",
    c.relname as "Table",
    a.attname as "Column"
FROM pg_class c 
JOIN pg_attribute a ON c.oid = a.attrelid 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE a.atttypid = 'status_viagem'::regtype 
AND a.attnum > 0 
AND NOT a.attisdropped 
ORDER BY n.nspname, c.relname, a.attname;
