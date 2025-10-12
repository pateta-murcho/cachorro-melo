import { apiService, ApiResponse } from './api';

export interface CustomerCreateRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

class CustomerService {
  async createOrUpdateCustomer(customerData: CustomerCreateRequest): Promise<ApiResponse<Customer>> {
    return apiService.post<Customer>('/customers', customerData);
  }

  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    return apiService.get<Customer>(`/customers/${id}`);
  }

  async updateCustomer(id: string, customerData: Partial<CustomerCreateRequest>): Promise<ApiResponse<Customer>> {
    return apiService.put<Customer>(`/customers/${id}`, customerData);
  }

  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    return apiService.get<Customer[]>('/customers');
  }
}

export const customerService = new CustomerService();