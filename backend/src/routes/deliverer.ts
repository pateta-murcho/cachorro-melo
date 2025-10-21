import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Gerar código OTP de 3 dígitos
function generateDeliveryCode(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

// Middleware de autenticação do motoboy
function authenticateDeliverer(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Token não fornecido' }
    });
  }

  // Extrair ID do deliverer do token (formato: token-deliverer-{uuid}-{timestamp})
  const parts = token.split('-');
  
  if (parts.length < 7 || parts[0] !== 'token' || parts[1] !== 'deliverer') {
    return res.status(401).json({
      success: false,
      error: { message: 'Token inválido' }
    });
  }

  // Reconstruir UUID: parts[2]-parts[3]-parts[4]-parts[5]-parts[6]
  const delivererId = `${parts[2]}-${parts[3]}-${parts[4]}-${parts[5]}-${parts[6]}`;
  
  console.log('🔑 Token recebido:', token);
  console.log('🔑 ID extraído:', delivererId);

  req.delivererId = delivererId;
  next();
}

// LOGIN DO MOTOBOY
router.post('/login', async (req: any, res: any) => {
  try {
    console.log('🏍️ Login motoboy:', req.body.phone);
    
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Telefone e senha são obrigatórios' }
      });
    }

    // Buscar deliverer
    const { data: deliverer, error } = await supabase
      .from('deliverers')
      .select('*')
      .eq('phone', phone)
      .eq('password', password)
      .single();

    if (error || !deliverer) {
      console.log('❌ Credenciais inválidas');
      return res.status(401).json({
        success: false,
        error: { message: 'Telefone ou senha incorretos' }
      });
    }

    // Gerar token
    const token = `token-deliverer-${deliverer.id}-${Date.now()}`;

    console.log('✅ Login bem-sucedido:', deliverer.name);

    res.json({
      success: true,
      data: {
        deliverer: {
          id: deliverer.id,
          name: deliverer.name,
          phone: deliverer.phone,
          email: deliverer.email,
          vehicle_type: deliverer.vehicle_type,
          vehicle_plate: deliverer.vehicle_plate,
          status: deliverer.status,
          rating: deliverer.rating,
          total_deliveries: deliverer.total_deliveries
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro no servidor' }
    });
  }
});

