-- Verificar os valores do tipo_veiculo_enum
SELECT unnest(enum_range(NULL::tipo_veiculo_enum))::text as tipo_veiculo_enum;

-- Verificar os valores do status_veiculo
SELECT unnest(enum_range(NULL::status_veiculo))::text as status_veiculo;

-- Verificar os valores do status_veiculo_enum
SELECT unnest(enum_range(NULL::status_veiculo_enum))::text as status_veiculo_enum;
