-- Criar tabela de tentativas de login
CREATE TABLE IF NOT EXISTS tentativas_login (
    id SERIAL PRIMARY KEY,
    userid INTEGER REFERENCES usuarios(userid),
    email VARCHAR(255) NOT NULL,
    data_tentativa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status BOOLEAN NOT NULL,
    motivo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tentativas_login_userid ON tentativas_login(userid);
CREATE INDEX IF NOT EXISTS idx_tentativas_login_email ON tentativas_login(email);
CREATE INDEX IF NOT EXISTS idx_tentativas_login_data ON tentativas_login(data_tentativa);

-- Adicionar comentários
COMMENT ON TABLE tentativas_login IS 'Registra todas as tentativas de login, bem-sucedidas ou não';
COMMENT ON COLUMN tentativas_login.userid IS 'ID do usuário (pode ser NULL se o usuário não for encontrado)';
COMMENT ON COLUMN tentativas_login.email IS 'Email usado na tentativa de login';
COMMENT ON COLUMN tentativas_login.data_tentativa IS 'Data e hora da tentativa';
COMMENT ON COLUMN tentativas_login.ip_address IS 'Endereço IP do cliente';
COMMENT ON COLUMN tentativas_login.user_agent IS 'User Agent do navegador';
COMMENT ON COLUMN tentativas_login.status IS 'True se o login foi bem-sucedido, False caso contrário';
COMMENT ON COLUMN tentativas_login.motivo IS 'Motivo da falha (se houver)';
COMMENT ON COLUMN tentativas_login.created_at IS 'Data de criação do registro'; 