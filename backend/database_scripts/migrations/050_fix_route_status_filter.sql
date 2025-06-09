-- Atualizar a função para usar o novo enum
CREATE OR REPLACE FUNCTION get_routes(only_active boolean)
RETURNS SETOF rotas AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM rotas
    WHERE (NOT only_active OR status = 'Agendada'::public.status_rota_enum)
    ORDER BY data_cadastro DESC;
END;
$$ LANGUAGE plpgsql;

-- Atualizar a query no model para usar a função
SELECT get_routes($1::boolean) as rotas;
