import { apiService, ApiResponse } from './api';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  observations?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
}

export interface CreateOrderRequest {
  customerInfo: CustomerInfo;
  items: OrderItem[];
  paymentMethod: 'PIX' | 'CASH' | 'CARD';
  observations?: string;
}

export interface Order {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
    observations?: string;
  }>;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'PIX' | 'CASH' | 'CARD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  deliveryAddress: string;
  observations?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  otp?: string;
  createdAt: string;
  updatedAt: string;
}

class OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    console.log('🛒 OrderService: createOrder chamado com dados:', orderData);
    
    const result = await apiService.post<Order>('/orders', orderData);
    console.log('🛒 OrderService: resultado da criação:', result);
    
    return result;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return apiService.get<Order>(`/orders/${id}`);
  }

  async trackOrder(otp: string): Promise<ApiResponse<Order>> {
    return apiService.get<Order>(`/orders/tracking/${otp}`);
  }

  async getOrders(filters?: {
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    
    if (filters?.customerId) {
      params.append('customerId', filters.customerId);
    }
    
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    return apiService.get(endpoint);
  }

  async updateOrderStatus(
    id: string, 
    status: Order['status']
  ): Promise<ApiResponse<Order>> {
    return apiService.put<Order>(`/orders/${id}/status`, { status });
  }

  async updatePaymentStatus(
    id: string, 
    paymentStatus: Order['paymentStatus']
  ): Promise<ApiResponse<Order>> {
    return apiService.put<Order>(`/orders/${id}/payment`, { paymentStatus });
  }
}

export const orderService = new OrderService();