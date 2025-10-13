import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

console.log('🔥 INICIANDO SERVIDOR ULTRA ESTÁVEL 🔥');

const app = express();
const PORT = 3001;

// Supabase
const supabaseUrl = 'https://lwwtfodpnqyceuqomopj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d3Rmb2RwbnF5Y2V1cW9tb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk4MDMsImV4cCI6MjA3NTc1NTgwM30.1cr-bOgfZO97ijgww3sNUPTBEjVMa3RC8pQMOnrmftI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares básicos
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// 🩺 HEALTH CHECK - MAIS SIMPLES POSSÍVEL
app.get('/health', (req, res) => {
  console.log('🩺 Health check solicitado');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Servidor funcionando!'
  });
});

// 🗄️ TESTE SUPABASE
app.get('/api/test-supabase', async (req, res) => {
  console.log('🗄️ Testando Supabase...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    console.log('✅ Supabase conectado!');
    res.json({
      success: true,
      message: 'Supabase conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro Supabase:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro Supabase: ' + error.message }
    });
  }
});

// 📦 PRODUTOS
app.get('/api/products', async (req, res) => {
  console.log('📦 Buscando produtos...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} produtos encontrados`);
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Erro produtos:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar produtos' }
    });
  }
});

// 🏷️ CATEGORIAS
app.get('/api/categories', async (req, res) => {
  console.log('🏷️ Buscando categorias...');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} categorias encontradas`);
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Erro categorias:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar categorias' }
    });
  }
});

// 🛒 CRIAR PEDIDO
app.post('/api/orders', async (req, res) => {
  console.log('🛒 Criando pedido...');
  console.log('Dados:', JSON.stringify(req.body, null, 2));
  
  try {
    const { customer, items, total, deliveryAddress, paymentMethod } = req.body;

    // Validação básica
    if (!customer?.name || !customer?.phone || !items?.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'Dados obrigatórios faltando' }
      });
    }

    // 1. Criar cliente
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        address: deliveryAddress || customer.address || 'Não informado'
      })
      .select('id')
      .single();

    if (customerError) {
      console.error('❌ Erro ao criar cliente:', customerError);
      throw customerError;
    }

    // 2. Criar pedido
    const orderData = {
      customer_id: newCustomer.id,
      status: 'pending',
      total_amount: Number(total) || 0,
      delivery_address: deliveryAddress || customer.address || 'Não informado',
      payment_method: paymentMethod || 'money',
      payment_status: 'pending',
      notes: req.body.notes || null
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Erro ao criar pedido:', orderError);
      throw orderError;
    }

    // 3. Criar itens
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId || 'unknown',
      product_name: item.name || 'Produto',
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.price) || 0,
      total_price: Number(item.price) * Number(item.quantity) || 0
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Erro ao criar itens:', itemsError);
      throw itemsError;
    }

    console.log(`✅ Pedido ${order.order_number} criado!`);
    res.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status
      }
    });

  } catch (error) {
    console.error('❌ Erro geral ao criar pedido:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao processar pedido: ' + error.message }
    });
  }
});

// 📋 BUSCAR PEDIDOS
app.get('/api/orders', async (req, res) => {
  console.log('📋 Buscando pedidos...');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (name, phone, email),
        order_items (product_name, quantity, unit_price, total_price)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} pedidos encontrados`);
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Erro buscar pedidos:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar pedidos' }
    });
  }
});

// 🔐 LOGIN ADMIN
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login admin...');
  const { email, password } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciais inválidas' }
      });
    }

    console.log(`✅ Login OK: ${data.name}`);
    res.json({
      success: true,
      admin: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      },
      token: 'mock-token-' + Date.now()
    });
  } catch (error) {
    console.error('❌ Erro login:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro no login' }
    });
  }
});

// 📊 DASHBOARD
app.get('/api/admin/dashboard', async (req, res) => {
  console.log('📊 Dashboard...');
  try {
    const [
      { count: totalProducts },
      { count: totalOrders },
      { count: todayOrders }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0])
    ]);

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, customers(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    const stats = {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      todayOrders: todayOrders || 0,
      todayRevenue: 0,
      pendingOrders: 0,
      recentOrders: recentOrders || []
    };

    console.log('✅ Dashboard OK');
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erro dashboard:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro no dashboard' }
    });
  }
});

// ❌ ROTA 404
app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: { message: 'Rota não encontrada' }
  });
});

// 🚨 TRATAMENTO DE ERRO
app.use((error, req, res, next) => {
  console.error('🚨 Erro no servidor:', error);
  res.status(500).json({
    success: false,
    error: { message: 'Erro interno do servidor' }
  });
});

// 🚀 INICIAR SERVIDOR
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀🚀🚀 SERVIDOR ULTRA ESTÁVEL FUNCIONANDO! 🚀🚀🚀');
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💡 Health: http://localhost:${PORT}/health`);
  console.log(`📦 Produtos: http://localhost:${PORT}/api/products`);
  console.log('✅ Pronto para TODAS as requisições!');
});

server.on('error', (error) => {
  console.error('🚨 ERRO NO SERVIDOR:', error);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 EXCEÇÃO NÃO CAPTURADA:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 PROMISE REJEITADA:', reason);
});