# 🧪 GUIA DE TESTES - Sistema Cachorro Melo

## ✅ Checklist de Testes

### 1. Backend (http://localhost:3001)

#### 1.1 Health Check
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/health"
```
**Esperado**: Status 200, JSON com `status: "ok"`

#### 1.2 Produtos
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/products"
```
**Esperado**: Lista com 11 produtos

#### 1.3 Categorias
```bash
Invoke-WebRequest -Uri "http://localhost:3001/api/categories"
```
**Esperado**: Lista de categorias (Hot Dogs, Bebidas, Combos, etc)

---

### 2. Frontend (http://localhost:5173)

#### 2.1 Página Inicial
1. Acesse `http://localhost:5173`
2. **Verificar**:
   - ✅ Produtos carregam sem erro
   - ✅ Imagens dos produtos aparecem
   - ✅ Preços formatados corretamente
   - ✅ Botão "Adicionar ao carrinho" funciona

#### 2.2 Carrinho de Compras
1. Adicione 2-3 produtos diferentes
2. **Verificar**:
   - ✅ Contador do carrinho atualiza
   - ✅ Total calculado corretamente
   - ✅ Pode aumentar/diminuir quantidades
   - ✅ Pode remover itens

#### 2.3 Checkout
1. Clique em "Finalizar Pedido"
2. Preencha os dados:
   - Nome: Teste Cliente
   - Telefone: (11) 99999-9999
   - Endereço: Rua Teste, 123
   - Forma de pagamento: Escolha uma opção
3. Clique em "Fazer Pedido"
4. **Verificar**:
   - ✅ Pedido é criado
   - ✅ Redirecionado para página de confirmação
   - ✅ Código de rastreamento aparece

---

### 3. Sistema de Entregadores

#### 3.1 Criar Entregador (Supabase)
Antes de testar o login, crie um entregador no Supabase:

1. Acesse: https://lwwtfodpnqyceuqomopj.supabase.co
2. Vá em Table Editor > deliverers
3. Clique em "Insert" > "Insert row"
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

#### 3.2 Login Entregador
1. Acesse `http://localhost:5173/motoboy/login`
2. **Login**:
   - Telefone: 11999999999
   - Senha: 123456
3. **Verificar**:
   - ✅ Login bem-sucedido
   - ✅ Redirecionado para dashboard
   - ✅ Nome do motoboy aparece no topo

#### 3.3 Dashboard Entregador
1. **Verificar**:
   - ✅ Lista de pedidos disponíveis carrega
   - ✅ Botão "Pegar Pedidos" aparece
   - ✅ Status do motoboy mostra "Disponível"

#### 3.4 Fluxo de Entrega
1. Marque 1-2 pedidos
2. Clique em "Pegar Pedidos Selecionados"
3. **Verificar**:
   - ✅ Pedidos vão para "Minhas Entregas"
   - ✅ Código OTP aparece em cada pedido
   - ✅ Status muda para "Em entrega"

4. Clique em "Confirmar Entrega"
5. Digite o código OTP do pedido
6. **Verificar**:
   - ✅ Entrega confirmada
   - ✅ Pedido sai da lista
   - ✅ Total de entregas incrementa

---

### 4. Sistema Administrativo

#### 4.1 Login Admin
1. Acesse `http://localhost:5173/admin/login`
2. **Credenciais**:
   - Email: admin@cachorromelo.com
   - Senha: admin123
3. **Verificar**:
   - ✅ Login bem-sucedido
   - ✅ Redirecionado para dashboard

#### 4.2 Dashboard Admin
**Verificar**:
- ✅ Estatísticas carregam (pedidos hoje, receita, etc)
- ✅ Gráficos aparecem
- ✅ Lista de pedidos recentes
- ✅ Produtos mais vendidos

#### 4.3 Gerenciar Produtos
1. Vá em "Produtos"
2. **Verificar**:
   - ✅ Lista de produtos carrega
   - ✅ Pode filtrar por categoria
   - ✅ Pode editar produto
   - ✅ Pode adicionar novo produto
   - ✅ Pode alternar disponibilidade

#### 4.4 Gerenciar Pedidos
1. Vá em "Pedidos"
2. **Verificar**:
   - ✅ Lista de todos os pedidos
   - ✅ Pode filtrar por status
   - ✅ Pode atualizar status do pedido
   - ✅ Detalhes do pedido aparecem ao clicar

