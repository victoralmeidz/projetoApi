# projetoApi

API de gerenciamento de pedidos composta por dois serviços independentes que compartilham o mesmo banco de dados PostgreSQL.

## Serviços

- **api** — API REST em TypeScript + Fastify para gerenciar pedidos
- **worker** — Job agendado em Java + Quarkus que confirma pedidos pendentes automaticamente
- **banco** — PostgreSQL via Docker com schema inicial

## Pré-requisitos

- Docker Desktop com integração WSL2 ativada
- Node.js 20+
- Java 21+

## Como rodar localmente

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/projetoApi.git
cd projetoApi
```

### 2. Suba o banco de dados
```bash
docker compose up -d
```

### 3. Configure as variáveis de ambiente da API
```bash
cd api
cp .env.example .env
```

### 4. Suba a API
```bash
cd api
npm install
npm run dev
```

A API estará disponível em `http://localhost:3000`

### 5. Suba o worker
```bash
cd worker
./mvnw quarkus:dev
```

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| DATABASE_URL | URL de conexão com o PostgreSQL | postgresql://postgres:postgres@localhost:5432/pedidos_db |
| PORT | Porta da API | 3000 |

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | /orders | Cria um novo pedido |
| GET | /orders | Lista pedidos com paginação |
| GET | /orders/:id | Detalha um pedido |
| PATCH | /orders/:id/status | Atualiza o status do pedido |

## Regras de negócio

- O campo `total` é calculado automaticamente ao criar o pedido
- Não é permitido cancelar um pedido com status `confirmed`
- Pedidos com status `pending` há mais de 10 minutos são confirmados automaticamente pelo worker

## Decisões técnicas

### Fastify em vez de Express
Fastify tem melhor performance, sistema de plugins nativo e suporte a TypeScript mais robusto.

### Zod para validação
Permite validar os dados em tempo de execução e gerar mensagens de erro descritivas por campo, diferente dos schemas nativos do Fastify que são mais verbosos.

### JSONB para o campo items
Permite armazenar e consultar o array de itens diretamente no PostgreSQL com suporte a índices e queries dentro do JSON.

### Índice composto (status, created_at)
O worker consulta pedidos filtrando por `status = 'pending'` e `created_at < NOW() - 10 minutos` a cada minuto. O índice composto nessas duas colunas evita varredura completa da tabela nessa query frequente.

### @Scheduled do Quarkus
Solução nativa do framework, sem necessidade de bibliotecas externas. O job não expõe endpoints HTTP — é um worker puro.