-- Adicionar coluna status à tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true;

-- Atualizar registros existentes para ter status = true
UPDATE usuarios SET status = true WHERE status IS NULL;

-- Adicionar comentário à coluna
COMMENT ON COLUMN usuarios.status IS 'Indica se o usuário está ativo (true) ou inativo (false)'; 