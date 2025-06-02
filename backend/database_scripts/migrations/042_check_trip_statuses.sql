-- Verificar todos os status existentes no banco de dados
SELECT DISTINCT status_viagem::text as status FROM viagens ORDER BY status;
