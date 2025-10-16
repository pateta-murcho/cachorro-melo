// Detectar automaticamente se está usando localhost ou IP
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : `http://${window.location.hostname}:3001/api`);

console.log('🌐 AdminApiService - API_BASE_URL:', API_BASE_URL);
console.log('🌐 window.location.hostname:', window.location.hostname);

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

class AdminApiService {
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = localStorage.getItem('adminToken');
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      body: options.body,
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 API Request: ${options.method || 'GET'} ${fullUrl}`);

    try {
      const response = await fetch(fullUrl, config);
      
      console.log(`📥 API Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        console.error('❌ API Error:', result.error);
        throw new Error(result.error?.message || 'Erro desconhecido');
      }

      console.log('✅ API Success:', result.data);
      return result.data as T;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Autenticação
  async login(email: string, password: string) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/admin/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  // Produtos
  async getProducts() {
    return this.request('/products?available=all');
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Pedidos
  async getOrders() {
    return this.request('/orders');
  }

  async getActiveOrders() {
    return this.request('/orders?status=CONFIRMED,PREPARING,READY');
  }

  async updateOrder(id: string, orderData: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Categorias
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
}

export const adminApiService = new AdminApiService();