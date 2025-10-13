import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração Supabase
const supabaseUrl = 'https://lwwtfodpnqyceuqomopj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d3Rmb2RwbnF5Y2V1cW9tb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk4MDMsImV4cCI6MjA3NTc1NTgwM30.1cr-bOgfZO97ijgww3sNUPTBEjVMa3RC8pQMOnrmftI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://192.168.15.7:8080'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('🔧 Servidor inicializando...');
console.log('🔧 Supabase URL:', supabaseUrl);

// ====================================
// ROTAS DE TESTE
// ====================================

// Health check
app.get('/health', (req, res) => {
  console.log('🩺 Health check requisitado');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Teste Supabase
app.get('/test-supabase', async (req, res) => {
  console.log('🗄️ Testando conexão com Supabase...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      success: true,
      status: 'ok',
      message: 'Supabase conectado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Erro Supabase:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Erro ao conectar com Supabase',
      error: error.message
    });
  }
});

// Teste Supabase API
app.get('/api/test-supabase', async (req, res) => {
  console.log('🗄️ Testando conexão com Supabase via API...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      success: true,
      status: 'ok',
      message: 'Supabase conectado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Erro Supabase:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Erro ao conectar com Supabase',
      error: error.message
    });
  }
});

// ====================================
// ROTAS DA API
// ====================================

// Produtos
app.get('/api/products', async (req, res) => {
  console.log('📦 Buscando produtos...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ ${data?.length || 0} produtos encontrados`);
    res.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar produtos' }
    });
  }
});

// Categorias
app.get('/api/categories', async (req, res) => {
  console.log('🏷️ Buscando categorias...');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw error;

    console.log(`✅ ${data?.length || 0} categorias encontradas`);
    res.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar categorias' }
    });
  }
});

// Produtos por categoria
app.get('/api/categories/:slug/products', async (req, res) => {
  const { slug } = req.params;
  console.log(`🏷️ Buscando produtos da categoria: ${slug}`);
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner (
          id,
          name,
          slug
        )
      `)
      .eq('categories.slug', slug)
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ ${data?.length || 0} produtos encontrados para ${slug}`);
    res.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar produtos por categoria:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar produtos da categoria' }
    });
  }
});

// Criar pedido
app.post('/api/orders', async (req, res) => {
  console.log('🛒 Criando novo pedido...');
  console.log('Dados recebidos:', req.body);
  
  try {
    const { customer, items, total, deliveryAddress, paymentMethod } = req.body;

    // Validações básicas
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Dados do pedido inválidos' }
      });
    }

    // 1. Criar/buscar cliente
    let customerId;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customer.phone)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone: customer.phone,
          address: deliveryAddress || customer.address,
          email: customer.email || null
        })
        .select('id')
        .single();

      if (customerError) throw customerError;
      customerId = newCustomer.id;
    }

    // 2. Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        total_amount: total,
        delivery_address: deliveryAddress || customer.address,
        payment_method: paymentMethod || 'money',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Criar itens do pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    console.log(`✅ Pedido ${order.order_number} criado com sucesso!`);
    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        status: order.status
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao processar pedido' }
    });
  }
});

// Buscar pedidos
app.get('/api/orders', async (req, res) => {
  console.log('📋 Buscando pedidos...');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          id,
          name,
          phone,
          email
        ),
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ ${data?.length || 0} pedidos encontrados`);
    res.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar pedidos' }
    });
  }
});

// Login admin
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Tentativa de login admin...');
  const { email, password } = req.body;

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password) // Em produção usar hash real
      .eq('active', true)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciais inválidas' }
      });
    }

    console.log(`✅ Login bem-sucedido para ${admin.name}`);
    res.json({
      success: true,
      token: `mock-token-${Date.now()}`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro interno do servidor' }
    });
  }
});

// Dashboard stats
app.get('/api/admin/dashboard', async (req, res) => {
  console.log('📊 Buscando dados do dashboard...');
  
  try {
    // Buscar estatísticas
    const [
      { count: totalProducts },
      { count: totalCategories },
      { count: totalOrders },
      { count: todayOrders }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0])
    ]);

    // Buscar pedidos recentes
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        *,
        customers (name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        totalCategories: totalCategories || 0,
        totalOrders: totalOrders || 0,
        todayOrders: todayOrders || 0,
        todayRevenue: 0,
        pendingOrders: 0,
        recentOrders: recentOrders || []
      }
    });

  } catch (error: any) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao carregar dashboard' }
    });
  }
});

// ====================================
// MIDDLEWARE DE ERRO
// ====================================
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: { message: 'Erro interno do servidor' }
  });
});

// 404 para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Rota não encontrada' }
  });
});

// ====================================
// INICIAR SERVIDOR
// ====================================
app.listen(PORT, () => {
  console.log('🚀🚀🚀 SERVIDOR BACKEND FUNCIONANDO! 🚀🚀🚀');
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💡 Health: http://localhost:${PORT}/health`);
  console.log(`📦 Produtos: http://localhost:${PORT}/api/products`);
  console.log(`🏷️ Categorias: http://localhost:${PORT}/api/categories`);
  console.log('🌐 CORS habilitado para localhost:8080');
  console.log('✅ Pronto para receber requisições!');
});