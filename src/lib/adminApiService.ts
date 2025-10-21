import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

class AdminApiService {
  async login(email: string, password: string): Promise<ApiResponse> {
    try {
      console.log('🔐 Buscando admin no Supabase...');
      
      // Buscar admin por email (SEM comparar senha ainda)
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !admin) {
        console.log('❌ Admin não encontrado');
        return { success: false, error: { message: 'Email ou senha incorretos' } };
      }
      
      console.log('👤 Admin encontrado:', admin.name);
      console.log('🔑 Hash no banco:', admin.password_hash?.substring(0, 10) + '...');
      console.log('🔑 Senha informada:', password);
      
      // Verificar se senha existe no banco
      if (!admin.password_hash) {
        console.error('❌ Admin sem senha cadastrada no banco!');
        return { success: false, error: { message: 'Configuração de conta inválida' } };
      }
      
      // Validar senha com bcrypt
      let senhaValida = false;
      try {
        console.log('🔐 Tentando validar com bcrypt...');
        console.log('🔐 Tipo de bcrypt.compare:', typeof bcrypt.compare);
        senhaValida = await bcrypt.compare(password, admin.password_hash);
        console.log('✅ Bcrypt validou:', senhaValida);
      } catch (bcryptError) {
        console.error('❌ Erro ao validar senha com bcrypt:', bcryptError);
        console.log('⚠️ Usando fallback: comparação direta');
        // Fallback: comparação direta (caso senha não seja hash)
        senhaValida = password === admin.password_hash;
      }
      
      console.log('✅ Senha válida (final):', senhaValida);
      
      if (!senhaValida) {
        console.log('❌ Senha incorreta');
        return { success: false, error: { message: 'Email ou senha incorretos' } };
      }
      
      // Login bem-sucedido
      const token = `admin-token-${admin.id}-${Date.now()}`;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(admin));
      
      console.log('✅ Login bem-sucedido!');
      console.log('💾 Dados salvos no localStorage');
      return { success: true, data: { admin, token } };
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: { message: error.message } };
    }
  }

  async getDashboardStats(): Promise<ApiResponse> {
    try {
      console.log('📊 Buscando estatísticas do dashboard...');
      console.log('🔗 Supabase client:', supabase);
      
      const ordersResult = await supabase.from('orders').select('*', { count: 'exact', head: true });
      console.log('📦 Orders result:', ordersResult);
      
      if (ordersResult.error) {
        console.error('❌ Erro ao buscar orders:', ordersResult.error);
        throw ordersResult.error;
      }
      
      const totalOrders = ordersResult.count;
      console.log('📦 Total de pedidos:', totalOrders);
      
      const pendingResult = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'CONFIRMED', 'PREPARING']);
      if (pendingResult.error) throw pendingResult.error;
      const pendingOrders = pendingResult.count;
      console.log('⏳ Pedidos pendentes:', pendingOrders);
      
      const deliveringResult = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'OUT_FOR_DELIVERY');
      if (deliveringResult.error) throw deliveringResult.error;
      const deliveringOrders = deliveringResult.count;
      
      const deliveredResult = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'DELIVERED');
      if (deliveredResult.error) throw deliveredResult.error;
      const deliveredOrders = deliveredResult.count;
      
      const customersResult = await supabase.from('customers').select('*', { count: 'exact', head: true });
      if (customersResult.error) throw customersResult.error;
      const totalCustomers = customersResult.count;
      
      const productsResult = await supabase.from('products').select('*', { count: 'exact', head: true });
      if (productsResult.error) throw productsResult.error;
      const totalProducts = productsResult.count;
      console.log('🍕 Total de produtos:', totalProducts);
      
      const { data: deliveredOrdersData } = await supabase.from('orders').select('total').eq('status', 'DELIVERED');
      const totalRevenue = deliveredOrdersData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
      
      const { data: recentOrders } = await supabase.from('orders').select('id, total, status, created_at, customers(name, phone)').order('created_at', { ascending: false }).limit(10);
      
      const stats = {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        deliveringOrders: deliveringOrders || 0,
        deliveredOrders: deliveredOrders || 0,
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
        totalRevenue,
        recentOrders: recentOrders || []
      };
      
      console.log('✅ Estatísticas carregadas:', stats);
      return { success: true, data: stats };
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return { success: false, error: { message: error.message } };
    }
  }

  async getOrders(filters?: any): Promise<ApiResponse> {
    try {
      let query = supabase.from('orders').select('*, customers(name, phone, email), order_items(id, quantity, price, products(name))').order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', filters.status);
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: { message: error.message } };
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).select().single();
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: { message: error.message } };
    }
  }

  logout() { 
    localStorage.removeItem('adminToken'); 
    localStorage.removeItem('adminData'); 
    console.log('👋 Logout realizado');
  }
  
  isAuthenticated(): boolean { 
    return !!localStorage.getItem('adminToken'); 
  }
  
  getCurrentUser() { 
    const userStr = localStorage.getItem('adminData'); 
    return userStr ? JSON.parse(userStr) : null; 
  }
}

export const adminApi = new AdminApiService();
export default adminApi;
