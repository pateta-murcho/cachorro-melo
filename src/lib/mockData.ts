// Mock data for Cachorro Melo
import { Product } from "@/components/ProductCard";

// Import generated food images
import hotdogTradicional from "@/assets/hotdog-tradicional.jpg";
import hotdogEspecial from "@/assets/hotdog-especial.jpg";
import xdogBurger from "@/assets/xdog-burger.jpg";
import dogVegetariano from "@/assets/dog-vegetariano.jpg";
import comboDogBatata from "@/assets/combo-dog-batata.jpg";
import refrigerantes from "@/assets/refrigerantes.jpg";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  observations?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    observations?: string;
  };
  paymentMethod: 'pix' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';
  createdAt: Date;
  estimatedDelivery?: Date;
  otp?: string;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Cachorro-quente Tradicional",
    description: "Salsicha, batata palha, milho, ervilha, queijo e molhos especiais",
    price: 12.50,
    image: hotdogTradicional,
    category: "tradicional",
    available: true
  },
  {
    id: "2", 
    name: "Cachorro-quente Especial",
    description: "Salsicha, bacon, queijo derretido, batata palha, milho, ervilha, ovo de codorna",
    price: 16.90,
    image: hotdogEspecial,
    category: "especial",
    available: true
  },
  {
    id: "3",
    name: "X-Dog Burguer",
    description: "Hamburger artesanal, salsicha, queijo, alface, tomate, bacon",
    price: 19.90,
    image: xdogBurger,
    category: "especial",
    available: true
  },
  {
    id: "4",
    name: "Dog Vegetariano",
    description: "Salsicha de soja, queijo vegano, batata palha, milho, ervilha",
    price: 14.50,
    image: dogVegetariano,
    category: "vegetariano", 
    available: true
  },
  {
    id: "5",
    name: "Combo Dog + Batata",
    description: "Cachorro-quente tradicional + porção de batata frita + refrigerante",
    price: 22.90,
    image: comboDogBatata,
    category: "combo",
    available: true
  },
  {
    id: "6",
    name: "Refrigerante Lata",
    description: "Coca-Cola, Guaraná, Fanta - 350ml",
    price: 4.50,
    image: refrigerantes,
    category: "bebidas",
    available: true
  }
];

export const categories = [
  { id: "all", name: "Todos", icon: "🌭" },
  { id: "tradicional", name: "Tradicional", icon: "🌭" },
  { id: "especial", name: "Especial", icon: "⭐" },
  { id: "vegetariano", name: "Vegetariano", icon: "🥬" },
  { id: "combo", name: "Combos", icon: "🍟" },
  { id: "bebidas", name: "Bebidas", icon: "🥤" }
];

// In-memory store simulation
class MockStore {
  private cart: CartItem[] = [];
  private orders: Order[] = [];

  // Cart methods
  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        product,
        quantity,
      });
    }
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter(item => item.id !== productId);
  }

  updateCartItemQuantity(productId: string, quantity: number): void {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  clearCart(): void {
    this.cart = [];
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  // Order methods
  createOrder(customerInfo: any, paymentMethod: 'pix' | 'delivery'): Order {
    const order: Order = {
      id: Date.now().toString(),
      items: [...this.cart],
      total: this.getCartTotal(),
      customerInfo,
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 40 * 60 * 1000), // 40 minutes
    };
    
    this.orders.push(order);
    this.clearCart();
    return order;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.find(order => order.id === orderId);
  }

  updateOrderStatus(orderId: string, status: Order['status'], otp?: string): void {
    const order = this.orders.find(order => order.id === orderId);
    if (order) {
      order.status = status;
      if (otp) order.otp = otp;
    }
  }
}

export const mockStore = new MockStore();