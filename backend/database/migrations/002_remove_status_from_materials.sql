-- Remover a coluna status da tabela materials
ALTER TABLE materials DROP COLUMN IF EXISTS status;
