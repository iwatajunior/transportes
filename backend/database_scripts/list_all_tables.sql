-- Listar todas as tabelas com suas colunas
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
ORDER BY 
    table_schema,
    table_name,
    ordinal_position;

-- Listar todas as tabelas com o número de registros
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size,
    (SELECT count(*) FROM "" || table_name || "") as row_count
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- Listar todas as tabelas com seus relacionamentos (chaves estrangeiras)
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name,
    b.attname as referenced_column
FROM 
    pg_constraint c
JOIN 
    pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN 
    pg_attribute b ON b.attnum = ANY(c.confkey) AND b.attrelid = c.confrelid
WHERE 
    c.contype = 'f'
ORDER BY 
    table_name,
    constraint_name;
