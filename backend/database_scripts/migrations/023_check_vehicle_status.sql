-- Verificar os valores do ENUM status_veiculo
SELECT unnest(enum_range(NULL::status_veiculo))::text as status_enum;

-- Verificar os valores atuais na tabela veiculos
SELECT DISTINCT status::text as status_atual FROM veiculos ORDER BY status_atual;

-- Verificar quantos registros existem para cada status
SELECT status::text as status, COUNT(*) as quantidade FROM veiculos GROUP BY status ORDER BY status;
