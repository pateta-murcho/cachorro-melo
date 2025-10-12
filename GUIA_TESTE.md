# 🧪 GUIA DE TESTE - INTEGRAÇÃO FRONTEND + BACKEND

## 🌐 URLs para Teste:
- **Frontend:** http://localhost:8081 
- **Backend API:** http://localhost:3001

## 📋 PASSO A PASSO PARA TESTAR:

### 1. 🎯 Teste Automático (Console do Navegador):
1. Abra http://localhost:8081 no navegador
2. Abra o Console (F12 > Console)
3. Aguarde 2 segundos - um teste será executado automaticamente
4. Se der erro, execute manualmente: `testarPedidoFrontend()`

### 2. 🛒 Teste Manual (Interface):
1. Vá para http://localhost:8081
2. Clique em "Ver Cardápio" 
3. Adicione produtos ao carrinho
4. Clique no ícone do carrinho
5. Clique em "Finalizar Pedido"
6. Preencha os dados:
   - Nome: Seu Nome
   - Telefone: 11999888777
   - Endereço: Rua Teste, 123
7. Escolha forma de pagamento
8. Clique em "Finalizar Pedido"

### 3. 🔍 Verificação:
- O pedido deve aparecer no banco Supabase
- Você deve receber uma confirmação
- O ID do pedido deve ser gerado

## 🚨 POSSÍVEIS PROBLEMAS:

### ❌ Erro de CORS:
- Verifique se backend está rodando na porta 3001
- Console deve mostrar: "CORS habilitado para múltiplas origens"

### ❌ Erro 404/500:
- Verifique se todas as rotas da API estão funcionando
- Teste: http://localhost:3001/health

### ❌ Frontend não carrega produtos:
- Verifique console do navegador
- Produtos devem carregar da API

## 🔧 DEBUGGING:

### Backend (Terminal):
```
cd backend
npm run dev
```

### Frontend (Terminal):
```
npm run dev
```

### Verificar Banco:
- Execute: `node test-frontend-backend.js`
- Ou consulte Supabase diretamente

## ✅ SUCESSO:
Quando funcionar, você verá:
- ✅ Produtos carregados da API
- ✅ Pedido criado no banco
- ✅ Confirmação na tela
- ✅ ID do pedido gerado

## 📊 STATUS ATUAL:
- Backend: ✅ Rodando porta 3001
- Frontend: ✅ Rodando porta 8081  
- Database: ✅ Supabase conectado
- Pedidos existentes: 1 (teste anterior)

🚀 **TESTE AGORA E ME FALE O RESULTADO!**