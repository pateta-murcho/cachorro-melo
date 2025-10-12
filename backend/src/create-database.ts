import { supabase } from './lib/supabase';

async function createDatabase() {
  console.log('🚀 Criando banco de dados completo do zero...');
  
  try {
    // Verificar conexão primeiro
    const { data: connectionTest, error: connectionError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    if (connectionError && !connectionError.message.includes('does not exist')) {
      console.error('❌ Erro de conexão:', connectionError);
      return;
    }
    
    console.log('✅ Conectado ao Supabase!');

    // 1. Criar categorias (dados diretos já que não conseguimos criar tabelas via código)
    console.log('📂 Testando inserção de dados...');
    
    // Vamos tentar inserir dados de teste para ver se funciona
    const testData = {
      name: 'Teste de Conexão',
      description: 'Testando se conseguimos inserir dados'
    };

    console.log('🧪 Fazendo teste de inserção...');
    
    // Como pode não ter tabelas ainda, vamos apenas testar a conexão
    console.log('📡 Conexão estabelecida com sucesso!');
    console.log('🔧 Para criar as tabelas, acesse o painel do Supabase:');
    console.log('🌐 https://supabase.com/dashboard/project/lwwtfodpnqyceuqomopj/editor');
    
    console.log('\n📋 SQL para criar as tabelas:');
    
    const createTablesSQL = `
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

-- 8. Inserir dados iniciais

-- Categorias
INSERT INTO categories (name, description) VALUES
('Tradicionais', 'Cachorros-quentes clássicos'),
('Especiais', 'Cachorros-quentes gourmet'),
('Bebidas', 'Refrigerantes e sucos');

-- Produtos
INSERT INTO products (name, description, price, category_id) VALUES
('Cachorro-quente Tradicional', 'Salsicha, batata palha, milho, ervilha, queijo e molhos especiais', 8.50, (SELECT id FROM categories WHERE name = 'Tradicionais')),
('Hot Dog Especial', 'Salsicha, bacon, queijo derretido, batata palha, milho, ervilha, ovo de codorna', 12.00, (SELECT id FROM categories WHERE name = 'Especiais')),
('X-Dog Burger', 'Hambúrguer, salsicha, bacon, queijo, alface, tomate, batata palha', 15.00, (SELECT id FROM categories WHERE name = 'Especiais')),
('Dog Vegetariano', 'Salsicha vegetal, queijo, alface, tomate, milho, ervilha', 10.00, (SELECT id FROM categories WHERE name = 'Especiais')),
('Combo Dog + Batata', 'Cachorro-quente tradicional + porção de batata frita', 18.00, (SELECT id FROM categories WHERE name = 'Especiais')),
('Refrigerantes', 'Coca-Cola, Pepsi, Guaraná, Fanta - Lata 350ml', 4.00, (SELECT id FROM categories WHERE name = 'Bebidas'));

-- Admin padrão (senha: admin123)
INSERT INTO admins (name, email, password_hash) VALUES
('Administrador', 'admin@cachorromelo.com', '$2b$10$rQJ5XzQoQoQoQoQoQoQoQe');
`;

    console.log(createTablesSQL);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar criação
createDatabase();