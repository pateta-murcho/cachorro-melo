import { apiService, ApiResponse } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  available: boolean;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

class ProductService {
  async getProducts(filters?: {
    categoryId?: string;
    featured?: boolean;
    available?: boolean;
  }): Promise<ApiResponse<Product[]>> {
    console.log('📦 ProductService: getProducts chamado com filtros:', filters);
    
    const params = new URLSearchParams();
    
    if (filters?.categoryId) {
      params.append('categoryId', filters.categoryId);
    }
    
    if (filters?.featured !== undefined) {
      params.append('featured', filters.featured.toString());
    }
    
    if (filters?.available !== undefined) {
      params.append('available', filters.available.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    console.log('📦 ProductService: fazendo requisição para:', endpoint);
    const result = await apiService.get<Product[]>(endpoint);
    console.log('📦 ProductService: resultado:', result);
    
    return result;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return apiService.get<Product>(`/products/${id}`);
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiService.get<Category[]>('/categories');
  }

  async getCategory(id: string): Promise<ApiResponse<Category & { products: Product[] }>> {
    return apiService.get<Category & { products: Product[] }>(`/categories/${id}`);
  }
}

export const productService = new ProductService();