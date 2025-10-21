# 🗺️ GUIA DE ROTAS - Cachorro Melo Delivery

## 🌐 URLs de Acesso Rápido

### 🏠 Cliente (Público)
- **Página Inicial**: http://localhost:5173/
- **Cardápio**: http://localhost:5173/cardapio
- **Checkout**: http://localhost:5173/checkout
- **Meus Pedidos**: http://localhost:5173/meus-pedidos
- **Rastreamento**: http://localhost:5173/pedido/:id

---

## 👨‍💼 ADMIN - Painel Administrativo

### 🔑 Login Admin
**URL**: http://localhost:5173/admin/login
**OU**: http://localhost:5173/admin

**Credenciais:**
- Email: `admin@cachorromelo.com`
- Senha: `admin123`

### 📊 Páginas Admin
Após fazer login, você tem acesso a:

1. **Dashboard**: http://localhost:5173/admin/dashboard
   - Visão geral do sistema
   - Estatísticas e métricas
   - Gráficos de vendas

2. **Produtos**: http://localhost:5173/admin/produtos
   - Lista todos os produtos
   - Adicionar: http://localhost:5173/admin/produtos/novo
   - Editar: http://localhost:5173/admin/produtos/:id

3. **Pedidos**: http://localhost:5173/admin/pedidos
   - Gerenciar todos os pedidos
   - Atualizar status
   - Ver detalhes

4. **Cozinha**: http://localhost:5173/admin/cozinha
   - Tela da cozinha
   - Pedidos em preparação
   - Marcar como pronto

5. **Usuários**: http://localhost:5173/admin/usuarios
   - Gerenciar usuários do sistema

6. **Relatórios**: http://localhost:5173/admin/relatorios
   - Relatórios e estatísticas
   - Análises de vendas

---

## 🏍️ MOTOBOY - Painel do Entregador

### 🔑 Login Motoboy
**URL**: http://localhost:5173/deliverer/login

**⚠️ IMPORTANTE**: Antes de fazer login, você precisa criar um entregador no Supabase!

#### Como criar um entregador:
1. Acesse: https://supabase.com/dashboard
2. Vá em: **Table Editor** > **deliverers**
3. Clique em: **Insert** > **Insert row**
4. Preencha:
   ```
   name: Motoboy Teste
   phone: 11999999999
   password: 123456
   email: motoboy@teste.com
   vehicle_type: MOTORCYCLE
   vehicle_plate: ABC1234
   status: AVAILABLE
   rating: 5.0
   total_deliveries: 0
   ```
5. Clique em **Save**

**Credenciais para testar:**
- Telefone: `11999999999`
- Senha: `123456`

### 🏍️ Páginas Motoboy
Após fazer login:

1. **Dashboard**: http://localhost:5173/motoboy
   - Ver pedidos disponíveis
   - Ver minhas entregas
   - Pegar pedidos

2. **Em entrega**: http://localhost:5173/entregando
   - Tela durante a entrega
   - Confirmar com código OTP

---

## 📱 Fluxo Completo

### Para ADMIN:
```
1. Acesse: http://localhost:5173/admin/login
2. Login: admin@cachorromelo.com / admin123
3. Você será redirecionado para: http://localhost:5173/admin/dashboard
4. Navegue pelas páginas usando o menu lateral
```

### Para MOTOBOY:
```
1. Crie entregador no Supabase (primeira vez)
2. Acesse: http://localhost:5173/deliverer/login
3. Login: 11999999999 / 123456
4. Você será redirecionado para: http://localhost:5173/motoboy
5. Veja pedidos e faça entregas
```

---

## 🔐 Resumo de Credenciais

### Admin
| Campo | Valor |
|-------|-------|
| URL | http://localhost:5173/admin/login |
| Email | admin@cachorromelo.com |
| Senha | admin123 |

### Motoboy (criar primeiro!)
| Campo | Valor |
|-------|-------|
| URL | http://localhost:5173/deliverer/login |
| Telefone | 11999999999 |
| Senha | 123456 |

---

## 🎯 Atalhos Rápidos

### Desenvolvimento Local
```bash
# Admin
http://localhost:5173/admin/login

# Motoboy
http://localhost:5173/deliverer/login

# Cliente
http://localhost:5173/
```

---

## 📋 Todas as Rotas

### Públicas (Cliente)
- `/` - Home
- `/cardapio` - Menu completo
- `/produto/:id` - Detalhe do produto
- `/checkout` - Finalizar compra
- `/pedido/:id` - Rastreamento
- `/meus-pedidos` - Histórico

### Admin
- `/admin` - Redirect para login
- `/admin/login` - Login
- `/admin/dashboard` - Dashboard
- `/admin/produtos` - Produtos
- `/admin/produtos/novo` - Novo produto
- `/admin/produtos/:id` - Editar produto
- `/admin/pedidos` - Pedidos
- `/admin/cozinha` - Cozinha
- `/admin/usuarios` - Usuários
- `/admin/relatorios` - Relatórios

### Motoboy
- `/deliverer/login` - Login
- `/motoboy` - Dashboard
- `/entregando` - Em entrega

---

## 🚀 Como testar agora mesmo:

### 1. Inicie o sistema:
```bash
.\iniciar.bat
```

### 2. Teste Admin:
1. Abra: http://localhost:5173/admin/login
2. Login com: admin@cachorromelo.com / admin123
3. Explore o dashboard!

### 3. Teste Motoboy:
1. Primeiro, crie entregador no Supabase (instruções acima)
2. Abra: http://localhost:5173/deliverer/login
3. Login com: 11999999999 / 123456
4. Veja pedidos disponíveis!

---

**🎉 Pronto para usar!**
