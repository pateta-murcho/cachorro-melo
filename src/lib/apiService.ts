// API service for real backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168')
    ? 'http://localhost:3001/api'
    : '');

// Só usa mock em produção (Vercel) quando não tem backend
const USE_MOCK = !API_BASE_URL && window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('192.168');

console.log('🌐 ApiService - API_BASE_URL:', API_BASE_URL);
console.log('🔄 USE_MOCK:', USE_MOCK);

export interface ApiCartItem {
  product_id: string;
  quantity: number;
  observations?: string;
}

export interface ApiOrder {
  id: string;
  customer_id?: string;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  delivery_address: string;
  observations?: string;
  created_at: string;
  updated_at?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  otp?: string;
  items?: ApiOrderItem[];
}

export interface ApiOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  observations?: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  payment_method: 'CASH' | 'PIX' | 'CARD';
  items: ApiCartItem[];
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // If no backend URL, use mock data
    if (USE_MOCK) {
      console.warn('🔄 Backend não disponível, usando dados mockados');
      return this.getMockData<T>(endpoint);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.warn('❌ Erro ao conectar com backend, usando mock:', error);
      return this.getMockData<T>(endpoint);
    }
  }

  private async getMockData<T>(endpoint: string): Promise<T> {
    const { mockProducts } = await import('./mockData');
    
    if (endpoint.includes('/products')) {
      return mockProducts as T;
    }
    
    // Retornar array vazio para outros endpoints
    return [] as T;
  }

  // Products
  async getProducts(): Promise<any[]> {
    return this.request<any[]>('/products');
  }

  async getProduct(id: string): Promise<any> {
    return this.request<any>(`/products/${id}`);
  }

  // Categories
  async getCategories(): Promise<any[]> {
    return this.request<any[]>('/categories');
  }

  // Orders
  async createOrder(orderData: CreateOrderRequest): Promise<ApiOrder> {
    const order = await this.request<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    return order;
  }

  async getOrder(orderId: string): Promise<ApiOrder> {
    return this.request<ApiOrder>(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<ApiOrder> {
    return this.request<ApiOrder>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Customers
  async createCustomer(customerData: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  }): Promise<any> {
    return this.request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async getCustomer(customerId: string): Promise<any> {
    return this.request<any>(`/customers/${customerId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch('http://localhost:3001/health');
    return response.json();
  }
}

export const apiService = new ApiService();