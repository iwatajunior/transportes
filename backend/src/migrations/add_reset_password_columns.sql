-- Adiciona colunas para redefinição de senha
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Cria índice para melhorar a performance das consultas por token
CREATE INDEX IF NOT EXISTS idx_usuarios_reset_token ON usuarios(reset_token); 