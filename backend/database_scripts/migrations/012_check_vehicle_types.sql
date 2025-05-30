-- Verificar os valores atuais do ENUM tipo_veiculo
SELECT unnest(enum_range(NULL::tipo_veiculo))::text as values;

-- Verificar os valores atuais do ENUM tipo_veiculo_enum
SELECT unnest(enum_range(NULL::tipo_veiculo_enum))::text as values;

-- Verificar os valores atuais do ENUM status_tipo_veiculo_enum
SELECT unnest(enum_range(NULL::status_tipo_veiculo_enum))::text as values;
