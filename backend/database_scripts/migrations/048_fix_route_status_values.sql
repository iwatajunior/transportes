-- Primeiro, verificar os valores existentes
SELECT DISTINCT status::text as status_atual FROM rotas ORDER BY status_atual;

-- Atualizar os valores existentes para os válidos do enum
UPDATE rotas SET status = CASE 
    WHEN status::text = 'ativo' THEN 'Agendada'
    WHEN status::text = 'Agendada' THEN 'Agendada'
    WHEN status::text = 'Andamento' THEN 'Andamento'
    WHEN status::text = 'Concluida' THEN 'Concluida'
    WHEN status::text = 'Cancelada' THEN 'Cancelada'
    ELSE 'Agendada'
END;

-- Agora alterar o tipo da coluna
ALTER TABLE rotas ALTER COLUMN status TYPE public.status_rota_enum USING status::text::public.status_rota_enum;

-- Verificar o resultado
SELECT DISTINCT status::text as status_atual FROM rotas ORDER BY status_atual;
