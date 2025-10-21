# 🌭 Cachorro Melo Delivery

Sistema completo de delivery de hot dogs com painel administrativo, sistema de entregadores e rastreamento em tempo real.

## 🚀 Tecnologias

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Shadcn/UI** - Componentes
- **React Router** - Roteamento

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Supabase** - Banco de dados e autenticação
- **Socket.IO** - Comunicação em tempo real
- **JWT** - Autenticação

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase (já configurada)

### 1. Clone o repositório
```bash
git clone https://github.com/pablo9hierro/cachorromelo-delivery.git
cd cachorromelo-delivery
```

### 2. Instale as dependências

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. Configure as variáveis de ambiente

Os arquivos `.env` já estão configurados. Se precisar alterar:

**Backend (.env)**
```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_supabase
JWT_SECRET=sua_chave_secreta
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

## 🎮 Como usar

### Opção 1: Script automático (Windows)
```bash
iniciar.bat
```

### Opção 2: Manual

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

Acesse:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 👥 Funcionalidades

### Para Clientes
- ✅ Catálogo de produtos
- ✅ Carrinho de compras
- ✅ Checkout com dados de entrega
- ✅ Rastreamento de pedidos em tempo real
- ✅ Histórico de pedidos

### Para Entregadores
- ✅ Login exclusivo
- ✅ Visualizar pedidos disponíveis
- ✅ Aceitar múltiplos pedidos
- ✅ Confirmar entrega com código OTP
- ✅ Atualização de status
- ✅ Rastreamento de localização

### Para Administradores
- ✅ Dashboard com métricas
- ✅ Gerenciamento de produtos
- ✅ Gerenciamento de categorias
- ✅ Visualização de pedidos
- ✅ Atualização de status de pedidos
- ✅ Relatórios e estatísticas

## 📱 Rotas da Aplicação

### Cliente
- `/` - Home/Catálogo
- `/menu` - Menu completo
- `/produto/:id` - Detalhes do produto
- `/checkout` - Finalizar compra
- `/pedidos` - Meus pedidos
- `/rastreamento/:id` - Rastreamento do pedido

### Entregador
- `/motoboy/login` - Login do entregador
- `/motoboy/dashboard` - Painel do entregador
- `/motoboy/entregando/:id` - Tela de entrega

### Admin
- `/admin/login` - Login administrativo
- `/admin/dashboard` - Painel administrativo
- `/admin/pedidos` - Gerenciar pedidos
- `/admin/produtos` - Gerenciar produtos
- `/admin/cozinha` - Tela da cozinha
- `/admin/usuarios` - Gerenciar usuários
- `/admin/relatorios` - Relatórios

## 🗄️ Estrutura do Banco de Dados

### Tabelas principais
- `products` - Produtos do cardápio
- `categories` - Categorias de produtos
- `orders` - Pedidos dos clientes
- `order_items` - Itens dos pedidos
- `customers` - Clientes cadastrados
- `deliverers` - Entregadores
- `admins` - Administradores
- `activity_logs` - Logs de atividades
- `notifications` - Notificações

## 🔐 Credenciais de Teste

### Admin
- **Email**: admin@cachorromelo.com
- **Senha**: admin123

### Entregador (criar no banco)
- **Telefone**: (XX) XXXXX-XXXX
- **Senha**: definir no cadastro

## 📡 API Endpoints

### Produtos
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Pedidos
```
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id/status
```

### Entregadores
```
POST   /api/deliverer/login
GET    /api/deliverer/available-orders
GET    /api/deliverer/my-deliveries
POST   /api/deliverer/start-delivery
POST   /api/deliverer/confirm-delivery
POST   /api/deliverer/update-location
POST   /api/deliverer/update-status
```

### Admin
```
POST   /api/auth/login
GET    /api/admin/dashboard
GET    /api/admin/orders
GET    /api/admin/reports/sales
GET    /api/admin/reports/products
```

## 🛠️ Scripts Disponíveis

### Frontend
```bash
npm run dev        # Inicia servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview da build
```

### Backend
```bash
npm run dev        # Inicia servidor com hot reload
npm run build      # Compila TypeScript
npm start          # Inicia servidor compilado
```

## 📝 Notas Importantes

1. **Sem Prisma**: O sistema usa apenas Supabase como banco de dados
2. **CORS**: Já configurado entre frontend e backend
3. **Real-time**: Socket.IO para atualizações em tempo real
4. **TypeScript**: Todo o código é tipado
5. **Validação**: Express-validator nas rotas

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se a porta 3001 está livre
- Confira as variáveis de ambiente
- Verifique conexão com Supabase

### Frontend não conecta
- Confirme que o backend está rodando
- Verifique CORS no backend
- Confira URL da API no .env

### Erro "Failed to fetch"
- Backend deve estar rodando
- Verifique firewall/antivírus
- Confirme URLs no .env

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do console (F12)
2. Verifique os logs do terminal do backend
3. Consulte `MIGRACAO_SUPABASE_COMPLETA.md`

## 📄 Licença

Projeto pessoal - Todos os direitos reservados

---

**Desenvolvido com ❤️ para o Cachorro Melo Delivery**
