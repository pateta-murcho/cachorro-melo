# 🧪 GUIA DE TESTE - SISTEMA DE ENTREGA DO MOTOBOY

## ✅ PRÉ-REQUISITOS
1. Backend rodando em `http://localhost:3001`
2. Frontend rodando em `http://localhost:8080`
3. Ter pedidos com status `READY` ou `CONFIRMED` no banco de dados

## 📋 PASSO A PASSO DO TESTE

### 1️⃣ FAZER LOGIN COMO MOTOBOY
- Acesse: http://localhost:8080/deliverer/login
- Credenciais de teste:
  - **Telefone:** 11988776655
  - **Senha:** motoboy123
- Clique em "Entrar"
  
**Console esperado:**
```
🚀 [API] Iniciando login...
✅ [API] Login realizado com sucesso
```

---

### 2️⃣ DASHBOARD - SELECIONAR PEDIDOS
- Você será redirecionado para: http://localhost:8080/motoboy
- Veja a lista de pedidos disponíveis (status READY/CONFIRMED)
- Marque a caixa de seleção dos pedidos que deseja entregar
- Clique no botão **"Iniciar Entrega"**

**Console esperado:**
```
🚀 [Dashboard] Iniciando entrega com pedidos: ["id-do-pedido"]
🚀 [API] Iniciando entrega: ["id-do-pedido"]
🚀 [API] URL: http://localhost:3001/api/deliverer/start-delivery
🚀 [API] Status: 200
🚀 [API] Data: {success: true, ...}
🔄 [Dashboard] Recarregando pedidos...
➡️ [Dashboard] Navegando para /entregando
```

---

### 3️⃣ PÁGINA DE ENTREGA (/entregando)
- Você será redirecionado automaticamente para: http://localhost:8080/entregando
- A página deve carregar suas entregas ativas

**Console esperado:**
```
📦 [DeliveringPage] Buscando entregas...
🔑 Token: Presente
👤 Deliverer Data: {"id": "...", "name": "..."}
🔍 [API] Buscando minhas entregas...
🔍 [API] URL: http://localhost:3001/api/deliverer/my-deliveries
🔍 [API] Headers: {Authorization: "Bearer token-deliverer-..."}
🔍 [API] Status: 200
🔍 [API] Data: {success: true, data: [...]}
✅ N entregas carregadas: [...]
```

**O que você deve ver:**
- Sidebar do motoboy (desktop) ou navegação mobile
- Card da entrega atual com:
  - Nome do cliente
  - Endereço de entrega
  - Total do pedido
  - Lista de itens
  - Animação do mapa (barra de progresso simulando navegação)
- Botão "Confirmar Entrega" (habilitado quando animação terminar)

---

### 4️⃣ CONFIRMAR ENTREGA
- Aguarde a animação do mapa completar (60 segundos)
- O botão "Confirmar Entrega" ficará verde
- Clique no botão
- Digite o código de entrega de 3 dígitos (veja no console do backend ou no card)
- Clique em "Confirmar"

**Console esperado:**
```
✅ Confirmando entrega...
✅ Entrega confirmada!
```

**Fluxo após confirmação:**
- Se houver mais entregas: vai para a próxima
- Se for a última: volta para /motoboy com mensagem de sucesso

---

## 🐛 POSSÍVEIS ERROS E SOLUÇÕES

### ❌ Erro: "Erro ao buscar entregas"
**Causas possíveis:**
1. **Não há pedidos com status OUT_FOR_DELIVERY**
   - Solução: Volte para /motoboy e inicie uma entrega
   
2. **Token de autenticação inválido**
   - Solução: Faça logout e login novamente
   - Console: Verifique se `localStorage.getItem('delivererToken')` existe
   
3. **Backend não está respondendo**
   - Solução: Verifique se http://localhost:3001/api/health responde
   - Terminal backend: Deve mostrar "🚀 SERVIDOR CACHORROMELO FUNCIONANDO!"

### ❌ Página /entregando em branco
**Causas possíveis:**
1. **JavaScript error no console**
   - Abra DevTools (F12) e veja a aba Console
   
2. **Imports do React falhando**
   - Terminal frontend: Verifique se há erros de build

### ❌ Pedidos não aparecem em /motoboy
**Causas possíveis:**
1. **Não há pedidos com status READY ou CONFIRMED**
   - Solução: Crie pedidos pelo site principal
   - Ou use o painel admin para mudar status de pedidos

### ❌ Código OTP incorreto
**Solução:**
- O código correto está no console do backend quando o pedido é criado
- Ou consulte diretamente no banco de dados (coluna `delivery_code` da tabela `orders`)

---

## 🔍 LOGS DO BACKEND

Quando você iniciar uma entrega, o backend deve mostrar:

```
🚀 Iniciando entrega: [ 'id-do-pedido' ]
✅ Entregas iniciadas com sucesso
```

Quando você buscar suas entregas:

```
📦 Buscando entregas do motoboy: id-do-deliverer
✅ N entregas em andamento
```

Quando confirmar uma entrega:

```
✅ Confirmando entrega: id-do-pedido Código: 123
✅ Entrega confirmada com sucesso
```

---

## 📸 O QUE VOCÊ DEVE VER

### Tela de Login (/deliverer/login)
- Formulário simples com telefone e senha
- Credenciais de teste exibidas
- Botão "Entrar"

### Dashboard (/motoboy)
- **Desktop:** Sidebar à esquerda com info do motoboy
- **Mobile:** Header no topo + navegação inferior
- Cards de pedidos com checkbox
- Botão "Iniciar Entrega" fixo embaixo

### Página de Entrega (/entregando)
- Sidebar/Header do motoboy
- Card grande com:
  - Indicador "Entrega X de N"
  - Mapa animado (gradiente laranja/vermelho pulsando)
  - Barra de progresso
  - Informações do pedido
  - Lista de itens
  - Botão de confirmação (desabilitado durante navegação)

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Login funciona
- [ ] Dashboard lista pedidos
- [ ] Seleção de pedidos funciona
- [ ] "Iniciar Entrega" muda status dos pedidos
- [ ] /entregando carrega as entregas
- [ ] Animação do mapa funciona
- [ ] Progresso é atualizado
- [ ] Botão "Confirmar" habilita no final
- [ ] Código OTP valida corretamente
- [ ] Próxima entrega carrega após confirmação
- [ ] Volta para dashboard após última entrega
- [ ] Layout responsivo funciona no mobile

---

## 🆘 SUPPORT

Se algo não funcionar:
1. Abra o console do navegador (F12)
2. Copie TODOS os logs que aparecem
3. Verifique o terminal do backend
4. Me envie as mensagens de erro específicas

**Importante:** Os logs que adicionei mostram exatamente onde o problema está ocorrendo!
