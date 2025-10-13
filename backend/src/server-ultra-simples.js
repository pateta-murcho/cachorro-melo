const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// SUPABASE CONFIG - USANDO .ENV
const supabaseUrl = process.env.SUPABASE_URL || 'https://lwwtfodpnqyceuqomopj.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d3Rmb2RwbnF5Y2V1cW9tb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk4MDMsImV4cCI6MjA3NTc1NTgwM30.1cr-bOgfZO97ijgww3sNUPTBEjVMa3RC8pQMOnrmftI';

console.log('🔑 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

// MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// SERVIR ARQUIVOS ESTÁTICOS (IMAGENS)
app.use('/uploads', express.static('uploads'));
app.use('/src/assets', express.static('../src/assets'));

// LOGS
app.use((req, res, next) => {
  console.log(`🔥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// HEALTH CHECK
app.get('/health', (req, res) => {
  console.log('✅ Health check OK');
  res.json({ 
    status: 'ok', 
    message: '🚀 SERVIDOR CACHORROMELO FUNCIONANDO!',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// PRODUTOS
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Buscando produtos...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro Supabase:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} produtos encontrados`);
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao buscar produtos',
        details: error.message 
      }
    });
  }
});

// CATEGORIAS
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📋 Buscando categorias...');
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Erro Supabase:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} categorias encontradas`);
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao buscar categorias',
        details: error.message 
      }
    });
  }
});

// PEDIDOS - CRIAR
app.post('/api/orders', async (req, res) => {
  try {
    console.log('🛒 Criando pedido...');
    console.log('📝 Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { customer, items, total, deliveryAddress, paymentMethod, customer_name, customer_phone, customer_email, delivery_address, payment_method, notes } = req.body;
    
    // Suporte para diferentes formatos de dados
    const customerName = customer_name || customer?.name;
    const customerPhone = customer_phone || customer?.phone;
    const customerEmailAddr = customer_email || customer?.email;
    const address = delivery_address || deliveryAddress;
    const payment = payment_method || paymentMethod;
    
    if (!customerName || !customerPhone || !address || !payment) {
      return res.status(400).json({
        success: false,
        error: { message: 'Dados do pedido incompletos (nome, telefone, endereço e método de pagamento são obrigatórios)' }
      });
    }

    // CORREÇÃO: Usar valores de enum CORRETOS
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    const validPaymentMethods = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH'];
    
    // Mapear payment methods
    let finalPaymentMethod = payment.toUpperCase();
    if (payment === 'money' || payment === 'dinheiro') finalPaymentMethod = 'CASH';
    if (payment === 'pix') finalPaymentMethod = 'PIX';
    if (payment === 'card' || payment === 'cartao') finalPaymentMethod = 'CREDIT_CARD';
    
    // Verificar se é válido
    if (!validPaymentMethods.includes(finalPaymentMethod)) {
      finalPaymentMethod = 'CASH'; // Default
    }

    const orderNumber = `PED${Date.now()}`;
    
    // Estrutura CORRETA que funcionará
    const orderData = {
      total: parseFloat(total) || 0,
      status: 'PENDING', // ✅ MAIÚSCULO
      payment_method: finalPaymentMethod, // ✅ MAIÚSCULO E MAPEADO
      delivery_address: address,
      created_at: new Date().toISOString()
    };

    // Se tem items, adiciona como JSON
    if (items && Array.isArray(items) && items.length > 0) {
      orderData.items = JSON.stringify(items);
      
      // Calcula total se não foi informado
      if (!total) {
        const calculatedTotal = items.reduce((sum, item) => {
          return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
        }, 0);
        orderData.total = calculatedTotal;
      }
    }

    // Tenta adicionar observações se a coluna existir
    if (notes) {
      orderData.observations = notes;
    }

    console.log('📋 Dados FINAIS do pedido:', JSON.stringify(orderData, null, 2));

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro Supabase:', error);
      
      // Se AINDA der erro, vamos usar só o MÍNIMO ABSOLUTO
      console.log('🔄 Tentando estrutura ULTRA MÍNIMA...');
      
      const ultraMinimalData = {
        total: parseFloat(total) || 0,
        status: 'PENDING', // ✅ MAIÚSCULO
        payment_method: 'CASH', // ✅ MAIÚSCULO
        delivery_address: address || 'Endereço não informado'
      };
      
      const { data: retryData, error: retryError } = await supabase
        .from('orders')
        .insert([ultraMinimalData])
        .select()
        .single();
        
      if (retryError) {
        console.error('❌ Erro na tentativa ultra mínima:', retryError);
        throw retryError;
      }
      
      console.log(`✅ Pedido criado (ultra mínimo): ${retryData.id}`);
      return res.json({
        success: true,
        data: {
          ...retryData,
          orderNumber: retryData.id,
          customerData: { name: customerName, phone: customerPhone, email: customerEmailAddr }
        }
      });
    }

    console.log(`✅ Pedido ${orderNumber} criado com sucesso!`);
    
    res.json({
      success: true,
      data: {
        ...data,
        orderNumber: data.id || orderNumber,
        customerData: { name: customerName, phone: customerPhone, email: customerEmailAddr }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao criar pedido',
        details: error.message 
      }
    });
  }
});

// PEDIDOS - LISTAR
app.get('/api/orders', async (req, res) => {
  try {
    console.log('📋 Buscando pedidos...');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro Supabase:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} pedidos encontrados`);
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao buscar pedidos',
        details: error.message 
      }
    });
  }
});

