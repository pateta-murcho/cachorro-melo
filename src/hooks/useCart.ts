import { useState, useEffect } from 'react';
import { Product } from '@/services/products';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  observations?: string;
}

const CART_STORAGE_KEY = 'cachorromelo-cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  // Carregar carrinho do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  }, []);

  // Salvar no localStorage sempre que o carrinho mudar
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }, [items]);

  const addItem = (product: Product, quantity: number = 1, observations?: string) => {
    setItems(current => {
      const existingItem = current.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return current.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, observations: observations || item.observations }
            : item
        );
      }
      
      return [...current, {
        id: `${product.id}-${Date.now()}`,
        product,
        quantity,
        observations
      }];
    });

    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setItems(current => current.filter(item => item.id !== itemId));
    
    toast({
      title: "Item removido",
      description: "Item removido do carrinho",
    });
  };

  const updateObservations = (itemId: string, observations: string) => {
    setItems(current =>
      current.map(item =>
        item.id === itemId ? { ...item, observations } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getItemsCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    updateObservations,
    clearCart,
    getTotal,
    getItemsCount,
    isEmpty: items.length === 0
  };
}