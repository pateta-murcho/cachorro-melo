import { Router } from 'express';
import { supabase, Order } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/orders - Listar pedidos
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const { status, customerId, page = 1, limit = 10 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    // Contar total para paginação
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (customerId) {
      countQuery = countQuery.eq('customer_id', customerId);
    }

    const { count: total, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - Buscar pedido por ID
router.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pedido não encontrado' }
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id/tracking - Tracking do pedido
router.get('/:id/tracking', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        estimated_delivery,
        customer:customers(name, phone)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pedido não encontrado' }
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - Criar novo pedido
router.post('/', async (req: any, res: any, next: any) => {
  try {
    const { 
      customer_name, 
      customer_phone, 
      customer_email, 
      delivery_address, 
      items, 
      payment_method,
      notes 
    } = req.body;

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Items são obrigatórios' }
      });
    }

    // Buscar ou criar customer
    let customer;
    const { data: existingCustomer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', customer_phone)
      .single();

    if (existingCustomer) {
      // Atualizar dados do customer se necessário
      const updateData: any = {};
      if (customer_name && customer_name !== existingCustomer.name) updateData.name = customer_name;
      if (customer_email && customer_email !== existingCustomer.email) updateData.email = customer_email;
      if (delivery_address && delivery_address !== existingCustomer.address) updateData.address = delivery_address;

      if (Object.keys(updateData).length > 0) {
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', existingCustomer.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }
        customer = updatedCustomer;
      } else {
        customer = existingCustomer;
      }
    } else {
      // Criar novo customer
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          name: customer_name,
          phone: customer_phone,
          email: customer_email,
          address: delivery_address
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      customer = newCustomer;
    }

    // Validar produtos e calcular total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .eq('available', true)
        .single();

      if (productError || !product) {
        return res.status(400).json({
          success: false,
          error: { message: `Produto ${item.product_id} não encontrado ou indisponível` }
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal
      });
    }

    // Criar pedido
    const orderId = uuidv4();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        customer_id: customer.id,
        status: 'PENDING',
        total: totalAmount,
        delivery_address,
        payment_method: payment_method || 'MONEY',
        observations: notes,
        estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Criar order items
    const orderItemsData = validatedItems.map(item => ({
      ...item,
      order_id: orderId
    }));

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select();

    if (itemsError) {
      throw itemsError;
    }

    // Buscar pedido completo para retornar
    const { data: completeOrder, error: completeError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (completeError) {
      throw completeError;
    }

    res.status(201).json({
      success: true,
      data: completeOrder
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id/status - Atualizar status do pedido (Admin)
router.put('/:id/status', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Status inválido' }
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        customer:customers(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/:id - Cancelar pedido
router.delete('/:id', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Pedido cancelado com sucesso',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

export default router;