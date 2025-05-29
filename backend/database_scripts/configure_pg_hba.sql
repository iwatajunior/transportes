-- Adicionar regra para permitir conexões específicas
host    all             postgres        10.1.1.42/32            md5

-- Configurar o PostgreSQL para aceitar conexões de rede
ALTER SYSTEM SET listen_addresses = '*';

-- Recarregar as configurações
SELECT pg_reload_conf();
