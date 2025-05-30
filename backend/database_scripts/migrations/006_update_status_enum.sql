-- 1. Criar novo ENUM sem o valor Recusada
CREATE TYPE status_viagem_enum_new AS ENUM (
    'Pendente',
    'Agendada',
    'Andamento',
    'Concluida',
    'Cancelada'
);

-- 2. Atualizar a tabela para usar o novo ENUM
ALTER TABLE viagens ALTER COLUMN status_viagem TYPE status_viagem_enum_new USING status_viagem::text::status_viagem_enum_new;

-- 3. Remover o ENUM antigo
DROP TYPE status_viagem_enum;

-- 4. Renomear o novo ENUM para o nome original
ALTER TYPE status_viagem_enum_new RENAME TO status_viagem_enum;

-- 5. Verificar os valores do novo ENUM
SELECT unnest(enum_range(NULL::status_viagem_enum))::text as values;

-- 6. Registrar a migração
INSERT INTO migrations (name, executed_at) VALUES ('006_update_status_enum', NOW());
