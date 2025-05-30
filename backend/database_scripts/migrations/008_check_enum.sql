-- Verificar todos os ENUMs no banco de dados
SELECT n.nspname as "Schema",
       t.typname as "Name",
       array_agg(e.enumlabel) as "Values"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
GROUP BY n.nspname, t.typname 
ORDER BY n.nspname, t.typname;
