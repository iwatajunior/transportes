-- Verificar os valores permitidos no ENUM status_veiculo
SELECT unnest(enum_range(NULL::status_veiculo))::text as status_enum;

-- Verificar os valores atuais na tabela
SELECT DISTINCT status::text as status_atual FROM veiculos ORDER BY status_atual;

-- Verificar se há algum trigger que afete o status
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%vehicle%' OR proname LIKE '%status%';
