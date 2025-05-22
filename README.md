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

NOTA DE VALIDAÇÃO DA ÁREA DE NEGÓCIO:
identificar ida e retorno na solicitação da viagem
Pesquisa de satisfação do usuário, escala de satisfação e observação, obrigatoriedade para novas viagens, avaliar a ultima concluida (permissão para visualizar comentário das avaliações apenas gestor, média pode ser visualizada por motoristas)
Adicionar despesas da rota
Augusto: inserir alocação de recurso de viagem, alterar status da viagem

Carla
Atribuições de rotas, contran ou gecop?
modelos de relatórios
