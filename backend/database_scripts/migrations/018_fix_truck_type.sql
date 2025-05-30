-- 1. Criar um novo ENUM com o valor correto
CREATE TYPE tipo_veiculo_temp AS ENUM ('Carro', 'Van', 'Onibus', 'Caminhao', 'Moto');

-- 2. Atualizar os dados
UPDATE veiculos 
SET tipo_veiculo_enum = CASE 
    WHEN tipo_veiculo_enum IN ('CaminhaoPequeno', 'CaminhaoMedio', 'CaminhaoGrande') THEN 'Caminhao'
    ELSE tipo_veiculo_enum
END;

-- 3. Remover o ENUM antigo
DROP TYPE tipo_veiculo_enum CASCADE;

-- 4. Renomear o novo ENUM
ALTER TYPE tipo_veiculo_temp RENAME TO tipo_veiculo_enum;

-- 5. Verificar os valores finais
SELECT unnest(enum_range(NULL::tipo_veiculo_enum))::text as tipo_veiculo_enum;
