import express from 'express';
import cors from 'cors';
import { supabase } from './lib/supabase';

const app = express();
const PORT = 3001;

// CORS bem permissivo - incluindo IP da rede
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:8080', 
    'http://localhost:8081', 
    'http://127.0.0.1:8081',
    'http://192.168.15.7:8080'  // IP da rede
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Log todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Produtos
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Buscando produtos...');
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id, name, description, price, available,
        category:categories(id, name)
      `)
      .eq('available', true);

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log(`✅ ${products?.length || 0} produtos encontrados`);
    res.json({ success: true, data: products || [] });
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

// Criar pedido
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📝 Criando pedido:', req.body);
    
    const { customer_name, customer_phone, customer_email, delivery_address, payment_method, notes, items } = req.body;

    // Validar dados obrigatórios
    if (!customer_name || !customer_phone || !delivery_address || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados obrigatórios: customer_name, customer_phone, delivery_address, items' 
      });
    }

    // Buscar preços dos produtos
    const productIds = items.map((item: any) => item.product_id);
    console.log('🔍 Buscando produtos:', productIds);
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      return res.status(500).json({ success: false, message: productsError.message });
    }

    // Calcular total
    let total = 0;
    for (const item of items) {
      const product = products?.find(p => p.id === item.product_id);
      if (product) {
        total += parseFloat(product.price) * item.quantity;
      }
    }

    console.log('💰 Total calculado:', total);

    // Criar cliente primeiro
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: customer_name,
        phone: customer_phone,
        email: customer_email,
        address: delivery_address
      })
      .select()
      .single();

    if (customerError) {
      console.error('❌ Erro ao criar cliente:', customerError);
      return res.status(500).json({ success: false, message: customerError.message });
    }

    console.log('👤 Cliente criado:', customer.id);

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        total: total,
        status: 'PENDING',
        payment_method: payment_method,
        payment_status: 'PENDING',
        delivery_address: delivery_address,
        observations: notes
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Erro ao criar pedido:', orderError);
      return res.status(500).json({ success: false, message: orderError.message });
    }

    console.log('📦 Pedido criado:', order.id);

    // Criar itens do pedido
    const orderItems = items.map((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(product?.price || 0),
        observations: item.observations
      };
    });

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('❌ Erro ao criar itens:', itemsError);
      return res.status(500).json({ success: false, message: itemsError.message });
    }

    console.log('✅ Pedido completo criado!');

    res.json({ 
      success: true, 
      data: {
        id: order.id,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        items: createdItems
      }
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Middleware de erro 404
app.use('*', (req, res) => {
  console.log('❌ 404:', req.originalUrl);
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor FUNCIONAL rodando na porta', PORT);
  console.log('🔗 Acesse: http://localhost:3001');
  console.log('💡 Health: http://localhost:3001/health');
  console.log('📦 Produtos: http://localhost:3001/api/products');
  console.log('🌐 CORS habilitado para todas as origens de desenvolvimento');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});