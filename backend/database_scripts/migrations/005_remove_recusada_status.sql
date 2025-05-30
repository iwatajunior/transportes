-- Etapa 1: Verificar se há registros com status Recusada
SELECT COUNT(*) as count FROM viagens WHERE status_viagem::text = 'Recusada';

-- Etapa 2: Atualizar registros com status Recusada para Cancelada
UPDATE viagens
SET status_viagem = 'Cancelada'
WHERE status_viagem::text = 'Recusada';

-- Etapa 3: Verificar se a atualização foi bem sucedida
SELECT COUNT(*) as count FROM viagens WHERE status_viagem::text = 'Recusada';

-- Etapa 4: Verificar se há views que referenciam o status Recusada
SELECT viewname FROM pg_views WHERE definition::text LIKE '%Recusada%';

-- Etapa 5: Verificar se há triggers que referenciam o status Recusada
SELECT proname FROM pg_proc WHERE prosrc::text LIKE '%Recusada%';

-- Etapa 6: Remover o status Recusada do ENUM (apenas se as etapas anteriores estiverem OK)
ALTER TYPE status_viagem_enum DROP VALUE 'Recusada';

-- Etapa 7: Verificar se o ENUM foi atualizado
SELECT unnest(enum_range(NULL::status_viagem_enum))::text as values;

-- Etapa 8: Adicionar log da migração
INSERT INTO migrations (name, executed_at) VALUES ('005_remove_recusada_status', NOW());
