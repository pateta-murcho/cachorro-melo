# 🏍️ Sistema de Entregas - Motoboy

Sistema completo de entregas para motoboys/entregadores do Cachorro Melo.

## 🎯 Funcionalidades

### 1. Autenticação de Entregador
- **Rota**: `/deliverer/login`
- Login com telefone e senha
- Credenciais de teste:
  - **Telefone**: 11988776655
  - **Senha**: motoboy123

### 2. Dashboard de Pedidos Disponíveis
- **Rota**: `/motoboy`
- Lista de pedidos com status READY, CONFIRMED ou PREPARING
- Seleção múltipla de pedidos
- Informações completas: cliente, endereço, itens, valor
- Iniciar entrega de múltiplos pedidos

### 3. Página de Entrega em Tempo Real
- **Rota**: `/entregando`
- Mapa interativo com simulação de navegação
- Visualização da rota em primeira pessoa
- Sistema de código OTP (3 dígitos)
- Confirmação de entrega

## 📊 Banco de Dados

### Tabela: `deliverers`
```sql
- id (UUID)
- name (VARCHAR)
- phone (VARCHAR) - UNIQUE
- email (VARCHAR)
- password (VARCHAR)
- vehicle_type (VARCHAR) - Default: 'MOTORCYCLE'
- vehicle_plate (VARCHAR)
- status (VARCHAR) - 'AVAILABLE', 'BUSY', 'OFFLINE'
- rating (DECIMAL)
- total_deliveries (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Campos adicionados em `orders`
```sql
- deliverer_id (UUID) - FK para deliverers
- delivery_code (VARCHAR(3)) - Código OTP
- delivery_started_at (TIMESTAMP)
- delivery_latitude (DECIMAL)
- delivery_longitude (DECIMAL)
```

## 🔌 API Endpoints

### POST /api/deliverer/login
Autenticação do motoboy
```json
{
  "phone": "11988776655",
  "password": "motoboy123"
}
```

### GET /api/deliverer/available-orders
Lista pedidos disponíveis para entrega (status READY/CONFIRMED)

### GET /api/deliverer/my-deliveries
Lista entregas em andamento do motoboy

### POST /api/deliverer/start-delivery
Iniciar entrega de pedidos selecionados
```json
{
  "orderIds": ["uuid1", "uuid2", "uuid3"]
}
```

### POST /api/deliverer/confirm-delivery
Confirmar entrega com código OTP
```json
{
  "orderId": "uuid",
  "deliveryCode": "123"
}
```

### POST /api/deliverer/update-location
Atualizar localização em tempo real
```json
{
  "latitude": -7.1195,
  "longitude": -34.8450
}
```

### POST /api/deliverer/update-status
Atualizar status do motoboy
```json
{
  "status": "AVAILABLE" | "BUSY" | "OFFLINE"
}
```

## 🎨 Componentes UI

### DelivererSidebar
- Navegação lateral (desktop) e inferior (mobile)
- Links para /motoboy e /entregando
- Informações do entregador
- Botão de logout

### DelivererLogin
- Formulário de login responsivo
- Validação de credenciais
- Feedback visual

### DelivererDashboard
- Grid de pedidos disponíveis
- Cards interativos com checkbox
- Estatísticas (disponíveis, selecionados, valor total)
- Botão de iniciar entrega

### DeliveringPage
- Mapa Leaflet com navegação simulada
- Animação de rota em primeira pessoa
- Card com informações do pedido
- Input para código de entrega
- Confirmação visual

## 🚀 Fluxo de Uso

1. **Login**: Motoboy faz login em `/deliverer/login`
2. **Visualizar Pedidos**: Dashboard `/motoboy` mostra pedidos disponíveis
3. **Selecionar Pedidos**: Motoboy seleciona um ou mais pedidos
4. **Iniciar Entrega**: Clica em "Iniciar Entrega"
   - Pedidos mudam para status `OUT_FOR_DELIVERY`
   - Motoboy é redirecionado para `/entregando`
5. **Navegação**: Sistema simula navegação até o destino
6. **Chegada**: Ao chegar, pede código ao cliente
7. **Confirmar**: Insere código OTP e confirma
   - Pedido muda para status `DELIVERED`
   - Próximo pedido ou volta ao dashboard

## 🗺️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Mapas**: Leaflet + React-Leaflet
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)

## 📱 Responsividade

- ✅ Mobile-first design
- ✅ Sidebar lateral (desktop) + Bottom Navigation (mobile)
- ✅ Cards otimizados para touch
- ✅ Mapa fullscreen em mobile
- ✅ Componentes adaptáveis

## 🧪 Teste o Sistema

1. Inicie o backend:
```bash
cd backend
node src/server-ultra-simples.js
```

2. Inicie o frontend:
```bash
npm run dev
```

3. Acesse:
   - Login: http://localhost:8080/deliverer/login
   - Use as credenciais de teste
   - Navegue pelas rotas autenticadas

## 🔐 Segurança

- JWT tokens no localStorage
- Middleware de autenticação nas rotas
- Validação de códigos OTP
- Proteção de rotas privadas

## 📈 Melhorias Futuras

- [ ] Integração com API real de mapas (Google Maps)
- [ ] Notificações push para novos pedidos
- [ ] Chat com cliente
- [ ] Histórico de entregas
- [ ] Sistema de avaliações
- [ ] Gamificação (badges, ranking)
