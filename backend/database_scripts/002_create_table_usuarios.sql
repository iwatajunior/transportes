-- Criação da tabela Usuarios

CREATE TABLE Usuarios (
    UserID SERIAL PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Senha VARCHAR(255) NOT NULL, -- Armazenar hash da senha
    Perfil tipo_perfil_usuario NOT NULL,
    Setor VARCHAR(100), -- Pode ser um ENUM se os setores forem fixos
    FotoPerfilURL VARCHAR(500),
    Ativo BOOLEAN DEFAULT TRUE,
    DataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UltimoLogin TIMESTAMP
);

-- Índices para otimização de buscas comuns
CREATE INDEX idx_usuarios_email ON Usuarios(Email);
CREATE INDEX idx_usuarios_perfil ON Usuarios(Perfil);

COMMIT;
