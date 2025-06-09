-- Primeiro, verificar se o enum já existe
DROP TYPE IF EXISTS status_rota_enum CASCADE;

-- Criar o enum de status de rotas
CREATE TYPE status_rota_enum AS ENUM (
    'Agendada',
    'Andamento',
    'Concluida',
    'Cancelada'
);

-- Verificar se a coluna já existe
ALTER TABLE rotas 
DROP COLUMN IF EXISTS status;

-- Adicionar a coluna com o novo enum
ALTER TABLE rotas
ADD COLUMN status status_rota_enum NOT NULL DEFAULT 'Agendada';

-- Verificar se a tabela foi atualizada corretamente
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'rotas' AND column_name = 'status';

-- Listar os valores do enum
SELECT unnest(enum_range(NULL::status_rota_enum))::text as status;
