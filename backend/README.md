# Backend - Cachorro Melo Delivery

Backend do sistema de delivery de cachorro-quente desenvolvido com Node.js, Express, TypeScript e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** com **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **Socket.IO** - Comunicação em tempo real
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

## 🔧 Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   NODE_ENV=development
   PORT=3001
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/cachorromelo_delivery"
   JWT_SECRET=sua-chave-secreta-jwt
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Configurar banco de dados:**
   ```bash
   # Gerar cliente Prisma
   npm run db:generate
   
   # Executar migrações
   npm run db:migrate
   
   # Popular banco com dados iniciais
   npm run db:seed
   ```

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor em modo desenvolvimento

# Produção
npm run build           # Compila TypeScript
npm start              # Inicia servidor em produção

# Banco de dados
npm run db:generate    # Gera cliente Prisma
npm run db:migrate     # Executa migrações
npm run db:studio      # Abre Prisma Studio
npm run db:seed        # Popula banco com dados iniciais
npm run db:reset       # Reseta banco de dados
```

## 🗃️ Estrutura do Banco

### Entidades Principais

- **Categories** - Categorias de produtos
- **Products** - Produtos do cardápio
- **Customers** - Clientes
- **Orders** - Pedidos
- **OrderItems** - Itens dos pedidos
- **Admins** - Usuários administrativos

### Status de Pedidos

- `PENDING` - Aguardando confirmação
- `CONFIRMED` - Confirmado
- `PREPARING` - Em preparo
- `READY` - Pronto
- `OUT_FOR_DELIVERY` - Saiu para entrega
- `DELIVERED` - Entregue
- `CANCELLED` - Cancelado

## 🔐 Autenticação

O sistema usa JWT para autenticação de administradores. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <token>
```

### Usuário Admin Padrão
- **Email:** admin@cachorromelo.com
- **Senha:** admin123

## 📡 API Endpoints

### Públicos (sem autenticação)

#### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID

#### Categorias
- `GET /api/categories` - Listar categorias
- `GET /api/categories/:id` - Buscar categoria por ID

#### Pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders/tracking/:otp` - Rastrear pedido por OTP

#### Clientes
- `POST /api/customers` - Criar/atualizar cliente

#### Autenticação
- `POST /api/auth/login` - Login de admin
- `POST /api/auth/verify` - Verificar token

### Protegidos (requerem autenticação)

#### Admin
- `GET /api/admin/dashboard` - Dashboard com estatísticas
- `GET /api/admin/orders` - Listar pedidos (admin)
- `GET /api/admin/reports` - Relatórios

#### Gerenciamento de Produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

#### Gerenciamento de Categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Deletar categoria

#### Gerenciamento de Pedidos
- `PUT /api/orders/:id/status` - Atualizar status
- `PUT /api/orders/:id/payment` - Atualizar pagamento

## 🔄 Socket.IO Events

### Eventos Emitidos pelo Servidor

- `new-order` - Novo pedido criado
  ```javascript
  {
    orderId: string,
    customerName: string,
    total: number,
    itemsCount: number
  }
  ```

- `order-status-updated` - Status do pedido atualizado
  ```javascript
  {
    orderId: string,
    status: string,
    otp: string
  }
  ```

## 🛠️ Desenvolvimento

### Estrutura de Pastas

```
src/
├── middleware/          # Middlewares
│   ├── auth.ts         # Autenticação
│   ├── errorHandler.ts # Tratamento de erros
│   └── notFound.ts     # 404 handler
├── routes/             # Rotas da API
│   ├── admin.ts        # Rotas administrativas
│   ├── auth.ts         # Autenticação
│   ├── categories.ts   # Categorias
│   ├── customers.ts    # Clientes
│   ├── orders.ts       # Pedidos
│   └── products.ts     # Produtos
├── types/              # Tipos TypeScript
│   └── index.ts        # Tipos compartilhados
├── prisma/             # Configuração do banco
│   ├── schema.prisma   # Schema do banco
│   └── seed.ts         # Dados iniciais
└── server.ts           # Servidor principal
```

### Adicionando Novas Funcionalidades

1. **Nova rota:** Crie um arquivo em `src/routes/`
2. **Middleware:** Adicione em `src/middleware/`
3. **Tipos:** Defina em `src/types/`
4. **Banco:** Modifique `prisma/schema.prisma` e execute migração

## 🔍 Monitoramento

### Health Check
```bash
GET /health
```

Retorna status do servidor e informações básicas.

### Logs
O servidor usa Morgan para logging de requisições HTTP.

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco:**
   - Verifique se PostgreSQL está rodando
   - Confirme a URL de conexão no `.env`

2. **Erro de migração:**
   - Execute `npm run db:reset` para resetar o banco

3. **Erro de permissão:**
   - Verifique se o token JWT está válido
   - Confirme as roles do usuário

## 📞 Suporte

Para dúvidas ou problemas, consulte os logs do servidor ou verifique a documentação do Prisma.