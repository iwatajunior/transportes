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
        'Cancelada',
        'Recusada'
    );

    -- 4. Criar uma tabela temporária para armazenar os dados
    CREATE TEMPORARY TABLE temp_viagens AS 
    SELECT viagemid, status_viagem::text as status_text 
    FROM viagens;

    -- 5. Atualizar a tabela temporária com os valores convertidos
    UPDATE temp_viagens 
    SET status_text = CASE 
        WHEN status_text IN ('Em_Andamento', 'Em Andamento') THEN 'Andamento'
        ELSE status_text
    END;

    -- 6. Criar uma nova tabela temporária com o novo tipo
    CREATE TEMPORARY TABLE temp_viagens_new (
        viagemid integer,
        status_viagem status_order_temp
    );

    -- 7. Inserir os dados convertidos na nova tabela temporária
    INSERT INTO temp_viagens_new (viagemid, status_viagem)
    SELECT viagemid, status_text::status_order_temp
    FROM temp_viagens;

    -- 8. Alterar o tipo da coluna original para text temporariamente
    ALTER TABLE viagens ALTER COLUMN status_viagem TYPE text;

    -- 9. Atualizar a tabela original usando a nova tabela temporária
    UPDATE viagens v
    SET status_viagem = t.status_viagem::text
    FROM temp_viagens_new t
    WHERE v.viagemid = t.viagemid;

    -- 10. Remover as tabelas temporárias
    DROP TABLE temp_viagens;
    DROP TABLE temp_viagens_new;

    -- 11. Remover o ENUM antigo
    DROP TYPE status_viagem;

    -- 12. Renomear o novo ENUM
    ALTER TYPE status_order_temp RENAME TO status_viagem;

    -- 13. Alterar o tipo da coluna de volta para o novo ENUM
    ALTER TABLE viagens ALTER COLUMN status_viagem TYPE status_viagem USING status_viagem::status_viagem;

    -- 14. Restaurar o valor padrão
    ALTER TABLE viagens ALTER COLUMN status_viagem SET DEFAULT 'Pendente'::status_viagem;
END $$;

COMMIT;
