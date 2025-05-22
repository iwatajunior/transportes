-- Atualizar os status das viagens existentes
UPDATE viagens
SET status_viagem = 'Pendente'
WHERE status_viagem = 'Solicitada';

UPDATE viagens
SET status_viagem = 'Recusada'
WHERE status_viagem = 'Rejeitada';

UPDATE viagens
SET status_viagem = 'Andamento'
WHERE status_viagem = 'Em Andamento';

UPDATE viagens
SET status_viagem = 'Concluida'
WHERE status_viagem = 'Concluída';

-- Remover o ENUM antigo e criar o novo
ALTER TABLE viagens 
    ALTER COLUMN status_viagem TYPE VARCHAR(20);

DROP TYPE status_viagem;

CREATE TYPE status_viagem AS ENUM (
    'Pendente',
    'Aprovada',
    'Andamento',
    'Concluida',
    'Cancelada',
    'Recusada'
);

-- Converter a coluna de volta para o novo ENUM
ALTER TABLE viagens 
    ALTER COLUMN status_viagem TYPE status_viagem 
    USING status_viagem::status_viagem;

COMMIT; 