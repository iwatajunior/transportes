-- 1. Remover o ENUM antigo e a coluna temporária
DROP TYPE IF EXISTS status_veiculo_new CASCADE;
ALTER TABLE veiculos DROP COLUMN IF EXISTS status_temp;

-- 2. Criar um novo ENUM com os valores corretos
CREATE TYPE status_veiculo_new AS ENUM ('Disponivel', 'Indisponivel', 'EmManutencao');

-- 3. Adicionar uma coluna temporária
ALTER TABLE veiculos ADD COLUMN status_temp status_veiculo_new;

-- 4. Migrar os dados existentes
UPDATE veiculos 
SET status_temp = CASE 
    WHEN status::text IN ('DisponÝvel', 'Disponivel') THEN 'Disponivel'::status_veiculo_new
    WHEN status::text IN ('Em ManutenþÒo', 'EmManutencao') THEN 'EmManutencao'::status_veiculo_new
    WHEN status::text IN ('Em Viagem', 'IndisponÝvel', 'Indisponivel', 'Inativo') THEN 'Indisponivel'::status_veiculo_new
END;

-- 5. Remover a coluna antiga e renomear a nova
ALTER TABLE veiculos DROP COLUMN status;
ALTER TABLE veiculos RENAME COLUMN status_temp TO status;

-- 6. Remover o ENUM antigo
DROP TYPE status_veiculo CASCADE;

-- 7. Renomear o novo ENUM
ALTER TYPE status_veiculo_new RENAME TO status_veiculo;

-- 8. Verificar os valores finais
SELECT unnest(enum_range(NULL::status_veiculo))::text as status_enum;
SELECT status::text as status, COUNT(*) as quantidade FROM veiculos GROUP BY status ORDER BY status;
