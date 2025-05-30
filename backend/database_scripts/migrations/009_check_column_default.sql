-- Verificar o valor padrão da coluna
SELECT 
    a.attname as column_name,
    pg_catalog.pg_get_expr(d.adbin, d.adrelid) as default_value
FROM pg_catalog.pg_attribute a
LEFT JOIN pg_catalog.pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum
WHERE a.attrelid = 'viagens'::regclass
AND a.attname = 'status_viagem';
