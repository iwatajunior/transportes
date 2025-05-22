-- Ajustar timezone do banco de dados
ALTER DATABASE transportes_db SET timezone TO 'America/Sao_Paulo';

-- Ajustar timezone da sessão atual
SET timezone TO 'America/Sao_Paulo';

-- Verificar a data atual
SELECT NOW() as current_time; 