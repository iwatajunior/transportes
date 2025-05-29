-- Atualizar a ordem dos status na query para usar 'Andamento' em vez de 'Em Andamento'
DO $$
BEGIN
    -- Verificar se o ENUM já existe e remover se necessário
    IF EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'status_order_temp'
    ) THEN
        DROP TYPE status_order_temp;
    END IF;

    -- Criar novo ENUM temporário com a ordem correta
    CREATE TYPE status_order_temp AS ENUM (
        'Pendente',
        'Agendada',
        'Andamento',
        'Concluida',
        'Cancelada'
    );

    -- Atualizar a ordem dos status na tabela
    ALTER TABLE viagens 
    ALTER COLUMN status_viagem TYPE status_order_temp 
    USING CASE 
        WHEN status_viagem::text = 'Em_Andamento' THEN 'Andamento'::status_order_temp
        WHEN status_viagem::text = 'Em Andamento' THEN 'Andamento'::status_order_temp
        ELSE status_viagem::text::status_order_temp
    END;

    -- Remover o ENUM antigo e renomear o novo
    DROP TYPE status_viagem;
    ALTER TYPE status_order_temp RENAME TO status_viagem;

    -- Atualizar a ordem dos status na view
    CREATE OR REPLACE VIEW viagens_view AS
    SELECT
        v.viagemid as tripid,
        v.data_saida, v.horario_saida, v.data_retorno_prevista, v.horario_retorno_previsto,
        v.destino_completo, v.finalidade, v.quantidade_passageiros, v.tipo_veiculo_desejado,
        v.veiculo_solicitado_id, v.solicitante_usuarioid, v.observacoes, v.status_viagem,
        v.veiculo_alocado_id, v.motorista_usuarioid, v.km_inicial, v.km_final,
        u_sol.nome AS solicitante_nome,
        u_sol.fotoperfilurl AS solicitante_avatar,
        u_mot.fotoperfilurl AS motorista_avatar,
        ve.placa AS veiculo_alocado_placa,
        ve.modelo AS veiculo_alocado_modelo,
        u_mot.nome AS motorista_nome,
        v.km_inicial,
        v.km_final
    FROM viagens v
    LEFT JOIN usuarios u_sol ON v.solicitante_usuarioid = u_sol.userid
    LEFT JOIN veiculos ve ON v.veiculo_alocado_id = ve.veiculoid
    LEFT JOIN usuarios u_mot ON v.motorista_usuarioid = u_mot.userid
    ORDER BY
        CASE v.status_viagem
            WHEN 'Pendente' THEN 1
            WHEN 'Agendada' THEN 2
            WHEN 'Andamento' THEN 3
            WHEN 'Concluida' THEN 4
            WHEN 'Cancelada' THEN 5
            ELSE 6
        END,
        v.data_criacao DESC;

END $$;

COMMIT;
