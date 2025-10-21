import { supabase } from './supabase';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

class AdminApiService {
  async login(email: string, password: string): Promise<ApiResponse> {
    try {
      const { data: admin, error } = await supabase.from('admins').select('*').eq('email', email).eq('password', password).single();
      if (error || !admin) return { success: false, error: { message: 'Email ou senha incorretos' } };
      const token = dmin-token--;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      return { success: true, data: { admin, token } };
    } catch (error: any) {
      return { success: false, error: { message: error.message } };
    }
  }

  async getDashboardStats(): Promise<ApiResponse> {
    try {
      const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: pendingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'CONFIRMED', 'PREPARING']);
      const { count: deliveringOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'OUT_FOR_DELIVERY');
      const { count: deliveredOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'DELIVERED');
      const { count: totalCustomers } = await supabase.from('customers').select('*', { count: 'exact', head: true });
      const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { data: deliveredOrdersData } = await supabase.from('orders').select('total').eq('status', 'DELIVERED');
      const totalRevenue = deliveredOrdersData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
      const { data: recentOrders } = await supabase.from('orders').select('id, total, status, created_at, customers(name, phone)').order('created_at', { ascending: false }).limit(10);
      return { success: true, data: { totalOrders: totalOrders || 0, pendingOrders: pendingOrders || 0, deliveringOrders: deliveringOrders || 0, deliveredOrders: deliveredOrders || 0, totalCustomers: totalCustomers || 0, totalProducts: totalProducts || 0, totalRevenue, recentOrders: recentOrders || [] } };
    } catch (error: any) {
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

  logout() { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); }
  isAuthenticated(): boolean { return !!localStorage.getItem('adminToken'); }
  getCurrentUser() { const userStr = localStorage.getItem('adminUser'); return userStr ? JSON.parse(userStr) : null; }
}

export const adminApi = new AdminApiService();
export default adminApi;
