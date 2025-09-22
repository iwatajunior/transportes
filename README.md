# Projeto TRANSPORTES

Este é um projeto para gerenciar informações sobre transportes para o SENAC.

## Visão Geral
O sistema permitirá o gerenciamento de solicitações de viagens, alocação de motoristas e veículos, acompanhamento de status e geração de relatórios.

## Perfis de Usuário
- **Requisitante:** Solicita viagens e acompanha o andamento.
- **Motorista:** Visualiza viagens alocadas, registra quilometragem.
- **Gestor:** Gerencia todo o fluxo, usuários, veículos, relatórios e dashboards.

## Tecnologias
- **Frontend:** React, Tailwind CSS (sugerido), Chart.js, Material UI
- **Backend:** Node.js, Express.js
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT

## Estrutura do Projeto
```
TRANSPORTES/
├── backend/        # Aplicação Node.js/Express
│   ├── src/
│   └── package.json
├── frontend/       # Aplicação React
│   ├── public/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## Próximos Passos (Desenvolvimento)
1.  Configurar o ambiente de desenvolvimento para backend e frontend.
2.  Implementar modelos e migrações do banco de dados (PostgreSQL).
3.  Desenvolver os endpoints da API no backend.
4.  Desenvolver os componentes e páginas da interface no frontend.
5.  Integrar frontend com backend.
6.  Implementar autenticação e autorização.
7.  Testes.
8.  Deploy.

Sobre as Classes: 
Baseado na análise do código, as principais classes (models) do sistema são:

RouteModel (Modelo de Rota)
Gerencia as rotas de transporte
Atributos: identificação, cidade_origem, cidade_destino, cidades_intermediarias_ida/volta, data_saida, data_retorno, status
UserModel (Modelo de Usuário)
Gerencia os usuários do sistema
Atributos: userid, nome, email, perfil, setor, fotoperfilurl, ativo, datacadastro, senha, status
VehicleModel (Modelo de Veículo)
Gerencia os veículos do sistema
Atributos: placa, marca, modelo, ano, capacidade, tipo, tipo_uso, status, quilometragematual, ultimamanutencao, dataproximarevisao, observacoes, usuarioresponsavelid
MaterialModel (Modelo de Material)
Gerencia os materiais transportados
Atributos: tipo, quantidade, origem, destino, requisitante
TripModel (Modelo de Viagem)
Gerencia as viagens realizadas
Atributos: rota_id, veículo_id, motorista_id, data_inicio, data_fim, status
LoginAttemptModel (Modelo de Tentativa de Login)
Registra tentativas de login
Atributos: usuário, timestamp, sucesso, ip
Além dessas classes principais, o sistema também possui:

AuthController (Controlador de Autenticação)
RouteController (Controlador de Rotas)
UserController (Controlador de Usuários)
VehicleController (Controlador de Veículos)
MaterialController (Controlador de Materiais)
TripController (Controlador de Viagens)
Essas classes formam a estrutura principal do sistema, dividido em:

Gestão de Usuários
Gestão de Veículos
Gestão de Rotas
Gestão de Materiais
Gestão de Viagens
Sistema de Autenticação

