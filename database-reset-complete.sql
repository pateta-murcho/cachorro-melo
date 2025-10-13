-- 🔥🔥🔥 RESET COMPLETO DO BANCO DE DADOS CACHORRO MELO 🔥🔥🔥
-- Este script deleta TUDO e recria do zero

-- =============================================
-- 1. DELETAR TODAS AS TABELAS EXISTENTES
-- =============================================

-- Deletar tabelas em ordem (respeitando foreign keys)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Deletar sequences se existirem
DROP SEQUENCE IF EXISTS categories_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS customers_id_seq CASCADE;
DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;
DROP SEQUENCE IF EXISTS order_items_id_seq CASCADE;
DROP SEQUENCE IF EXISTS admins_id_seq CASCADE;

-- =============================================
-- 2. CRIAR TABELAS DO ZERO
-- =============================================

-- Tabela de Categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    ingredients TEXT[],
    allergens TEXT[],
    preparation_time INTEGER DEFAULT 15, -- em minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Clientes
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    neighborhood VARCHAR(100),
    city VARCHAR(100) DEFAULT 'São Paulo',
    state VARCHAR(2) DEFAULT 'SP',
    zip_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Pedidos
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number INTEGER GENERATED ALWAYS AS IDENTITY,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    delivery_fee DECIMAL(10,2) DEFAULT 5.00,
    payment_method VARCHAR(50) DEFAULT 'money' CHECK (payment_method IN ('money', 'card', 'pix')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    delivery_address TEXT NOT NULL,
    delivery_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Itens do Pedido
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL, -- Cópia do nome para histórico
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Administradores
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'kitchen', 'manager')),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para produtos
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_slug ON products(slug);

-- Índices para pedidos
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Índices para itens do pedido
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Índices para clientes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

-- =============================================
-- 4. CRIAR TRIGGERS PARA UPDATED_AT
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. INSERIR DADOS INICIAIS
-- =============================================

-- Categorias iniciais
INSERT INTO categories (name, slug, description) VALUES
('Hot Dogs', 'hot-dogs', 'Deliciosos hot dogs com ingredientes frescos'),
('Combos', 'combos', 'Combos especiais com hot dog + acompanhamento + bebida'),
('Bebidas', 'bebidas', 'Bebidas geladas para acompanhar'),
('Acompanhamentos', 'acompanhamentos', 'Batata frita, onion rings e outros acompanhamentos');

-- Produtos iniciais
INSERT INTO products (category_id, name, slug, description, price, available, featured, ingredients, preparation_time) VALUES
-- Hot Dogs
((SELECT id FROM categories WHERE slug = 'hot-dogs'), 'Cachorro-quente Tradicional', 'hot-dog-tradicional', 'Salsicha, batata palha, milho, ervilha, queijo e molhos especiais', 8.50, true, true, ARRAY['salsicha', 'pão', 'batata palha', 'milho', 'ervilha', 'queijo', 'maionese', 'ketchup', 'mostarda'], 10),

((SELECT id FROM categories WHERE slug = 'hot-dogs'), 'Cachorro-quente Especial', 'hot-dog-especial', 'Salsicha, bacon, ovo, batata palha, milho, ervilha, queijo e molhos', 12.90, true, true, ARRAY['salsicha', 'bacon', 'ovo', 'pão', 'batata palha', 'milho', 'ervilha', 'queijo', 'maionese', 'ketchup', 'mostarda'], 15),

((SELECT id FROM categories WHERE slug = 'hot-dogs'), 'X-Dog Burguer', 'x-dog-burger', 'Hambúrguer de carne, salsicha, bacon, queijo, alface, tomate e molhos', 15.90, true, false, ARRAY['hambúrguer', 'salsicha', 'bacon', 'queijo', 'alface', 'tomate', 'pão', 'maionese', 'ketchup'], 20),

