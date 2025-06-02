-- Verificar a estrutura da tabela veiculos
\d veiculos

-- Verificar os valores permitidos para o campo status
SELECT DISTINCT status::text as status FROM veiculos ORDER BY status;

-- Verificar se há algum trigger ou constraint de validação
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%vehicle%';
