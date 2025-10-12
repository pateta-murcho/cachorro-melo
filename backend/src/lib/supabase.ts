import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Carregar variáveis de ambiente do arquivo .env no diretório backend
dotenv.config({ path: path.join(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para as tabelas
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  available: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  payment_method: 'PIX' | 'CASH' | 'CARD';
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  delivery_address: string;
  observations?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  otp?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  observations?: string;
  product?: Product;
}

export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Função para verificar conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Erro na conexão com Supabase:', error)
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida')
    return true
  } catch (error) {
    console.error('Erro na conexão com Supabase:', error)
    return false
  }
}