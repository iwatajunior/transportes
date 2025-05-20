CREATE TABLE IF NOT EXISTS rotas (
    id SERIAL PRIMARY KEY,
    identificacao VARCHAR(255) NOT NULL,
    cidade_origem VARCHAR(100) NOT NULL,
    cidade_destino VARCHAR(100) NOT NULL,
    cidades_intermediarias_ida JSONB DEFAULT '[]',
    cidades_intermediarias_volta JSONB DEFAULT '[]',
    data_saida TIMESTAMP NOT NULL,
    data_retorno TIMESTAMP NOT NULL,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_datas CHECK (data_retorno > data_saida)
); 