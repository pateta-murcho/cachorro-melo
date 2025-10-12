import { useState, useEffect } from 'react';
import { productService, Product, Category } from '@/services/products';
import { toast } from '@/hooks/use-toast';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (filters?: {
    categoryId?: string;
    featured?: boolean;
    available?: boolean;
  }) => {
    try {
      setLoading(true);
      const response = await productService.getProducts(filters);
      
      if (response.success && response.data) {
        setProducts(response.data);
        setError(null);
      } else {
        setError(response.error?.message || 'Erro ao carregar produtos');
        toast({
          title: "Erro",
          description: response.error?.message || 'Erro ao carregar produtos',
          variant: "destructive"
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        toast({
          title: "Erro",
          description: response.error?.message || 'Erro ao carregar categorias',
          variant: "destructive"
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    }
  };

  const getProduct = async (id: string) => {
    try {
      const response = await productService.getProduct(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        toast({
          title: "Erro",
          description: response.error?.message || 'Produto não encontrado',
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    getProduct,
    refetch: () => {
      fetchProducts();
      fetchCategories();
    }
  };
}