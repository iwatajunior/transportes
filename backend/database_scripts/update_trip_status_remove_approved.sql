-- Atualizar os registros que têm status 'Aprovada' para 'Agendada'
UPDATE viagens
SET status_viagem = 'Agendada'
WHERE status_viagem = 'Aprovada';

-- Remover o ENUM antigo e criar o novo
ALTER TABLE viagens 
    ALTER COLUMN status_viagem TYPE VARCHAR(20);

DROP TYPE status_viagem;

CREATE TYPE status_viagem AS ENUM (
    'Pendente',
    'Agendada',
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