#### 4.5 Tela da Cozinha
1. Vá em "Cozinha"
2. **Verificar**:
   - ✅ Pedidos pendentes aparecem
   - ✅ Pode marcar como "Preparando"
   - ✅ Pode marcar como "Pronto"
   - ✅ Timer de preparação funciona

---

### 5. Testes de Integração

#### 5.1 Fluxo Completo do Pedido
1. **Cliente**: Faz pedido no site
2. **Verificar**: Pedido aparece no admin
3. **Cozinha**: Marca pedido como "Preparando"
4. **Verificar**: Status atualiza no rastreamento
5. **Cozinha**: Marca como "Pronto"
6. **Entregador**: Pega o pedido
7. **Verificar**: Status muda para "Em entrega"
8. **Entregador**: Confirma entrega com OTP
9. **Verificar**: Status final "Entregue"

#### 5.2 Teste de CORS
1. Abra o console do navegador (F12)
2. Faça uma ação (adicionar produto, fazer pedido)
3. **Verificar**:
   - ✅ Sem erros de CORS
   - ✅ Requisições retornam 200 OK
   - ✅ Dados aparecem corretamente

---

### 6. Testes de Performance

#### 6.1 Tempo de Resposta
**API Endpoints - Tempo esperado < 500ms**:
- ✅ GET /api/products
- ✅ GET /api/categories
- ✅ GET /api/orders
- ✅ POST /api/orders

#### 6.2 Carregamento de Página
**Tempo esperado < 2s**:
- ✅ Página inicial
- ✅ Dashboard admin
- ✅ Dashboard entregador

---

### 7. Testes de Erro

#### 7.1 Login Inválido
1. Tente login com credenciais erradas
2. **Verificar**:
   - ✅ Mensagem de erro aparece
   - ✅ Não redireciona
   - ✅ Campos não são limpos

#### 7.2 Campos Obrigatórios
1. Tente fazer pedido sem preencher campos
2. **Verificar**:
   - ✅ Validação funciona
   - ✅ Mensagens de erro claras
   - ✅ Campos marcados em vermelho

#### 7.3 Produto Indisponível
1. No admin, marque um produto como indisponível
2. No site, tente adicionar ao carrinho
3. **Verificar**:
   - ✅ Produto não aparece na listagem
   - OU
   - ✅ Botão "Indisponível" desabilitado

---

### 8. Testes de Responsividade

#### 8.1 Mobile
1. Abra DevTools (F12)
2. Ative modo responsivo
3. Teste nas resoluções:
   - 375x667 (iPhone SE)
   - 414x896 (iPhone XR)
   - 360x740 (Galaxy S9)

**Verificar**:
- ✅ Layout se adapta
- ✅ Menu mobile funciona
- ✅ Botões são clicáveis
- ✅ Texto legível

---

## 🐛 Problemas Comuns

### "Failed to fetch"
**Solução**: Verifique se o backend está rodando em localhost:3001

### CORS Error
**Solução**: Confirme CORS_ORIGIN no backend/.env

### Produtos não carregam
**Solução**: 
1. Verifique conexão com Supabase
2. Confirme dados na tabela products

### Login não funciona
**Solução**:
1. Verifique JWT_SECRET no backend
2. Confirme dados na tabela admins/deliverers

---

## ✅ Checklist Final

Marque conforme testar:

### Backend
- [ ] Health check funciona
- [ ] Produtos retornam corretamente
- [ ] Categorias retornam
- [ ] Pode criar pedido
- [ ] Autenticação funciona

### Frontend - Cliente
- [ ] Página inicial carrega
- [ ] Produtos aparecem
- [ ] Carrinho funciona
- [ ] Checkout funciona
- [ ] Rastreamento funciona

### Frontend - Entregador
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Pode pegar pedidos
- [ ] Pode confirmar entrega
- [ ] OTP valida corretamente

### Frontend - Admin
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Pode gerenciar produtos
- [ ] Pode gerenciar pedidos
- [ ] Estatísticas corretas

### Integração
- [ ] Fluxo completo funciona
- [ ] Real-time atualiza
- [ ] CORS sem erros
- [ ] Performance adequada

---

**Última atualização**: 21 de Outubro de 2025