// PEDIDOS DISPONÍVEIS PARA ENTREGA (status: READY ou CONFIRMED)
router.get('/available-orders', authenticateDeliverer, async (req: any, res: any) => {
  try {
    console.log('📦 Buscando pedidos disponíveis...');

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          name,
          phone,
          email
        ),
        order_items (
          id,
          quantity,
          price,
          observations,
          products (
            name
          )
        )
      `)
      .in('status', ['CONFIRMED', 'PREPARING', 'READY'])
      .is('deliverer_id', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Formatar dados
    const formattedOrders = orders?.map((order: any) => ({
      id: order.id,
      customer_id: order.customer_id,
      customer_name: order.customers?.name,
      customer_phone: order.customers?.phone,
      total: order.total,
      status: order.status,
      payment_method: order.payment_method,
      delivery_address: order.delivery_address,
      observations: order.observations,
      created_at: order.created_at,
      items: order.order_items?.map((item: any) => ({
        id: item.id,
        product_name: item.products?.name,
        quantity: item.quantity,
        price: item.price
      })) || []
    })) || [];

    console.log(`✅ ${formattedOrders.length} pedidos disponíveis`);

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar pedidos' }
    });
  }
});

// MINHAS ENTREGAS (pedidos atribuídos ao motoboy)
router.get('/my-deliveries', authenticateDeliverer, async (req: any, res: any) => {
  try {
    console.log('🏍️ Buscando entregas do motoboy:', req.delivererId);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('deliverer_id', req.delivererId)
      .in('status', ['OUT_FOR_DELIVERY', 'READY'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro na query:', error);
      throw error;
    }

    console.log(`✅ ${orders?.length || 0} entregas encontradas`);

    // Formatar dados
    const formattedOrders = orders?.map((order: any) => ({
      id: order.id,
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      total: order.total,
      status: order.status,
      payment_method: order.payment_method,
      delivery_address: order.delivery_address,
      observations: order.observations,
      delivery_code: order.delivery_code,
      delivery_started_at: order.delivery_started_at,
      created_at: order.created_at,
      items: []
    })) || [];

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar entregas:', error.message);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao buscar entregas' }
    });
  }
});

// INICIAR ENTREGA (pegar pedidos)
router.post('/start-delivery', authenticateDeliverer, async (req: any, res: any) => {
  try {
    const { orderIds } = req.body;
    
    console.log('🚀 Iniciando entrega:', orderIds);

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'IDs dos pedidos são obrigatórios' }
      });
    }

    // Atualizar pedidos
    const updates = orderIds.map(async (orderId: string) => {
      const deliveryCode = generateDeliveryCode();
      
      return supabase
        .from('orders')
        .update({
          deliverer_id: req.delivererId,
          status: 'OUT_FOR_DELIVERY',
          delivery_code: deliveryCode,
          delivery_started_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .is('deliverer_id', null);
    });

    await Promise.all(updates);

    // Atualizar status do motoboy para BUSY
    await supabase
      .from('deliverers')
      .update({ status: 'BUSY' })
      .eq('id', req.delivererId);

    console.log('✅ Entregas iniciadas com sucesso');

    res.json({
      success: true,
      data: { message: 'Entregas iniciadas com sucesso' }
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao iniciar entrega' }
    });
  }
});

// CONFIRMAR ENTREGA (validar código OTP)
router.post('/confirm-delivery', authenticateDeliverer, async (req: any, res: any) => {
  try {
    const { orderId, deliveryCode } = req.body;

    console.log('✅ Confirmando entrega:', orderId, 'Código:', deliveryCode);

    if (!orderId || !deliveryCode) {
      return res.status(400).json({
        success: false,
        error: { message: 'ID do pedido e código são obrigatórios' }
      });
    }

    // Buscar pedido
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('deliverer_id', req.delivererId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pedido não encontrado' }
      });
    }

    // Validar código
    const orderCode = String(order.delivery_code).trim();
    const inputCode = String(deliveryCode).trim();
    
    console.log('🔍 Comparando códigos:');
    console.log('  - Código do pedido:', orderCode);
    console.log('  - Código digitado:', inputCode);
    
    if (orderCode !== inputCode) {
      console.log('❌ Códigos não coincidem!');
      return res.status(400).json({
        success: false,
        error: { message: `Código incorreto. Esperado: ${orderCode}, Recebido: ${inputCode}` }
      });
    }
    
    console.log('✅ Código correto!');

    // Atualizar pedido
    await supabase
      .from('orders')
      .update({
        status: 'DELIVERED',
        delivered_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // Verificar se tem mais entregas pendentes
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('deliverer_id', req.delivererId)
      .eq('status', 'OUT_FOR_DELIVERY');

    // Se não tem mais entregas, voltar status para AVAILABLE
    if (!pendingOrders || pendingOrders.length === 0) {
      await supabase
        .from('deliverers')
        .update({ status: 'AVAILABLE' })
        .eq('id', req.delivererId);
    }

    // Incrementar total de entregas
    const { data: deliverer } = await supabase
      .from('deliverers')
      .select('total_deliveries')
      .eq('id', req.delivererId)
      .single();
    
    await supabase
      .from('deliverers')
      .update({ 
        total_deliveries: (deliverer?.total_deliveries || 0) + 1 
      })
      .eq('id', req.delivererId);

    console.log('✅ Entrega confirmada!');

    res.json({
      success: true,
      data: { message: 'Entrega confirmada com sucesso!' }
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao confirmar entrega' }
    });
  }
});

// ATUALIZAR LOCALIZAÇÃO
router.post('/update-location', authenticateDeliverer, async (req: any, res: any) => {
  try {
    const { latitude, longitude } = req.body;

    await supabase
      .from('deliverers')
      .update({
        delivery_latitude: latitude,
        delivery_longitude: longitude
      })
      .eq('id', req.delivererId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ATUALIZAR STATUS
router.post('/update-status', authenticateDeliverer, async (req: any, res: any) => {
  try {
    const { status } = req.body;

    if (!['AVAILABLE', 'BUSY', 'OFFLINE'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Status inválido' }
      });
    }

    await supabase
      .from('deliverers')
      .update({ status })
      .eq('id', req.delivererId);

    console.log(`✅ Status atualizado para: ${status}`);

    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao atualizar status' }
    });
  }
});

export default router;
