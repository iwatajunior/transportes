-- Script para corrigir o tipo de veículo
DO $$
BEGIN
    -- Remover o tipo existente
    DROP TYPE IF EXISTS tipo_veiculo;

    -- Criar o novo tipo com os valores corretos
    CREATE TYPE tipo_veiculo AS ENUM (
        'carro',
        'van',
        'ônibus',
        'moto',
        'caminhão'
    );

    -- Atualizar os registros existentes para usar os valores em minúsculas
    UPDATE veiculos 
    SET tipo = LOWER(tipo);

    -- Alterar o tipo da coluna para o novo tipo ENUM
    ALTER TABLE veiculos 
    ALTER COLUMN tipo TYPE tipo_veiculo 
    USING tipo::text::tipo_veiculo;

    -- Verificar se a atualização foi bem-sucedida
    RAISE NOTICE 'Tipos de veículo atualizados com sucesso!';
END $$;
