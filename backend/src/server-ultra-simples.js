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

// MIDDLEWARE - CORS flexível para qualquer porta localhost
app.use(cors({
  origin: (origin, callback) => {
    // Permite qualquer localhost ou sem origin (Postman, etc)
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, true); // Libera tudo em dev
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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

// ROTAS IMPORTADAS
const delivererRoutes = require('./routes/deliverer');
app.use('/api/deliverer', delivererRoutes);

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

// CRIAR PRODUTO
app.post('/api/products', async (req, res) => {
  try {
    console.log('➕ Criando produto...');
    console.log('Dados recebidos:', req.body);
    
    const { name, description, price, category_id, image_url, available, featured, preparation_time, ingredients } = req.body;
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      category_id,
      image_url: image_url || null,
      available: available !== undefined ? available : true,
      featured: featured || false,
      preparation_time: preparation_time || 15,
      ingredients: ingredients || []
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar produto:', error);
      throw error;
    }

    console.log('✅ Produto criado:', data.id);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao criar produto',
        details: error.message 
      }
    });
  }
});

// ATUALIZAR PRODUTO
app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('✏️ Atualizando produto:', req.params.id);
    
    const { name, description, price, category_id, image_url, available, featured, preparation_time, ingredients } = req.body;
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      category_id,
      image_url,
      available,
      featured,
      preparation_time,
      ingredients,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }

    console.log('✅ Produto atualizado');
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao atualizar produto',
        details: error.message 
      }
    });
  }
});

// DELETAR PRODUTO
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('🗑️ Deletando produto:', req.params.id);
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('❌ Erro ao deletar produto:', error);
      throw error;
    }

    console.log('✅ Produto deletado');
    
    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar produto:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao deletar produto',
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

    // PASSO 1: CRIAR OU BUSCAR CLIENTE
    console.log('👤 Criando/buscando cliente:', customerPhone);
    
    // Buscar cliente existente pelo telefone
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', customerPhone)
      .single();

    let customerId;
    
    if (existingCustomer) {
      // Atualizar dados do cliente se mudaram
      console.log('📝 Cliente existente encontrado:', existingCustomer.id);
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({
          name: customerName,
          email: customerEmailAddr || existingCustomer.email,
          address: address
        })
        .eq('id', existingCustomer.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar cliente:', updateError);
      }
      
      customerId = existingCustomer.id;
    } else {
      // Criar novo cliente
      console.log('➕ Criando novo cliente');
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([{
          name: customerName,
          phone: customerPhone,
          email: customerEmailAddr,
          address: address
        }])
        .select()
        .single();

      if (customerError) {
        console.error('❌ Erro ao criar cliente:', customerError);
        throw customerError;
      }

      console.log('✅ Cliente criado:', newCustomer.id);
      customerId = newCustomer.id;
    }

    // PASSO 2: VALIDAR PAYMENT METHOD
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

    // PASSO 3: CALCULAR TOTAL
    let finalTotal = parseFloat(total) || 0;
    if (items && Array.isArray(items) && items.length > 0 && !total) {
      finalTotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
      }, 0);
    }

    // PASSO 4: CRIAR PEDIDO COM customer_id
    // Gerar código OTP de 3 dígitos para entrega
    const deliveryCode = Math.floor(100 + Math.random() * 900).toString();
    
    const orderData = {
      customer_id: customerId, // ✅ VINCULANDO AO CLIENTE!
      total: finalTotal,
      status: 'PENDING',
      payment_method: finalPaymentMethod,
      delivery_address: address,
      delivery_code: deliveryCode, // ✅ CÓDIGO OTP PARA ENTREGA
      observations: notes || null,
      created_at: new Date().toISOString()
    };

    console.log('📋 Criando pedido com customer_id:', customerId);

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar pedido:', error);
      throw error;
    }

    console.log(`✅ Pedido criado: ${data.id} (cliente: ${customerId})`);
    
    // PASSO 5: CRIAR ORDER_ITEMS SE FORNECIDOS
    if (items && Array.isArray(items) && items.length > 0) {
      console.log('📦 Criando itens do pedido:', items.length);
      
      const orderItems = items.map(item => ({
        order_id: data.id,
        product_id: item.product_id || item.id,
        quantity: parseInt(item.quantity || 1),
        price: parseFloat(item.price || 0),
        observations: item.observations || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Erro ao criar items:', itemsError);
        // Não falha o pedido, só loga o erro
      } else {
        console.log('✅ Itens criados com sucesso');
      }
    }
    
    res.json({
      success: true,
      data: {
        ...data,
        orderNumber: data.id
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

// PEDIDOS - BUSCAR POR ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    console.log('📋 Buscando pedido:', req.params.id);
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          observations,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('❌ Erro Supabase:', error);
      throw error;
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pedido não encontrado' }
      });
    }

    // Formatar itens
    const formattedOrder = {
      ...order,
      items: order.order_items?.map(item => ({
        id: item.id,
        product_name: item.products?.name,
        product_image: item.products?.image_url,
        quantity: item.quantity,
        price: item.price,
        observations: item.observations
      })) || []
    };

    console.log('✅ Pedido encontrado');
    
    res.json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    console.error('❌ Erro ao buscar pedido:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao buscar pedido',
        details: error.message 
      }
    });
  }
});

