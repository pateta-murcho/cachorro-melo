import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const supabaseUrl = 'https://lwwtfodpnqyceuqomopj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d3Rmb2RwbnF5Y2V1cW9tb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk4MDMsImV4cCI6MjA3NTc1NTgwM30.1cr-bOgfZO97ijgww3sNUPTBEjVMa3RC8pQMOnrmftI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDatabase() {
    console.log('🔥🔥🔥 INICIANDO RESET COMPLETO DO BANCO DE DADOS 🔥🔥🔥');
    
    try {
        // 1. Deletar todas as tabelas
        console.log('🗑️ Deletando tabelas existentes...');
        
        const dropCommands = [
            'DROP TABLE IF EXISTS order_items CASCADE',
            'DROP TABLE IF EXISTS orders CASCADE', 
            'DROP TABLE IF EXISTS products CASCADE',
            'DROP TABLE IF EXISTS categories CASCADE',
            'DROP TABLE IF EXISTS customers CASCADE',
            'DROP TABLE IF EXISTS admins CASCADE'
        ];
        
        for (const command of dropCommands) {
            console.log(`Executando: ${command}`);
            const { error } = await supabase.rpc('exec_sql', { sql: command });
            if (error) {
                console.log(`⚠️ Aviso: ${error.message}`);
            }
        }
        
        // 2. Criar tabelas
        console.log('🏗️ Criando novas tabelas...');
        
        // Categorias
        const createCategories = `
        CREATE TABLE categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            image_url TEXT,
            active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )`;
        
        console.log('Criando tabela categories...');
        await supabase.rpc('exec_sql', { sql: createCategories });
        
        // Produtos
        const createProducts = `
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
            preparation_time INTEGER DEFAULT 15,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )`;
        
        console.log('Criando tabela products...');
        await supabase.rpc('exec_sql', { sql: createProducts });
        
        // Clientes
        const createCustomers = `
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
        )`;
        
        console.log('Criando tabela customers...');
        await supabase.rpc('exec_sql', { sql: createCustomers });
        
        // Pedidos
        const createOrders = `
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
        )`;
        
        console.log('Criando tabela orders...');
        await supabase.rpc('exec_sql', { sql: createOrders });
        
        // Itens do pedido
        const createOrderItems = `
        CREATE TABLE order_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id) ON DELETE SET NULL,
            product_name VARCHAR(200) NOT NULL,
            quantity INTEGER NOT NULL CHECK (quantity > 0),
            unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
            total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )`;
        
        console.log('Criando tabela order_items...');
        await supabase.rpc('exec_sql', { sql: createOrderItems });
        
        // Admins
        const createAdmins = `
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
        )`;
        
        console.log('Criando tabela admins...');
        await supabase.rpc('exec_sql', { sql: createAdmins });
        
        // 3. Inserir dados iniciais
        console.log('➕ Inserindo dados iniciais...');
        
        // Categorias
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .insert([
                { name: 'Hot Dogs', slug: 'hot-dogs', description: 'Deliciosos hot dogs com ingredientes frescos' },
                { name: 'Combos', slug: 'combos', description: 'Combos especiais com hot dog + acompanhamento + bebida' },
                { name: 'Bebidas', slug: 'bebidas', description: 'Bebidas geladas para acompanhar' },
                { name: 'Acompanhamentos', slug: 'acompanhamentos', description: 'Batata frita, onion rings e outros acompanhamentos' }
            ])
            .select();
            
        if (catError) {
            console.error('Erro ao inserir categorias:', catError);
        } else {
            console.log('✅ Categorias inseridas:', categories?.length);
        }
        
        // Produtos
        const hotDogsCategory = categories?.find(c => c.slug === 'hot-dogs');
        const combosCategory = categories?.find(c => c.slug === 'combos');
        const bebidasCategory = categories?.find(c => c.slug === 'bebidas');
        const acompanhamentosCategory = categories?.find(c => c.slug === 'acompanhamentos');
        
        const { data: products, error: prodError } = await supabase
            .from('products')
            .insert([
                {
                    category_id: hotDogsCategory?.id,
                    name: 'Cachorro-quente Tradicional',
                    slug: 'hot-dog-tradicional',
                    description: 'Salsicha, batata palha, milho, ervilha, queijo e molhos especiais',
                    price: 8.50,
                    available: true,
                    featured: true,
                    ingredients: ['salsicha', 'pão', 'batata palha', 'milho', 'ervilha', 'queijo', 'maionese', 'ketchup', 'mostarda'],
                    preparation_time: 10
                },
                {
                    category_id: hotDogsCategory?.id,
                    name: 'Cachorro-quente Especial',
                    slug: 'hot-dog-especial',
                    description: 'Salsicha, bacon, ovo, batata palha, milho, ervilha, queijo e molhos',
                    price: 12.90,
                    available: true,
                    featured: true,
                    ingredients: ['salsicha', 'bacon', 'ovo', 'pão', 'batata palha', 'milho', 'ervilha', 'queijo', 'maionese', 'ketchup', 'mostarda'],
                    preparation_time: 15
                },
                {
                    category_id: hotDogsCategory?.id,
                    name: 'X-Dog Burguer',
                    slug: 'x-dog-burger',
                    description: 'Hambúrguer de carne, salsicha, bacon, queijo, alface, tomate e molhos',
                    price: 15.90,
                    available: true,
                    featured: false,
                    ingredients: ['hambúrguer', 'salsicha', 'bacon', 'queijo', 'alface', 'tomate', 'pão', 'maionese', 'ketchup'],
                    preparation_time: 20
                },
                {
                    category_id: combosCategory?.id,
                    name: 'Combo Tradicional',
                    slug: 'combo-tradicional',
                    description: 'Hot dog tradicional + batata frita + refrigerante lata',
                    price: 16.90,
                    available: true,
                    featured: true,
                    ingredients: ['hot dog tradicional', 'batata frita', 'refrigerante lata'],
                    preparation_time: 15
                },
                {
                    category_id: bebidasCategory?.id,
                    name: 'Refrigerante Lata',
                    slug: 'refrigerante-lata',
                    description: 'Coca-Cola, Guaraná, Fanta ou Sprite - 350ml',
                    price: 4.50,
                    available: true,
                    featured: false,
                    ingredients: ['refrigerante'],
                    preparation_time: 2
                },
                {
                    category_id: acompanhamentosCategory?.id,
                    name: 'Batata Frita',
                    slug: 'batata-frita',
                    description: 'Porção de batata frita crocante',
                    price: 8.90,
                    available: true,
                    featured: false,
                    ingredients: ['batata', 'óleo', 'sal'],
                    preparation_time: 8
                }
            ])
            .select();
            
        if (prodError) {
            console.error('Erro ao inserir produtos:', prodError);
        } else {
            console.log('✅ Produtos inseridos:', products?.length);
        }
        
        // Admin
        const { data: admin, error: adminError } = await supabase
            .from('admins')
            .insert([
                {
                    name: 'Administrador',
                    email: 'admin@cachorromelo.com',
                    password_hash: 'admin123', // Em produção, usar hash real
                    role: 'admin'
                }
            ])
            .select();
            
        if (adminError) {
            console.error('Erro ao inserir admin:', adminError);
        } else {
            console.log('✅ Admin inserido:', admin?.length);
        }
        
        console.log('🎉🎉🎉 RESET DO BANCO DE DADOS CONCLUÍDO COM SUCESSO! 🎉🎉🎉');
        console.log('📊 Resumo:');
        console.log(`- ${categories?.length || 0} categorias criadas`);
        console.log(`- ${products?.length || 0} produtos criados`);
        console.log(`- ${admin?.length || 0} administrador criado`);
        
    } catch (error) {
        console.error('❌ Erro durante o reset:', error);
    }
}

// Executar o reset
resetDatabase();