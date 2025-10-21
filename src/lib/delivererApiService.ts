/**
 * API Service para Entregadores/Motoboys - 100% Supabase DIRETO
 */
import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

console.log('🏍️ DelivererApiService - 100% Supabase (Produção)');

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

  // Autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔥 Login motoboy via Supabase direto');
      
      // Buscar entregador por telefone
      const { data: deliverer, error } = await supabase
        .from('deliverers')
        .select('*')
        .eq('phone', credentials.phone)
        .single();
      
      if (error || !deliverer) {
        console.log('❌ Entregador não encontrado');
        return {
          success: false,
          error: { message: 'Telefone ou senha incorretos' }
        };
      }
      
      console.log('👤 Entregador encontrado:', deliverer.name);
      
      // Verificar se senha existe
      if (!deliverer.password) {
        return {
          success: false,
          error: { message: 'Configuração de conta inválida' }
        };
      }
      
      // Validar senha com bcrypt
      let senhaValida = false;
      try {
        console.log('🔐 Tentando validar com bcrypt...');
        console.log('🔐 Tipo de bcrypt.compare:', typeof bcrypt.compare);
        senhaValida = await bcrypt.compare(credentials.password, deliverer.password);
        console.log('✅ Bcrypt validou:', senhaValida);
      } catch (bcryptError) {
        console.error('❌ Erro ao validar senha com bcrypt:', bcryptError);
        console.log('⚠️ Usando fallback: comparação direta');
        senhaValida = credentials.password === deliverer.password;
      }
      
      if (!senhaValida) {
        return {
          success: false,
          error: { message: 'Telefone ou senha incorretos' }
        };
      }
      
      // Login bem-sucedido
      const token = `token-deliverer-${deliverer.id}-${Date.now()}`;
      localStorage.setItem('delivererToken', token);
      localStorage.setItem('delivererData', JSON.stringify(deliverer));
      
      console.log('✅ Login motoboy bem-sucedido!');
      return {
        success: true,
        data: { deliverer, token }
      };
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
      console.log('🔥 Buscando pedidos disponíveis do Supabase');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, phone),
          items:order_items(*, product:products(name))
        `)
        .in('status', ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'])
        .is('deliverer_id', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const orders = (data || []).map((order: any) => ({
        id: order.id,
        customer_id: order.customer_id,
        customer_name: order.customer?.name,
        customer_phone: order.customer?.phone,
        total: parseFloat(order.total),
        status: order.status,
        payment_method: order.payment_method,
        delivery_address: order.delivery_address,
        observations: order.observations,
        delivery_code: order.otp,
        created_at: order.created_at,
        items: order.items?.map((item: any) => ({
          id: item.id,
          product_name: item.product?.name || 'Produto',
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
      }));
      
      return { success: true, data: orders };
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
      console.log('🔥 Buscando minhas entregas do Supabase');
      const delivererData = this.getDelivererData();
      if (!delivererData) {
        return { success: false, error: { message: 'Não autenticado' } };
      }
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, phone),
          items:order_items(*, product:products(name))
        `)
        .eq('deliverer_id', delivererData.id)
        .eq('status', 'OUT_FOR_DELIVERY')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const orders = (data || []).map((order: any) => ({
        id: order.id,
        customer_id: order.customer_id,
        customer_name: order.customer?.name,
        customer_phone: order.customer?.phone,
        total: parseFloat(order.total),
        status: order.status,
        payment_method: order.payment_method,
        delivery_address: order.delivery_address,
        observations: order.observations,
        delivery_code: order.otp,
        created_at: order.created_at,
        items: order.items?.map((item: any) => ({
          id: item.id,
          product_name: item.product?.name || 'Produto',
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
      }));
      
      return { success: true, data: orders };
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
      console.log('🔥 Iniciando entrega no Supabase');
      const delivererData = this.getDelivererData();
      if (!delivererData) {
        return { success: false, error: { message: 'Não autenticado' } };
      }
      
      // Atualizar pedidos com deliverer_id e status OUT_FOR_DELIVERY
      const { error } = await supabase
        .from('orders')
        .update({
          deliverer_id: delivererData.id,
          status: 'OUT_FOR_DELIVERY',
          updated_at: new Date().toISOString()
        })
        .in('id', orderIds);
      
      if (error) throw error;
      
      return { success: true, data: { message: 'Entrega iniciada com sucesso' } };
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
      console.log('🔥 Confirmando entrega no Supabase');
      
      // Buscar pedido e validar OTP
      const { data: order, error } = await supabase
        .from('orders')
        .select('otp')
        .eq('id', orderId)
        .single();
      
      if (error || !order) {
        return { success: false, error: { message: 'Pedido não encontrado' } };
      }
      
      if (order.otp !== deliveryCode) {
        return { success: false, error: { message: 'Código de entrega inválido' } };
      }
      
      // Atualizar status para DELIVERED
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'DELIVERED',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (updateError) throw updateError;
      
      return { success: true, data: { message: 'Entrega confirmada com sucesso' } };
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
      const delivererData = this.getDelivererData();
      if (!delivererData) {
        return { success: false, error: { message: 'Não autenticado' } };
      }

      const { error } = await supabase
        .from('deliverers')
        .update({
          last_latitude: latitude,
          last_longitude: longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', delivererData.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      return { success: false };
    }
  }

  // Atualizar status do motoboy
  async updateStatus(status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'): Promise<ApiResponse> {
    try {
      const delivererData = this.getDelivererData();
      if (!delivererData) {
        return { success: false, error: { message: 'Não autenticado' } };
      }

      const { error } = await supabase
        .from('deliverers')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', delivererData.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return { success: false };
    }
  }
}

export const delivererApi = new DelivererApiService();