// PEDIDOS - LISTAR RECENTES DO CLIENTE
app.get('/api/orders/customer/recent', async (req, res) => {
  try {
    console.log('📋 Buscando pedidos recentes...');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          observations,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erro Supabase:', error);
      throw error;
    }

    // Formatar pedidos
    const formattedOrders = data?.map(order => ({
      ...order,
      items: order.order_items?.map(item => ({
        id: item.id,
        product_name: item.products?.name,
        product_image: item.products?.image_url,
        quantity: item.quantity,
        price: item.price,
        observations: item.observations
      })) || []
    })) || [];

    console.log(`✅ ${formattedOrders.length} pedidos recentes encontrados`);
    
    res.json({
      success: true,
      data: formattedOrders,
      count: formattedOrders.length
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

// PEDIDOS - ATUALIZAR STATUS
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    console.log('🔄 Atualizando status do pedido:', req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: { message: 'Status é obrigatório' }
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw error;
    }

    console.log('✅ Status atualizado:', status);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao atualizar status',
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
    
    // Validar se email e password foram enviados
    if (!email || !password) {
      console.log('❌ Email ou senha não fornecidos');
      return res.status(400).json({
        success: false,
        error: { message: 'Email e senha são obrigatórios' }
      });
    }
    
    // CREDENCIAIS VÁLIDAS DIRETO - SEM VERIFICAÇÃO SUPABASE
    const validCredentials = [
      { id: 'admin-001', email: 'admin@cachorromelo.com', password: 'admin123', name: 'Admin Cachorro Melo' },
      { id: 'admin-002', email: 'admin@teste.com', password: '123456', name: 'Admin Teste' },
      { id: 'admin-003', email: 'root@cachorromelo.com', password: 'root123', name: 'Root Admin' },
      { id: 'admin-004', email: 'test@test.com', password: 'test123', name: 'Test Admin' }
    ];
    
    const validUser = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    
    if (validUser) {
      console.log(`✅ Login admin VÁLIDO: ${email}`);
      
      const responseData = {
        success: true,
        data: {
          admin: {
            id: validUser.id,
            name: validUser.name,
            email: validUser.email,
            role: 'admin'
          },
          token: `token-${validUser.id}-${Date.now()}`
        }
      };
      
      console.log('📤 Resposta enviada:', JSON.stringify(responseData, null, 2));
      return res.status(200).json(responseData);
    } else {
      console.log(`❌ Login INVÁLIDO: ${email}`);
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciais inválidas' }
      });
    }
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return res.status(500).json({
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

// ADMIN - USUÁRIOS
app.get('/api/admin/users', async (req, res) => {
  try {
    console.log('👥 Buscando usuários admin...');
    
    const { data, error } = await supabase
      .from('admins')
      .select('id, name, email, role, active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} usuários encontrados`);
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao buscar usuários',
        details: error.message 
      }
    });
  }
});

// ADMIN - RELATÓRIOS
app.get('/api/admin/reports', async (req, res) => {
  try {
    console.log('📊 Gerando relatórios...');
    const period = req.query.period || 30;
    
    // Calcular data inicial
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Total de pedidos e receita
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Clientes únicos
    const uniqueCustomers = new Set(orders?.map(o => o.customer_id).filter(Boolean)).size;

    // Produtos mais vendidos (mock - precisaria join com order_items)
    const topProducts = [
      { name: 'Cachorro-quente Tradicional', quantity: 45, revenue: 405 },
      { name: 'X-Dog Burger', quantity: 32, revenue: 384 },
      { name: 'Dog Especial', quantity: 28, revenue: 364 }
    ];

    // Receita por período (mock - agrupar por dia)
    const revenueByPeriod = [
      { date: 'Hoje', revenue: 150, orders: 8 },
      { date: 'Ontem', revenue: 230, orders: 12 },
      { date: 'Anteontem', revenue: 180, orders: 9 }
    ];

    console.log('✅ Relatórios gerados');
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts: 11,
        totalCustomers: uniqueCustomers,
        averageOrderValue,
        topProducts,
        revenueByPeriod
      }
    });
  } catch (error) {
    console.error('❌ Erro ao gerar relatórios:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao gerar relatórios',
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
  console.log(`🏍️ Motoboy: http://localhost:${PORT}/api/deliverer/login`);
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\n');
});

module.exports = app;