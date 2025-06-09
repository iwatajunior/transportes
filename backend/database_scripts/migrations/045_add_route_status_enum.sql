-- Adicionando enum de status de rotas
CREATE TYPE status_rota_enum AS ENUM (
    'Agendada',
    'Andamento',
    'Concluida',
    'Cancelada'
);

-- Adicionando coluna status na tabela de rotas
ALTER TABLE rotas
ADD COLUMN IF NOT EXISTS status status_rota_enum NOT NULL DEFAULT 'Agendada';

-- Adicionando check constraint para garantir que o status seja válido
ALTER TABLE rotas
ADD CONSTRAINT valid_status CHECK (status IN ('Agendada', 'Andamento', 'Concluida', 'Cancelada'));
