-- Verificar os valores atuais do ENUM
SELECT unnest(enum_range(NULL::status_viagem))::text as values;

-- Remover o valor 'Recusada' do ENUM existente
ALTER TYPE status_viagem RENAME VALUE 'Recusada' TO 'Cancelada';

-- Verificar os valores atualizados
SELECT unnest(enum_range(NULL::status_viagem))::text as values;
