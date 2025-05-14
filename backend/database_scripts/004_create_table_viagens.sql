-- Criação da tabela Viagens

CREATE TABLE Viagens (
    ViagemID SERIAL PRIMARY KEY,
    RequisitanteID INT NOT NULL,
    MotoristaID INT, -- Pode ser nulo até ser alocado
    VeiculoID INT,   -- Pode ser nulo até ser alocado
    Destino VARCHAR(255) NOT NULL,
    Motivo TEXT,
    DataHoraSaidaPrevista TIMESTAMP NOT NULL,
    DataHoraChegadaPrevista TIMESTAMP,
    DataHoraSaidaReal TIMESTAMP,
    DataHoraChegadaReal TIMESTAMP,
    QuilometragemSaida INT,
    QuilometragemChegada INT,
    Status status_viagem DEFAULT 'Solicitada', -- Referencia o ENUM status_viagem
    ObservacoesRequisitante TEXT,
    ObservacoesMotorista TEXT,
    ObservacoesGestor TEXT, -- Para aprovação/rejeição/alocação
    DataSolicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DataUltimaAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_viagens_requisitante FOREIGN KEY (RequisitanteID)
        REFERENCES Usuarios (UserID) ON DELETE RESTRICT, -- Não permitir deletar usuário com viagens

    CONSTRAINT fk_viagens_motorista FOREIGN KEY (MotoristaID)
        REFERENCES Usuarios (UserID) ON DELETE SET NULL, -- Se motorista for deletado, viagem fica sem motorista

    CONSTRAINT fk_viagens_veiculo FOREIGN KEY (VeiculoID)
        REFERENCES Veiculos (VeiculoID) ON DELETE SET NULL -- Se veículo for deletado, viagem fica sem veículo
);

-- Índices
CREATE INDEX idx_viagens_requisitante ON Viagens(RequisitanteID);
CREATE INDEX idx_viagens_motorista ON Viagens(MotoristaID); -- Corrigido
CREATE INDEX idx_viagens_veiculo ON Viagens(VeiculoID);     -- Corrigido
CREATE INDEX idx_viagens_status ON Viagens(Status);
CREATE INDEX idx_viagens_data_saida_prevista ON Viagens(DataHoraSaidaPrevista); -- Corrigido

-- Trigger para atualizar DataUltimaAtualizacao automaticamente
CREATE OR REPLACE FUNCTION atualizar_data_ultima_atualizacao_viagem()
RETURNS TRIGGER AS $$
BEGIN
    NEW.DataUltimaAtualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_viagem_ultima_atualizacao
BEFORE UPDATE ON Viagens
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_ultima_atualizacao_viagem();

COMMIT;