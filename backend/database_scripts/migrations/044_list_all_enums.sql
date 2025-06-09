-- Listar todos os enums no banco de dados
SELECT 
    n.nspname as schema,
    t.typname as enum_name,
    array_agg(e.enumlabel) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
GROUP BY schema, enum_name
ORDER BY schema, enum_name;
