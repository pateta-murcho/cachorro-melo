# 🎯 SISTEMA CACHORRO MELO - CONFIGURAÇÃO COMPLETA

## ✅ STATUS ATUAL:
- ✅ **Backend:** Rodando na porta 3001 
- ✅ **Frontend:** Rodando na porta 8080
- ✅ **Novo Supabase:** Configurado (lwwtfodpnqyceuqomopj)
- ✅ **MCP:** Configurado para novo projeto

## 🗄️ PRÓXIMO PASSO - CRIAR BANCO DE DADOS:

### 1. 📋 Execute o SQL no Supabase:
1. Acesse: https://supabase.com/dashboard/project/lwwtfodpnqyceuqomopj/sql
2. Abra o arquivo: `database-setup.sql`
3. Copie TODO o conteúdo 
4. Cole no SQL Editor do Supabase
5. Clique em "Run" para executar

### 2. ✅ Isso vai criar:
- **6 tabelas:** categories, products, customers, orders, order_items, admins
- **3 tipos enum:** order_status, payment_method, payment_status  
- **Dados iniciais:** 3 categorias + 6 produtos
- **Índices:** Para performance
- **Views:** Para consultas facilitadas

## 🧪 TESTAR O SISTEMA:

### Opção 1 - Interface Web:
1. Acesse: http://localhost:8080
2. Clique "Ver Cardápio"
3. Adicione produtos
4. Finalize pedido
5. Preencha dados
6. Confirme

### Opção 2 - Console do Navegador:
```javascript
// Cole no console (F12):
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend:', d))

fetch('http://localhost:3001/api/products')
  .then(r => r.json())
  .then(d => console.log('📦 Produtos:', d))
```

### Opção 3 - Teste de Pedido:
```javascript
// Criar pedido completo:
const pedido = {
  customer_name: 'Cliente Teste',
  customer_phone: '11999888777', 
  customer_email: 'teste@teste.com',
  delivery_address: 'Rua Teste, 123',
  payment_method: 'PIX',
  notes: 'Pedido de teste',
  items: [{ 
    product_id: 'ID_DO_PRODUTO', // Pegar da lista de produtos
    quantity: 1 
  }]
};

fetch('http://localhost:3001/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pedido)
}).then(r => r.json()).then(d => console.log('🎉 Resultado:', d));
```

## 📊 VERIFICAR RESULTADOS:

Após executar o SQL, verifique no Supabase:
- **Tabela products:** Deve ter 6 produtos
- **Tabela categories:** Deve ter 3 categorias  
- **Tabela orders:** Vazia (aguardando pedidos)

## 🔧 ARQUIVOS ATUALIZADOS:

- ✅ `mcp.json` → Novo projeto Supabase
- ✅ `backend/.env` → Novas credenciais
- ✅ `.env` → Variáveis do frontend
- ✅ `database-setup.sql` → Script completo do banco
- ✅ Backend e Frontend → Rodando

## 🚨 SE DER ERRO:

### ❌ "Failed to fetch":
1. Verifique se backend está na porta 3001
2. Teste: http://localhost:3001/health

### ❌ "Table does not exist":
1. Execute o `database-setup.sql` no Supabase
2. Verifique se todas as tabelas foram criadas

### ❌ CORS Error:
1. Backend deve mostrar: "CORS habilitado para todas as origens"
2. Se não, reinicie o backend

## 🎯 PRÓXIMOS PASSOS:

1. **EXECUTAR SQL:** Copie `database-setup.sql` no Supabase
2. **TESTAR:** Acesse http://localhost:8080
3. **FAZER PEDIDO:** Use a interface ou console
4. **VERIFICAR:** Dados no Supabase

---

🚀 **O SISTEMA ESTÁ 99% PRONTO!**

**Só falta executar o SQL no Supabase para criar as tabelas!**

**Execute o `database-setup.sql` e me avise quando estiver pronto!**