CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    rota_id INTEGER NOT NULL,
    cidade_origem_id INTEGER NOT NULL,
    cidade_destino_id INTEGER NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'pendente',
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rota_id) REFERENCES rotas(id),
    FOREIGN KEY (cidade_origem_id) REFERENCES cidades(id),
    FOREIGN KEY (cidade_destino_id) REFERENCES cidades(id)
);
