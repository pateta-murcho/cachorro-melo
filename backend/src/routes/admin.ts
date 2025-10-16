import { Router } from 'express';
import { supabase, Admin } from '../lib/supabase';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/admin/dashboard - Dashboard com estatísticas
router.get('/dashboard', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString();

    // Total de pedidos hoje
    const { count: todayOrders, error: todayOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)
      .lt('created_at', tomorrowISO);

    if (todayOrdersError) throw todayOrdersError;

    // Receita hoje
    const { data: todayRevenue, error: revenueError } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', todayISO)
      .lt('created_at', tomorrowISO)
      .neq('status', 'CANCELLED');

    if (revenueError) throw revenueError;

    const todayRevenueSum = todayRevenue?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0;

    // Pedidos pendentes
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['PENDING', 'CONFIRMED', 'PREPARING']);

    if (pendingError) throw pendingError;

    // Total de clientes
    const { count: totalCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (customersError) throw customersError;

    // Total de produtos
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) throw productsError;

    // Produtos mais vendidos (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: topProducts, error: topProductsError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        product:products(name, image)
      `)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (topProductsError) throw topProductsError;

    // Agrupar produtos por quantidade vendida
    const productSales: any = {};
    topProducts?.forEach((item: any) => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          product: item.product,
          totalQuantity: 0
        };
      }
      productSales[item.product_id].totalQuantity += item.quantity;
    });

    const topProductsList = Object.values(productSales)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Pedidos recentes
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentOrdersError) throw recentOrdersError;

    // Total de pedidos (todos)
    const { count: totalOrders, error: totalOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (totalOrdersError) throw totalOrdersError;

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders: totalOrders || 0,
          todayOrders: todayOrders || 0,
          todayRevenue: todayRevenueSum,
          pendingOrders: pendingOrders || 0,
          totalCustomers: totalCustomers || 0,
          totalProducts: totalProducts || 0
        },
        topProducts: topProductsList,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/orders - Listar todos os pedidos (Admin)
router.get('/orders', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: any, res: any, next: any) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(name, phone, email),
        order_items(
          *,
          product:products(name, image)
        )
      `)
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.gte('created_at', startDate.toISOString())
                  .lte('created_at', endDate.toISOString());
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

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      countQuery = countQuery.gte('created_at', startDate.toISOString())
                             .lte('created_at', endDate.toISOString());
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

// GET /api/admin/reports/sales - Relatório de vendas
router.get('/reports/sales', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: any, res: any, next: any) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = supabase
      .from('orders')
      .select('total_amount, created_at, status')
      .neq('status', 'CANCELLED');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Agrupar por dia
    const dailyStats: any = {};
    orders?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          revenue: 0,
          orders: 0
        };
      }
      dailyStats[date].revenue += order.total_amount;
      dailyStats[date].orders += 1;
    });

    const dailyData = Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue
        },
        dailyData
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reports/products - Relatório de produtos
router.get('/reports/products', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: any, res: any, next: any) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        total_price,
        created_at,
        product:products(name, image, price)
      `);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: orderItems, error } = await query;

    if (error) {
      throw error;
    }

    // Agrupar por produto
    const productStats: any = {};
    orderItems?.forEach((item: any) => {
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      productStats[item.product_id].totalQuantity += item.quantity;
      productStats[item.product_id].totalRevenue += item.total_price;
    });

    const productData = Object.values(productStats)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

    res.json({
      success: true,
      data: productData
    });
  } catch (error) {
    next(error);
  }
});

export default router;