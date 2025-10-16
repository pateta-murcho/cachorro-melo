// Admin API Service - Connects to real backend/Supabase
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
  image_url?: string;
  available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  observations?: string;
  created_at: string;
  order_items?: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  observations?: string;
}

class AdminApiService {
  private baseURL = API_BASE_URL;

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const token = localStorage.getItem('adminToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    try {
      console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      
      return data;
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Products
  async getProducts(): Promise<AdminProduct[]> {
    const response = await this.request<{ success: boolean; data: AdminProduct[] }>('/products');
    return response.data || [];
  }

  async createProduct(productData: Partial<AdminProduct>): Promise<AdminProduct> {
    const response = await this.request<{ success: boolean; data: AdminProduct }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    return response.data;
  }

  async updateProduct(id: string, productData: Partial<AdminProduct>): Promise<AdminProduct> {
    const response = await this.request<{ success: boolean; data: AdminProduct }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories
  async getCategories(): Promise<{ id: string; name: string; }[]> {
    const response = await this.request<{ success: boolean; data: any[] }>('/categories');
    return response.data || [];
  }

  // Orders
  async getOrders(): Promise<AdminOrder[]> {
    const response = await this.request<{ success: boolean; data: AdminOrder[] }>('/orders');
    return response.data || [];
  }

  async updateOrderStatus(id: string, status: string): Promise<AdminOrder> {
    const response = await this.request<{ success: boolean; data: AdminOrder }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return response.data;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    todayOrders: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    pendingOrders: number;
  }> {
    try {
      const [orders, products] = await Promise.all([
        this.getOrders(),
        this.getProducts()
      ]);

      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.created_at).toDateString() === today
      ).length;

      const pendingOrders = orders.filter(order => 
        ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
      ).length;

      const totalRevenue = orders
        .filter(order => order.payment_status === 'PAID')
        .reduce((sum, order) => sum + order.total, 0);

      return {
        todayOrders,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        pendingOrders
      };
    } catch (error) {
      console.error('❌ Erro ao carregar stats:', error);
      return {
        todayOrders: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingOrders: 0
      };
    }
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    // Por enquanto simulado - depois implementar no backend
    if (email === 'admin@cachorromelo.com' && password === 'admin123') {
      const token = 'admin-token-' + Date.now();
      const user = {
        id: '1',
        name: 'Administrador',
        email: email,
        role: 'admin'
      };
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      return { token, user };
    }
    
    throw new Error('Credenciais inválidas');
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ token: string; user: any }> {
    // Por enquanto simulado - depois implementar no backend
    const token = 'admin-token-' + Date.now();
    const user = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: 'admin'
    };
    
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    
    return { token, user };
  }
}

export const adminApiService = new AdminApiService();