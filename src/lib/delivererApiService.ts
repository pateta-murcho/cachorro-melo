/**
 * API Service para Entregadores/Motoboys - 100% Supabase via Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Deliverer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type: string;
  vehicle_plate?: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  total_deliveries: number;
}

export interface DeliveryOrder {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  total: number;
  status: string;
  payment_method: string;
  delivery_address: string;
  observations?: string;
  delivery_code?: string;
  created_at: string;
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    deliverer: Deliverer;
    token: string;
  };
  error?: {
    message: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

class DelivererApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('delivererToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/deliverer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (data.success && data.data?.token) {
        localStorage.setItem('delivererToken', data.data.token);
        localStorage.setItem('delivererData', JSON.stringify(data.data.deliverer));
      }

      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: { message: 'Erro ao conectar com o servidor' }
      };
    }
  }

  logout() {
    localStorage.removeItem('delivererToken');
    localStorage.removeItem('delivererData');
  }

  getDelivererData(): Deliverer | null {
    const data = localStorage.getItem('delivererData');
    return data ? JSON.parse(data) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('delivererToken');
  }

  // Pedidos disponíveis para entrega (status: READY)
  async getAvailableOrders(): Promise<ApiResponse<DeliveryOrder[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/deliverer/available-orders`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: { message: 'Erro ao buscar pedidos' }
      };
    }
  }

  // Pedidos atribuídos ao motoboy (em entrega)
  async getMyDeliveries(): Promise<ApiResponse<DeliveryOrder[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/deliverer/my-deliveries`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: { message: 'Erro ao buscar entregas' }
      };
    }
  }

  // Iniciar entrega (pegar pedidos)
  async startDelivery(orderIds: string[]): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/deliverer/start-delivery`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ orderIds })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao iniciar entrega:', error);
      return {
        success: false,
        error: { message: 'Erro ao iniciar entrega' }
      };
    }
  }

  // Confirmar entrega (validar código OTP)
  async confirmDelivery(orderId: string, deliveryCode: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/deliverer/confirm-delivery`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ orderId, deliveryCode })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: { message: 'Erro ao confirmar entrega' }
      };
    }
  }

  // Atualizar localização em tempo real
  async updateLocation(latitude: number, longitude: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/deliverer/update-location`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ latitude, longitude })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      return { success: false };
    }
  }

  // Atualizar status do motoboy
  async updateStatus(status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/deliverer/update-status`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return { success: false };
    }
  }
}

export const delivererApi = new DelivererApiService();
