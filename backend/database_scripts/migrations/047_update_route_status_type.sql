-- Primeiro, criar uma coluna temporária com o enum
ALTER TABLE rotas ADD COLUMN status_temp public.status_rota_enum;

-- Copiar os valores existentes para a coluna temporária
UPDATE rotas SET status_temp = CASE 
    WHEN status::text = 'Agendada' THEN 'Agendada'::public.status_rota_enum
    WHEN status::text = 'Andamento' THEN 'Andamento'::public.status_rota_enum
    WHEN status::text = 'Concluida' THEN 'Concluida'::public.status_rota_enum
    WHEN status::text = 'Cancelada' THEN 'Cancelada'::public.status_rota_enum
    ELSE 'Agendada'::public.status_rota_enum
END;

-- Remover a coluna antiga e renomear a nova
ALTER TABLE rotas DROP COLUMN status;
ALTER TABLE rotas RENAME COLUMN status_temp TO status;

-- Verificar o resultado
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'rotas' AND column_name = 'status';
