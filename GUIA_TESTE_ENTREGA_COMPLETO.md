# 🧪 GUIA DE TESTE - SISTEMA DE ENTREGAS COMPLETO

## 🎯 Objetivo
Testar o fluxo completo de entrega desde o pedido do cliente até a confirmação pelo motoboy.

## 📋 Pré-requisitos
- Backend rodando: `http://localhost:3001`
- Frontend rodando: `http://localhost:8080`
- Motoboy cadastrado: `11988776655` / `motoboy123`

---

## 🛒 PARTE 1: Cliente faz pedido

### 1. Acessar cardápio
```
URL: http://localhost:8080/cardapio
```

### 2. Adicionar produtos ao carrinho
- Clique em qualquer produto
- Adicione quantidade
- Clique em "Adicionar ao Carrinho"

### 3. Ir para checkout
- Clique no ícone do carrinho (canto superior direito)
- Clique em "Finalizar Pedido"

### 4. Preencher dados
```
Nome: João Silva
Telefone: (11) 98765-4321
Email: joao@teste.com
Endereço: Rua Teste, 123 - Bairro Teste
Método de Pagamento: PIX
```

### 5. Confirmar pedido
- Clique em "Realizar Pedido"
- ✅ Você será redirecionado para `/meus-pedidos`

### 6. Verificar página de pedidos
- [ ] Status deve estar em "Confirmado" ou "Preparando"
- [ ] NÃO deve ver código de entrega ainda
- [ ] Timeline deve mostrar progresso

---

## 👨‍🍳 PARTE 2: Admin prepara pedido

### 1. Login admin
```
URL: http://localhost:8080/admin/login
Email: admin@admin.com
Senha: admin123
```

### 2. Ir para Cozinha
```
URL: http://localhost:8080/admin/cozinha
```

### 3. Mudar status do pedido
- Encontre o pedido criado
- Clique em "Pronto para Entrega"
- ✅ Status muda para READY

---

## 🏍️ PARTE 3: Motoboy pega pedido

### 1. Login motoboy
```
URL: http://localhost:8080/deliverer/login
Telefone: 11988776655
Senha: motoboy123
```

### 2. Ver pedidos disponíveis
```
URL: http://localhost:8080/motoboy
```
- [ ] Deve ver o pedido com status READY
- [ ] Checkbox para selecionar pedido

### 3. Iniciar entrega
- Marque o checkbox do pedido
- Clique em "Iniciar Entrega"
- ✅ Será redirecionado para `/entregando`

### 4. Verificar página de entrega
- [ ] Deve ver "Entrega 1 de X"
- [ ] Informações do pedido (endereço, telefone, itens)
- [ ] Código OTP visível no card (3 dígitos)
- [ ] Botão "Iniciar Navegação"

---

## 📱 PARTE 4: Cliente vê código de entrega

### 1. Voltar para página do cliente
```
URL: http://localhost:8080/meus-pedidos
```

### 2. Atualizar página (F5)
- ✅ Status deve estar "Saiu para Entrega" 🏍️
- ✅ **CÓDIGO DE ENTREGA DEVE APARECER EM DESTAQUE**
- [ ] Código deve ter 3 dígitos
- [ ] Timeline deve mostrar "A Caminho"

**IMPORTANTE:** Anote o código de 3 dígitos! 📝

---

## 🚚 PARTE 5: Motoboy entrega

### 1. Voltar para página do motoboy
```
URL: http://localhost:8080/entregando
```

### 2. Simular navegação
- Clique em "Iniciar Navegação"
- [ ] Barra de progresso deve aumentar
- [ ] Emoji do motoboy deve animar
- Aguarde chegar a 100%

### 3. Confirmar entrega
- [ ] Deve aparecer mensagem "Você chegou ao destino!"
- [ ] Código OTP do pedido visível
- [ ] Campo para digitar código
- Digite o código de 3 dígitos (que o cliente viu)
- Clique em "Confirmar Entrega"

### 4. Verificar confirmação
- ✅ Toast de sucesso
- ✅ Se houver mais entregas, vai para a próxima
- ✅ Se foi a última, volta para `/motoboy`

---

## ✅ PARTE 6: Verificar status final

### 1. Cliente verifica pedido
```
URL: http://localhost:8080/meus-pedidos
```
- F5 para atualizar
- [ ] Status deve estar "Entregue" ✅
- [ ] Timeline completa até o final
- [ ] Código de entrega não aparece mais (já foi usado)

### 2. Admin verifica no dashboard
```
URL: http://localhost:8080/admin/dashboard
```
- [ ] Pedido deve estar com status DELIVERED
- [ ] Estatísticas devem estar atualizadas

---

## 🐛 Resolução de Problemas

### Backend não conecta
```powershell
cd backend
node src/server-ultra-simples.js
```

### Frontend não carrega
```powershell
npm run dev
```

### Erro "Token inválido"
- Faça logout e login novamente
- Limpe localStorage do navegador (F12 → Application → Storage → Clear)

### Código OTP não aparece
- Verifique se o status é OUT_FOR_DELIVERY
- Atualize a página (F5)
- Verifique logs do backend

### Erro ao confirmar entrega
- Verifique se digitou o código correto (3 dígitos)
- Verifique se o código corresponde ao do pedido
- Veja logs do backend para detalhes

---

## 📊 Checklist Completo

### Cliente
- [ ] Adiciona produto ao carrinho
- [ ] Finaliza pedido com dados
- [ ] É redirecionado para /meus-pedidos
- [ ] Vê status "Confirmado"
- [ ] Aguarda status mudar
- [ ] **Vê código de entrega quando motoboy sai**
- [ ] Informa código ao entregador
- [ ] Vê status "Entregue" ao final

### Admin
- [ ] Faz login
- [ ] Vê pedido na cozinha
- [ ] Muda status para "Pronto"

### Motoboy
- [ ] Faz login
- [ ] Vê pedidos disponíveis
- [ ] Seleciona e inicia entrega
- [ ] Vê código OTP na tela
- [ ] Navega até destino
- [ ] Pede código ao cliente
- [ ] Confirma entrega
- [ ] Pedido concluído

---

## 🎉 Sucesso!

Se todos os passos funcionaram, o sistema está **100% operacional**! 🚀

### Próximos testes sugeridos:
1. Múltiplas entregas simultâneas
2. Cancelamento de pedido
3. Código errado (deve rejeitar)
4. Pedidos sem customer_id
5. Performance com muitos pedidos

---

**Data do teste:** ____/____/________
**Testado por:** _________________
**Status:** [ ] ✅ Passou  [ ] ❌ Falhou
**Observações:** 
_________________________________
_________________________________
_________________________________
