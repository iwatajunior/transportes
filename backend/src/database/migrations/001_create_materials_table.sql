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

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_material_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
