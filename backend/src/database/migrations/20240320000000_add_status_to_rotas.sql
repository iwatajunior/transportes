-- Adiciona a coluna status à tabela rotas
ALTER TABLE rotas ADD COLUMN status VARCHAR(10) DEFAULT 'ativo' NOT NULL;
 
-- Atualiza todas as rotas existentes para terem status 'ativo'
UPDATE rotas SET status = 'ativo' WHERE status IS NULL; 