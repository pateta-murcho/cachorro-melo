const express = require('express');
const cors = require('cors');

console.log('🔥🔥🔥 SERVIDOR FINAL CACHORROMELO 🔥🔥🔥');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// 🩺 HEALTH CHECK
app.get('/health', (req, res) => {
  console.log('🩺 Health check solicitado');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'SERVIDOR FUNCIONANDO!'
  });
});

// 🧪 TESTE BÁSICO
app.get('/test', (req, res) => {
  console.log('🧪 Teste básico');
  res.json({ 
    success: true,
    message: 'Servidor funcionando perfeitamente!' 
  });
});

// 📦 PRODUTOS MOCK
app.get('/api/products', (req, res) => {
  console.log('📦 Produtos solicitados');
  const products = [
    {
      id: '1',
      name: 'Hot Dog Tradicional',
      description: 'Salsicha, batata palha, milho, ervilha',
      price: 8.50,
      available: true,
      featured: true
    },
    {
      id: '2', 
      name: 'Hot Dog Especial',
      description: 'Salsicha, queijo, bacon, batata palha',
      price: 12.90,
      available: true,
      featured: false
    }
  ];
  
  res.json({
    success: true,
    data: products
  });
});

// 🏷️ CATEGORIAS MOCK
app.get('/api/categories', (req, res) => {
  console.log('🏷️ Categorias solicitadas');
  const categories = [
    { id: '1', name: 'Hot Dogs', slug: 'hot-dogs' },
    { id: '2', name: 'Bebidas', slug: 'bebidas' }
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// 🛒 CRIAR PEDIDO MOCK
app.post('/api/orders', (req, res) => {
  console.log('🛒 Pedido recebido:', JSON.stringify(req.body, null, 2));
  
  const { customer, items, total } = req.body;
  
  if (!customer || !items || !total) {
    return res.status(400).json({
      success: false,
      error: { message: 'Dados obrigatórios faltando' }
    });
  }
  
  const orderNumber = 'PED-' + Date.now();
  console.log(`✅ Pedido ${orderNumber} criado com sucesso!`);
  
  res.json({
    success: true,
    data: {
      id: Date.now(),
      orderNumber: orderNumber,
      status: 'pending'
    }
  });
});

// 📋 BUSCAR PEDIDOS MOCK
app.get('/api/orders', (req, res) => {
  console.log('📋 Pedidos solicitados');
  res.json({
    success: true,
    data: []
  });
});

// 🔐 LOGIN ADMIN MOCK
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login admin:', req.body.email);
  
  const { email, password } = req.body;
  
  if (email === 'admin@cachorromelo.com' && password === 'admin123') {
    console.log('✅ Login OK');
    res.json({
      success: true,
      admin: {
        id: 1,
        name: 'Administrador',
        email: email,
        role: 'admin'
      },
      token: 'mock-token-' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      error: { message: 'Credenciais inválidas' }
    });
  }
});

// 📊 DASHBOARD MOCK
app.get('/api/admin/dashboard', (req, res) => {
  console.log('📊 Dashboard solicitado');
  res.json({
    success: true,
    data: {
      totalProducts: 11,
      totalOrders: 0,
      todayOrders: 0,
      todayRevenue: 0,
      pendingOrders: 0,
      recentOrders: []
    }
  });
});

// 🗄️ TESTE SUPABASE MOCK
app.get('/api/test-supabase', (req, res) => {
  console.log('🗄️ Teste Supabase solicitado');
  res.json({
    success: true,
    message: 'Supabase conectado (MOCK)',
    timestamp: new Date().toISOString()
  });
});

// ❌ 404
app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: { message: 'Rota não encontrada' }
  });
});

// 🚀 INICIAR SERVIDOR
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀🚀🚀 SERVIDOR CACHORROMELO FUNCIONANDO! 🚀🚀🚀');
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💡 Health: http://localhost:${PORT}/health`);
  console.log(`📦 Produtos: http://localhost:${PORT}/api/products`);
  console.log(`🏷️ Categorias: http://localhost:${PORT}/api/categories`);
  console.log(`🛒 Pedidos: http://localhost:${PORT}/api/orders`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log('✅✅✅ PRONTO PARA TODAS AS REQUISIÇÕES! ✅✅✅');
});

// Manter vivo
setInterval(() => {
  console.log(`⏰ Servidor ativo há ${Math.round(process.uptime())}s`);
}, 30000);

console.log('🎉 SISTEMA CACHORROMELO ONLINE! 🎉');