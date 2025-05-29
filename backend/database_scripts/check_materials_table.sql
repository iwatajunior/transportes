-- Verificar se a tabela materials existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'materials';

-- Mostrar a estrutura da tabela materials
\d materials

-- Verificar os dados na tabela materials
SELECT * FROM materials;

-- Verificar os relacionamentos da tabela materials
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
    AND c.conrelid::regclass = 'materials'::regclass;
