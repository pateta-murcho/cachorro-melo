-- ===================================================================
-- CACHORRO MELO DELIVERY - SCRIPT COMPLETO DE CRIAÇÃO DO BANCO
-- Execute este SQL no painel do Supabase: SQL Editor
-- ===================================================================

-- 1. Criar tipos enum
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'PIX', 'CARD', 'DEBIT');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- 2. Criar tabela de categorias
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR(255),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'PENDING',
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'PENDING',
  delivery_address TEXT NOT NULL,
  observations TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  otp VARCHAR(6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela de itens do pedido
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Criar tabela de administradores
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- INSERIR DADOS INICIAIS
-- ===================================================================

-- Inserir categorias
INSERT INTO categories (name, description) VALUES
('Tradicionais', 'Cachorros-quentes clássicos e saborosos'),
('Especiais', 'Cachorros-quentes gourmet e diferenciados'),
('Bebidas', 'Refrigerantes, sucos e bebidas geladas');

-- Inserir produtos
INSERT INTO products (name, description, price, category_id) VALUES
('Cachorro-quente Tradicional', 'Salsicha, batata palha, milho, ervilha, queijo e molhos especiais', 8.50, (SELECT id FROM categories WHERE name = 'Tradicionais')),
('Hot Dog Especial', 'Salsicha, bacon, queijo derretido, batata palha, milho, ervilha, ovo de codorna', 12.00, (SELECT id FROM categories WHERE name = 'Especiais')),
('X-Dog Burger', 'Hambúrguer, salsicha, bacon, queijo, alface, tomate, batata palha', 15.00, (SELECT id FROM categories WHERE name = 'Especiais')),
('Dog Vegetariano', 'Salsicha vegetal, queijo, alface, tomate, milho, ervilha', 10.00, (SELECT id FROM categories WHERE name = 'Especiais')),
('Combo Dog + Batata', 'Cachorro-quente tradicional + porção de batata frita', 18.00, (SELECT id FROM categories WHERE name = 'Especiais')),
('Refrigerantes', 'Coca-Cola, Pepsi, Guaraná, Fanta - Lata 350ml', 4.00, (SELECT id FROM categories WHERE name = 'Bebidas'));

-- Inserir admin padrão (senha será hashada no backend)
INSERT INTO admins (name, email, password_hash) VALUES
('Administrador', 'admin@cachorromelo.com', '$2b$10$placeholder_hash_sera_gerado_no_backend');

-- ===================================================================
-- CONFIGURAR RLS (Row Level Security) - OPCIONAL
-- ===================================================================

-- Habilitar RLS nas tabelas (opcional, para segurança)
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================================================

-- Índices para melhorar performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ===================================================================
-- VIEWS ÚTEIS (OPCIONAL)
-- ===================================================================

-- View para pedidos completos com informações do cliente
CREATE VIEW orders_complete AS
SELECT 
  o.id,
  o.total,
  o.status,
  o.payment_method,
  o.payment_status,
  o.delivery_address,
  o.observations,
  o.created_at,
  c.name as customer_name,
  c.phone as customer_phone,
  c.email as customer_email
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- View para produtos com categoria
CREATE VIEW products_with_category AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.available,
  p.created_at,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- ===================================================================
-- SCRIPT CONCLUÍDO
-- ===================================================================

-- Verificar se tudo foi criado corretamente
SELECT 
  'categories' as table_name, 
  count(*) as records 
FROM categories
UNION ALL
SELECT 
  'products' as table_name, 
  count(*) as records 
FROM products
UNION ALL
SELECT 
  'customers' as table_name, 
  count(*) as records 
FROM customers
UNION ALL
SELECT 
  'orders' as table_name, 
  count(*) as records 
FROM orders
UNION ALL
SELECT 
  'order_items' as table_name, 
  count(*) as records 
FROM order_items
UNION ALL
SELECT 
  'admins' as table_name, 
  count(*) as records 
FROM admins;