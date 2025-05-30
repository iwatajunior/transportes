-- 1. Verificar os valores atuais do ENUM
SELECT unnest(enum_range(NULL::status_viagem_enum))::text as values;

-- 2. Remover o valor 'Recusada' do ENUM existente
ALTER TYPE status_viagem_enum DROP VALUE 'Recusada';

-- 3. Verificar se o valor foi removido
SELECT unnest(enum_range(NULL::status_viagem_enum))::text as values;

-- 4. Registrar a migração
INSERT INTO migrations (name, executed_at) VALUES ('007_update_status_enum', NOW());
