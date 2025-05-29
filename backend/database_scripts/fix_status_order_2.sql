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

    -- 4. Atualizar os registros com 'Em Andamento' ou 'Em_Andamento'
    UPDATE viagens 
    SET status_viagem = 'Andamento'::text 
    WHERE status_viagem::text IN ('Em Andamento', 'Em_Andamento');

    -- 5. Alterar o tipo da coluna
    ALTER TABLE viagens 
    ALTER COLUMN status_viagem TYPE status_order_temp 
    USING status_viagem::text::status_order_temp;

    -- 6. Remover o ENUM antigo
    DROP TYPE status_viagem;

    -- 7. Renomear o novo ENUM
    ALTER TYPE status_order_temp RENAME TO status_viagem;

    -- 8. Restaurar o valor padrão
    ALTER TABLE viagens ALTER COLUMN status_viagem SET DEFAULT 'Pendente'::status_viagem;
END $$;

COMMIT;
