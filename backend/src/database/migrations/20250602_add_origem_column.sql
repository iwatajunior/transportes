-- Adiciona a coluna origem à tabela viagens como NULL
ALTER TABLE viagens
ADD COLUMN origem VARCHAR(255);

-- Atualiza os registros existentes com um valor padrão
UPDATE viagens
SET origem = 'Sede';

-- Altera a coluna para NOT NULL
ALTER TABLE viagens
ALTER COLUMN origem SET NOT NULL;

-- Atualiza o ENUM status_viagem para incluir o novo campo
-- (Se necessário, adicione aqui)
