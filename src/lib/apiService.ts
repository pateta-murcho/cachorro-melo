import { supabase } from './supabase';

// Detectar ambiente
const isProduction = window.location.hostname !== 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('🌐 ApiService - Ambiente:', isProduction ? 'PRODUÇÃO' : 'LOCAL');
console.log('🌐 ApiService - API_BASE_URL:', API_BASE_URL);

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
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      console.log(`📡 Fazendo requisição: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro HTTP ${response.status}:`, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Resposta recebida:`, data);
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Erro ao conectar com backend:', error);
      throw error;
    }
  }

  // Products
  async getProducts(): Promise<any[]> {
    // Em produção, usar Supabase direto
    if (isProduction) {
      console.log('🔥 PRODUÇÃO - Buscando produtos do Supabase direto');
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name)')
        .eq('available', true)
        .order('name');
      
      if (error) {
        console.error('❌ Erro Supabase:', error);
        throw error;
      }
      
      console.log('✅ Produtos do Supabase:', data?.length || 0);
      return data || [];
    }
    
    // Local: usar backend
    return this.request<any[]>('/products');
  }

  async getProduct(id: string): Promise<any> {
    // Em produção, usar Supabase direto
    if (isProduction) {
      console.log('🔥 PRODUÇÃO - Buscando produto do Supabase direto');
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
    
    // Local: usar backend
    return this.request<any>(`/products/${id}`);
  }

  // Categories
  async getCategories(): Promise<any[]> {
    // Em produção, usar Supabase direto
    if (isProduction) {
      console.log('🔥 PRODUÇÃO - Buscando categorias do Supabase direto');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
    
    // Local: usar backend
    return this.request<any[]>('/categories');
  }

  // Orders
  async createOrder(orderData: CreateOrderRequest): Promise<ApiOrder> {
    // Em produção, usar Supabase direto
    if (isProduction) {
      console.log('🔥 PRODUÇÃO - Criando pedido no Supabase direto');
      
      // 1. Criar/buscar customer
      let customerId: string;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', orderData.customer_phone)
        .single();
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: orderData.customer_name,
            phone: orderData.customer_phone,
            email: orderData.customer_email,
            address: orderData.delivery_address
          })
          .select()
          .single();
        
        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }
      
      // 2. Calcular total
      const total = orderData.items.reduce((sum, item) => {
        // Buscar preço do produto (simplificado)
        return sum + (15 * item.quantity); // Preço mock, ideal buscar do DB
      }, 0);
      
      // 3. Criar order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          total: total.toString(),
          status: 'PENDING',
          payment_method: orderData.payment_method,
          payment_status: 'PENDING',
          delivery_address: orderData.delivery_address,
          observations: orderData.items[0]?.observations
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // 4. Criar order_items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: 15, // Preço mock
        observations: item.observations
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      console.log('✅ Pedido criado:', order.id);
      return order as ApiOrder;
    }
    
    // Local: usar backend
    const order = await this.request<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    return order;
  }

  async getOrder(orderId: string): Promise<ApiOrder> {
    // Em produção, usar Supabase direto
    if (isProduction) {
      console.log('🔥 PRODUÇÃO - Buscando pedido do Supabase direto');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*, product:products(*))
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data as ApiOrder;
    }
    
    // Local: usar backend
    return this.request<ApiOrder>(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<ApiOrder> {
    // Em produção, usar Supabase direto
    if (isProduction) {
      console.log('🔥 PRODUÇÃO - Atualizando status no Supabase direto');
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data as ApiOrder;
    }
    
    // Local: usar backend
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
    // Em produção, usar Supabase direto
    if (isProduction) {
      console.log('🔥 PRODUÇÃO - Criando cliente no Supabase direto');
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    // Local: usar backend
    return this.request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async getCustomer(customerId: string): Promise<any> {
    // Em produção, usar Supabase direto
    if (isProduction) {
      console.log('🔥 PRODUÇÃO - Buscando cliente do Supabase direto');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) throw error;
      return data;
    }
    
    // Local: usar backend
    return this.request<any>(`/customers/${customerId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch('http://localhost:3001/health');
    return response.json();
  }
}

export const apiService = new ApiService();