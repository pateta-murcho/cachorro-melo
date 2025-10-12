import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/dashboard - Dashboard com estatísticas
router.get('/dashboard', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Estatísticas gerais
    const [
      totalOrders,
      todayOrders,
      totalCustomers,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      recentOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.customer.count(),
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          status: {
            not: 'CANCELLED'
          }
        }
      }),
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          status: {
            not: 'CANCELLED'
          }
        }
      }),
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'PREPARING']
          }
        }
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
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
                  name: true
                }
              }
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          todayOrders,
          totalCustomers,
          totalRevenue: totalRevenue._sum.total || 0,
          todayRevenue: todayRevenue._sum.total || 0,
          pendingOrders
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/orders - Listar pedidos para admin
router.get('/orders', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (date) {
      const filterDate = new Date(date);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.createdAt = {
        gte: filterDate,
        lt: nextDay
      };
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

// GET /api/admin/reports - Relatórios
router.get('/reports', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: any, res: any, next: any) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    // Vendas por período
    const salesReport = await prisma.order.groupBy({
      by: ['status'],
      where: {
        ...dateFilter,
        status: {
          not: 'CANCELLED'
        }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    // Produtos mais vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          ...dateFilter,
          status: {
            not: 'CANCELLED'
          }
        }
      },
      _sum: {
        quantity: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // Buscar nomes dos produtos
    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    const topProductsWithNames = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product
      };
    });

    res.json({
      success: true,
      data: {
        salesReport,
        topProducts: topProductsWithNames
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;