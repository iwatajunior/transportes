-- Consultar os valores do enum de status de rotas
SELECT unnest(enum_range(NULL::status_rota))::text as status_rota;

-- Consultar os valores atuais na tabela de rotas
SELECT DISTINCT status::text as status_atual FROM rotas ORDER BY status_atual;
