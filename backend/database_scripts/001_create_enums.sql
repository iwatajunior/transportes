-- Definição dos ENUMs

CREATE TYPE tipo_perfil_usuario AS ENUM (
    'Requisitante',
    'Motorista',
    'Gestor'
);

CREATE TYPE tipo_veiculo AS ENUM (
    'Carro',
    'Van',
    'Ônibus',
    'Moto'
);

CREATE TYPE status_veiculo AS ENUM (
    'Disponível',
    'Em Manutenção',
    'Em Viagem',
    'Indisponível'
);

CREATE TYPE status_viagem AS ENUM (
    'Solicitada',
    'Aprovada',
    'Rejeitada',
    'Alocada',
    'Em Andamento',
    'Concluída',
    'Cancelada'
);

-- Adicionar um tipo para Setor, se for uma lista finita e conhecida
-- Exemplo: CREATE TYPE tipo_setor AS ENUM ('Administrativo', 'Financeiro', 'TI', 'RH');
-- Por enquanto, manteremos Setor como VARCHAR na tabela Usuarios, pois pode variar muito.

COMMIT;
