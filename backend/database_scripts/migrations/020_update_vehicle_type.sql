-- 1. Criar um novo ENUM temporário
CREATE TYPE tipo_veiculo_new AS ENUM ('Carro', 'Van', 'Onibus', 'Caminhao', 'Moto');

-- 2. Adicionar uma coluna temporária
ALTER TABLE veiculos ADD COLUMN tipo_temp tipo_veiculo_new;

-- 3. Migrar os dados existentes
UPDATE veiculos 
SET tipo_temp = tipo::text::tipo_veiculo_new;

-- 4. Remover a coluna antiga e renomear a nova
ALTER TABLE veiculos DROP COLUMN tipo;
ALTER TABLE veiculos RENAME COLUMN tipo_temp TO tipo;

-- 5. Remover o ENUM antigo
DROP TYPE tipo;

-- 6. Renomear o novo ENUM
ALTER TYPE tipo_veiculo_new RENAME TO tipo;

-- 7. Verificar os valores finais
SELECT unnest(enum_range(NULL::tipo))::text as tipo;
