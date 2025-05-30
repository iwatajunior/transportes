-- 1. Criar um novo ENUM temporário com os valores corretos
CREATE TYPE tipo_veiculo_temp AS ENUM ('Carro', 'Van', 'Onibus', 'Caminhao', 'Moto');

-- 2. Atualizar a tabela veiculos para usar o novo ENUM
ALTER TABLE veiculos ADD COLUMN tipo_temp tipo_veiculo_temp;

-- 3. Migrar os dados
UPDATE veiculos 
SET tipo_temp = CASE 
    WHEN tipo_veiculo_enum IN ('CaminhaoPequeno', 'CaminhaoMedio', 'CaminhaoGrande') THEN 'Caminhao'
    ELSE tipo_veiculo_enum
END;

-- 4. Remover a coluna antiga e renomear a nova
ALTER TABLE veiculos DROP COLUMN tipo_veiculo_enum;
ALTER TABLE veiculos RENAME COLUMN tipo_temp TO tipo_veiculo_enum;

-- 5. Remover o ENUM antigo e renomear o novo
DROP TYPE tipo_veiculo_enum;
DROP TYPE tipo_veiculo_temp;

-- 6. Verificar os valores finais
SELECT unnest(enum_range(NULL::tipo_veiculo_enum))::text as tipo_veiculo_enum;
