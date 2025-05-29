DO $$
BEGIN
    -- 1. Remover o valor padrão da coluna
    ALTER TABLE viagens ALTER COLUMN status_viagem DROP DEFAULT;

    -- 2. Remover o tipo temporário se existir
    IF EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'status_order_temp'
    ) THEN
        DROP TYPE status_order_temp;
    END IF;

    -- 3. Criar novo ENUM temporário
    CREATE TYPE status_order_temp AS ENUM (
        'Pendente',
        'Agendada',
        'Andamento',
        'Concluida',
        'Cancelada'
    );

    -- 4. Criar uma coluna temporária para fazer a conversão
    ALTER TABLE viagens ADD COLUMN status_temp text;

    -- 5. Atualizar a coluna temporária com os valores convertidos
    UPDATE viagens 
    SET status_temp = CASE 
        WHEN status_viagem::text IN ('Em_Andamento', 'Em Andamento') THEN 'Andamento'
        ELSE status_viagem::text
    END;

    -- 6. Atualizar a coluna original usando a coluna temporária
    UPDATE viagens 
    SET status_viagem = status_temp::status_order_temp;

    -- 7. Remover a coluna temporária
    ALTER TABLE viagens DROP COLUMN status_temp;

    -- 8. Remover o ENUM antigo
    DROP TYPE status_viagem;

    -- 9. Renomear o novo ENUM
    ALTER TYPE status_order_temp RENAME TO status_viagem;

    -- 10. Restaurar o valor padrão
    ALTER TABLE viagens ALTER COLUMN status_viagem SET DEFAULT 'Pendente'::status_viagem;
END $$;

COMMIT;
