# 🛠️ COMANDOS ÚTEIS - Cachorro Melo Delivery

## 🚀 Iniciar Sistema

### Método 1: Script Automático (Recomendado)
```bash
# Windows - Duplo clique ou:
.\iniciar.bat
```

### Método 2: Manual

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
npm run dev
```

---

## 📡 Testar API (PowerShell)

### Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Listar Produtos
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/products" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Listar Categorias
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/categories" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Listar Pedidos
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/orders" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Criar Pedido (exemplo)
```powershell
$body = @{
    customer_name = "Cliente Teste"
    customer_phone = "11999999999"
    customer_email = "teste@email.com"
    delivery_address = "Rua Teste, 123"
    payment_method = "PIX"
    items = @(
        @{
            product_id = "id-do-produto"
            quantity = 2
        }
    )
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/orders" -Method POST -Body $body -ContentType "application/json"
```

---

## 🗄️ Supabase - Comandos SQL Úteis

### Ver todos os produtos
```sql
SELECT * FROM products ORDER BY name;
```

### Ver produtos disponíveis
```sql
SELECT * FROM products WHERE available = true;
```

### Ver pedidos de hoje
```sql
SELECT * FROM orders 
WHERE DATE(created_at) = CURRENT_DATE 
ORDER BY created_at DESC;
```

### Ver pedidos pendentes
```sql
SELECT * FROM orders 
WHERE status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY')
ORDER BY created_at ASC;
```

### Ver entregadores disponíveis
```sql
SELECT * FROM deliverers 
WHERE status = 'AVAILABLE';
```

### Criar novo admin
```sql
INSERT INTO admins (name, email, password_hash, role, active)
VALUES (
  'Nome Admin',
  'email@admin.com',
  '$2a$10$exemplo_de_hash_bcrypt',
  'ADMIN',
  true
);
```

### Criar novo entregador
```sql
INSERT INTO deliverers (name, phone, password, email, vehicle_type, vehicle_plate, status, rating)
VALUES (
  'Entregador Teste',
  '11999999999',
  '123456',
  'entregador@teste.com',
  'MOTORCYCLE',
  'ABC1234',
  'AVAILABLE',
  5.0
);
```

### Resetar total de entregas de um motoboy
```sql
UPDATE deliverers 
SET total_deliveries = 0 
WHERE id = 'id-do-entregador';
```

### Ver estatísticas do dia
```sql
SELECT 
  COUNT(*) as total_pedidos,
  SUM(total) as receita_total,
  COUNT(*) FILTER (WHERE status = 'DELIVERED') as entregues,
  COUNT(*) FILTER (WHERE status IN ('PENDING', 'CONFIRMED', 'PREPARING')) as pendentes
FROM orders
WHERE DATE(created_at) = CURRENT_DATE;
```

---

## 🔍 Debug - Logs

### Ver logs do backend em tempo real
```bash
cd backend
npm run dev
# Logs aparecem automaticamente no console
```

### Logs importantes para procurar:
- `✅` - Sucesso
- `❌` - Erro
- `🔑` - Autenticação
- `📦` - Pedidos
- `🏍️` - Entregadores
- `📡` - Requisições API

---

## 📦 Instalar Novas Dependências

### Frontend
```bash
npm install nome-do-pacote
```

### Backend
```bash
cd backend
npm install nome-do-pacote
```

---

## 🔄 Atualizar Dependências

### Verificar pacotes desatualizados
```bash
npm outdated
```

### Atualizar todos os pacotes
```bash
npm update
```

---

## 🧹 Limpar e Reinstalar

### Frontend
```bash
# Deletar node_modules e package-lock
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstalar
npm install
```

### Backend
```bash
cd backend

# Deletar node_modules e package-lock
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstalar
npm install
```

---

## 🏗️ Build para Produção

### Frontend
```bash
npm run build

# Preview da build
npm run preview
```

### Backend
```bash
cd backend
npm run build

# Rodar versão compilada
npm start
```

---

## 🐛 Troubleshooting Rápido

### Porta 3001 ocupada
```powershell
# Ver processo usando porta 3001
netstat -ano | findstr :3001

# Matar processo (substitua PID)
taskkill /PID numero_do_pid /F
```

### Porta 5173 ocupada
```powershell
# Ver processo usando porta 5173
netstat -ano | findstr :5173

# Matar processo (substitua PID)
taskkill /PID numero_do_pid /F
```

### Limpar cache do navegador
```
Ctrl + Shift + Delete
ou
F12 > Network > Disable cache
```

### Resetar banco de dados local
**Cuidado: Isso apaga todos os dados!**
```sql
-- No Supabase SQL Editor
TRUNCATE orders, order_items, customers CASCADE;
```

---

## 📊 Monitoramento

### Ver uso de memória
```powershell
# Backend
Get-Process -Name node | Select-Object ProcessName, @{Name="Memory(MB)";Expression={[math]::Round($_.WS / 1MB, 2)}}
```

### Ver conexões ativas
```sql
-- No Supabase
SELECT * FROM pg_stat_activity 
WHERE datname = 'postgres';
```

---

## 🔐 Gerar Hash de Senha (bcrypt)

### Node.js
```javascript
const bcrypt = require('bcryptjs');
const senha = 'sua_senha_aqui';
const hash = bcrypt.hashSync(senha, 10);
console.log(hash);
```

### Executar
```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

---

## 🌐 URLs Importantes

### Desenvolvimento
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001
- Health: http://localhost:3001/health

### Supabase
- Dashboard: https://supabase.com/dashboard
- URL: https://lwwtfodpnqyceuqomopj.supabase.co
- Table Editor: https://supabase.com/dashboard/project/lwwtfodpnqyceuqomopj/editor

---

## 📝 Atalhos VSCode Úteis

- `Ctrl + J` - Toggle terminal
- `Ctrl + B` - Toggle sidebar
- `Ctrl + P` - Quick file open
- `Ctrl + Shift + P` - Command palette
- `Ctrl + \`` - Novo terminal
- `F12` - Go to definition
- `Shift + F12` - Find all references

---

## 🔄 Git (quando necessário)

### Status
```bash
git status
```

### Commit
```bash
git add .
git commit -m "Descrição das mudanças"
```

### Push
```bash
git push origin main
```

### Pull
```bash
git pull origin main
```

---

**Dica**: Mantenha este arquivo aberto durante o desenvolvimento! 📌