((SELECT id FROM categories WHERE slug = 'hot-dogs'), 'Dog Vegetariano', 'dog-vegetariano', 'Salsicha vegana, batata palha, milho, ervilha, queijo vegano e molhos', 11.50, true, false, ARRAY['salsicha vegana', 'pão integral', 'batata palha', 'milho', 'ervilha', 'queijo vegano', 'maionese vegana'], 12),

-- Combos
((SELECT id FROM categories WHERE slug = 'combos'), 'Combo Tradicional', 'combo-tradicional', 'Hot dog tradicional + batata frita + refrigerante lata', 16.90, true, true, ARRAY['hot dog tradicional', 'batata frita', 'refrigerante lata'], 15),

((SELECT id FROM categories WHERE slug = 'combos'), 'Combo Especial', 'combo-especial', 'Hot dog especial + batata frita + refrigerante lata', 20.90, true, false, ARRAY['hot dog especial', 'batata frita', 'refrigerante lata'], 20),

-- Bebidas
((SELECT id FROM categories WHERE slug = 'bebidas'), 'Refrigerante Lata', 'refrigerante-lata', 'Coca-Cola, Guaraná, Fanta ou Sprite - 350ml', 4.50, true, false, ARRAY['refrigerante'], 2),

((SELECT id FROM categories WHERE slug = 'bebidas'), 'Refrigerante 600ml', 'refrigerante-600ml', 'Coca-Cola, Guaraná, Fanta ou Sprite - 600ml', 6.90, true, false, ARRAY['refrigerante'], 2),

((SELECT id FROM categories WHERE slug = 'bebidas'), 'Suco Natural', 'suco-natural', 'Suco natural de laranja, limão ou maracujá - 300ml', 5.50, true, false, ARRAY['suco natural'], 5),

-- Acompanhamentos
((SELECT id FROM categories WHERE slug = 'acompanhamentos'), 'Batata Frita', 'batata-frita', 'Porção de batata frita crocante', 8.90, true, false, ARRAY['batata', 'óleo', 'sal'], 8),

((SELECT id FROM categories WHERE slug = 'acompanhamentos'), 'Onion Rings', 'onion-rings', 'Anéis de cebola empanados e fritos', 9.90, true, false, ARRAY['cebola', 'farinha', 'óleo'], 10);

-- Admin padrão
INSERT INTO admins (name, email, password_hash, role) VALUES
('Administrador', 'admin@cachorromelo.com', '$2a$10$rYvCm8.rB5/UpHVVqj5yL.JL5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E', 'admin');

-- =============================================
-- 6. HABILITAR RLS (ROW LEVEL SECURITY)
-- =============================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permissivas para desenvolvimento)
CREATE POLICY "Permitir tudo para autenticados" ON customers FOR ALL USING (true);
CREATE POLICY "Permitir tudo para autenticados" ON orders FOR ALL USING (true);
CREATE POLICY "Permitir tudo para autenticados" ON order_items FOR ALL USING (true);
CREATE POLICY "Permitir tudo para autenticados" ON admins FOR ALL USING (true);

-- =============================================
-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================

COMMENT ON TABLE categories IS 'Categorias de produtos (Hot Dogs, Combos, Bebidas, etc)';
COMMENT ON TABLE products IS 'Produtos disponíveis no cardápio';
COMMENT ON TABLE customers IS 'Clientes que fazem pedidos';
COMMENT ON TABLE orders IS 'Pedidos realizados pelos clientes';
COMMENT ON TABLE order_items IS 'Itens individuais de cada pedido';
COMMENT ON TABLE admins IS 'Usuários administradores do sistema';

-- =============================================
-- FINALIZADO! 
-- =============================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'TABELAS CRIADAS:' as info,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

SELECT 
    'DADOS INSERIDOS:' as info,
    (SELECT COUNT(*) FROM categories) as categories,
    (SELECT COUNT(*) FROM products) as products,
    (SELECT COUNT(*) FROM admins) as admins;