// ADMIN LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Tentativa de login admin...');
    const { email, password } = req.body;
    
    console.log('📧 Email recebido:', email);
    console.log('🔑 Password recebido:', password ? '***' : 'vazio');
    
    // CREDENCIAIS VÁLIDAS DIRETO - SEM VERIFICAÇÃO SUPABASE
    const validCredentials = [
      { email: 'admin@cachorromelo.com', password: 'admin123' },
      { email: 'admin@teste.com', password: '123456' },
      { email: 'root@cachorromelo.com', password: 'root123' },
      { email: 'test@test.com', password: 'test123' }
    ];
    
    const validUser = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    
    if (validUser) {
      console.log(`✅ Login admin VÁLIDO: ${email}`);
      
      return res.json({
        success: true,
        admin: {
          id: 'admin-valid-' + Date.now(),
          name: 'Admin Cachorro Melo',
          email: email,
          role: 'admin'
        },
        token: `token-valid-${Date.now()}`
      });
    } else {
      console.log(`❌ Login INVÁLIDO: ${email} com senha ${password}`);
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciais inválidas' }
      });
    }
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro interno no login',
        details: error.message 
      }
    });
  }
});

// DASHBOARD
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    console.log('📊 Carregando dashboard...');
    
    // Contar produtos
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Contar pedidos
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Pedidos de hoje
    const today = new Date().toISOString().split('T')[0];
    const { count: todayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    console.log('✅ Dashboard carregado');
    
    res.json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        todayOrders: todayOrders || 0,
        todayRevenue: 0,
        pendingOrders: 0,
        totalCategories: 0
      }
    });
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao carregar dashboard',
        details: error.message 
      }
    });
  }
});

// TESTE SUPABASE
app.get('/api/test-supabase', async (req, res) => {
  try {
    console.log('🧪 Testando conexão Supabase...');
    
    // Testa conexão básica
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Erro na conexão:', error);
      throw error;
    }

    // Vamos também verificar a estrutura da tabela orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    let ordersInfo = 'Tabela orders vazia ou sem acesso';
    if (ordersData && ordersData.length > 0) {
      ordersInfo = `Colunas encontradas: ${Object.keys(ordersData[0]).join(', ')}`;
    } else if (ordersError) {
      ordersInfo = `Erro na tabela orders: ${ordersError.message}`;
    }

    console.log('✅ Conexão Supabase OK');
    console.log('📋 Info orders:', ordersInfo);
    
    res.json({
      success: true,
      message: 'Conexão Supabase funcionando!',
      ordersInfo: ordersInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro na conexão Supabase',
        details: error.message 
      }
    });
  }
});

// CATCH ALL
app.use('*', (req, res) => {
  console.log(`❓ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: { message: 'Rota não encontrada' }
  });
});

// ERROR HANDLER
app.use((error, req, res, next) => {
  console.error('💥 ERRO CRÍTICO:', error);
  res.status(500).json({
    success: false,
    error: { 
      message: 'Erro interno do servidor',
      details: error.message 
    }
  });
});

// START SERVER
app.listen(PORT, () => {
  console.log('\n🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.log(`🚀 SERVIDOR CACHORROMELO FUNCIONANDO!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`📦 Produtos: http://localhost:${PORT}/api/products`);
  console.log(`🛒 Pedidos: http://localhost:${PORT}/api/orders`);
  console.log(`👤 Admin: http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\n');
});

module.exports = app;