import { Router } from 'express';
import { supabase, Order } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/orders - Listar pedidos
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const { status, customerId, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
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

// GET /api/orders/tracking/:otp - Rastrear pedido por OTP
router.get('/tracking/:otp', async (req: any, res: any, next: any) => {
  try {
    const { otp } = req.params;

    const order = await prisma.order.findUnique({
      where: { otp },
      include: {
        customer: {
          select: {
            name: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!order) {
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
    const { customerInfo, items, paymentMethod, observations } = req.body;

    // Criar ou buscar cliente
    let customer = await prisma.customer.findUnique({
      where: { phone: customerInfo.phone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          email: customerInfo.email
        }
      });
    } else {
      // Atualizar dados do cliente se necessário
      customer = await prisma.customer.update({
        where: { phone: customerInfo.phone },
        data: {
          name: customerInfo.name,
          address: customerInfo.address,
          ...(customerInfo.email && { email: customerInfo.email })
        }
      });
    }

    // Calcular total e validar produtos
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.available) {
        return res.status(400).json({
          success: false,
          error: { message: `Produto ${product?.name || 'não encontrado'} não está disponível` }
        });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        observations: item.observations
      });
    }

    // Gerar OTP único
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        total,
        paymentMethod,
        deliveryAddress: customerInfo.address,
        observations,
        otp,
        estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        items: {
          create: orderItems
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Emitir evento via Socket.IO para admins
    const io = req.app.get('io');
    io.emit('new-order', {
      orderId: order.id,
      customerName: customer.name,
      total: order.total,
      itemsCount: order.items.length
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id/status - Atualizar status do pedido
router.put('/:id/status', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Status inválido' }
      });
    }

    const updateData: any = { status };
    
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Emitir evento via Socket.IO
    const io = req.app.get('io');
    io.emit('order-status-updated', {
      orderId: order.id,
      status: order.status,
      otp: order.otp
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id/payment - Atualizar status do pagamento
router.put('/:id/payment', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED'];
    
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Status de pagamento inválido' }
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

export default router;