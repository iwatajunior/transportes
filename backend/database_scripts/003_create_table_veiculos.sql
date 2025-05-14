-- Criação da tabela Veiculos

CREATE TABLE Veiculos (
    VeiculoID SERIAL PRIMARY KEY,
    Placa VARCHAR(10) UNIQUE NOT NULL,
    Modelo VARCHAR(100) NOT NULL,
    Marca VARCHAR(100) NOT NULL,
    Ano INT NOT NULL,
    Tipo tipo_veiculo NOT NULL, -- Referencia o ENUM tipo_veiculo
    Capacidade INT, -- Número de passageiros/carga
    Status status_veiculo DEFAULT 'Disponível', -- Referencia o ENUM status_veiculo
    QuilometragemAtual INT DEFAULT 0,
    DataAquisicao DATE,
    UltimaManutencao DATE,
    DataProximaRevisao DATE,          -- Nova coluna
    Observacoes TEXT,
    UsuarioResponsavelID INT,       -- Nova coluna
    CONSTRAINT fk_usuario_responsavel
        FOREIGN KEY(UsuarioResponsavelID) 
        REFERENCES Usuarios(UserID) -- ATENÇÃO: Verifique se a PK em Usuarios é UserID
);

-- Índices para otimização
CREATE INDEX idx_veiculos_placa ON Veiculos(Placa);
CREATE INDEX idx_veiculos_tipo ON Veiculos(Tipo);
CREATE INDEX idx_veiculos_status ON Veiculos(Status);
CREATE INDEX idx_veiculos_responsavel ON Veiculos(UsuarioResponsavelID); -- Novo índice opcional

COMMIT;