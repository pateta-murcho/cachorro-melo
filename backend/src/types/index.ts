export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface OrderFilters {
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  observations?: string;
}

export interface CreateOrderRequest {
  customerInfo: CustomerInfo;
  items: OrderItem[];
  paymentMethod: 'PIX' | 'CASH' | 'CARD';
  observations?: string;
}