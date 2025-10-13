import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const supabaseUrl = 'https://lwwtfodpnqyceuqomopj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d3Rmb2RwbnF5Y2V1cW9tb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk4MDMsImV4cCI6MjA3NTc1NTgwM30.1cr-bOgfZO97ijgww3sNUPTBEjVMa3RC8pQMOnrmftI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDatabaseSimple() {
    console.log('🔥🔥🔥 RESET SIMPLES DO BANCO DE DADOS 🔥🔥🔥');
    
    try {
        // 1. Limpar dados existentes
        console.log('🧹 Limpando dados existentes...');
        
        // Deletar order_items primeiro (FK para orders)
        await supabase.from('order_items').delete().gte('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ order_items limpos');
        
        // Deletar orders
        await supabase.from('orders').delete().gte('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ orders limpos');
        
        // Deletar products
        await supabase.from('products').delete().gte('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ products limpos');
        
        // Deletar categories
        await supabase.from('categories').delete().gte('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ categories limpos');
        
        // Deletar customers
        await supabase.from('customers').delete().gte('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ customers limpos');
        
        // Deletar admins
        await supabase.from('admins').delete().gte('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ admins limpos');
        
        // 2. Inserir categorias
        console.log('➕ Inserindo categorias...');
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
            console.error('❌ Erro ao inserir categorias:', catError);
            return;
        } else {
            console.log('✅ Categorias inseridas:', categories?.length);
        }
        
        // 3. Inserir produtos
        console.log('➕ Inserindo produtos...');
        const hotDogsCategory = categories?.find(c => c.slug === 'hot-dogs');
        const combosCategory = categories?.find(c => c.slug === 'combos');
        const bebidasCategory = categories?.find(c => c.slug === 'bebidas');
        const acompanhamentosCategory = categories?.find(c => c.slug === 'acompanhamentos');
        
        const productsToInsert = [
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
                category_id: hotDogsCategory?.id,
                name: 'Dog Vegetariano',
                slug: 'dog-vegetariano',
                description: 'Salsicha vegana, batata palha, milho, ervilha, queijo vegano e molhos',
                price: 11.50,
                available: true,
                featured: false,
                ingredients: ['salsicha vegana', 'pão integral', 'batata palha', 'milho', 'ervilha', 'queijo vegano', 'maionese vegana'],
                preparation_time: 12
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
                category_id: combosCategory?.id,
                name: 'Combo Especial',
                slug: 'combo-especial',
                description: 'Hot dog especial + batata frita + refrigerante lata',
                price: 20.90,
                available: true,
                featured: false,
                ingredients: ['hot dog especial', 'batata frita', 'refrigerante lata'],
                preparation_time: 20
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
                category_id: bebidasCategory?.id,
                name: 'Refrigerante 600ml',
                slug: 'refrigerante-600ml',
                description: 'Coca-Cola, Guaraná, Fanta ou Sprite - 600ml',
                price: 6.90,
                available: true,
                featured: false,
                ingredients: ['refrigerante'],
                preparation_time: 2
            },
            {
                category_id: bebidasCategory?.id,
                name: 'Suco Natural',
                slug: 'suco-natural',
                description: 'Suco natural de laranja, limão ou maracujá - 300ml',
                price: 5.50,
                available: true,
                featured: false,
                ingredients: ['suco natural'],
                preparation_time: 5
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
            },
            {
                category_id: acompanhamentosCategory?.id,
                name: 'Onion Rings',
                slug: 'onion-rings',
                description: 'Anéis de cebola empanados e fritos',
                price: 9.90,
                available: true,
                featured: false,
                ingredients: ['cebola', 'farinha', 'óleo'],
                preparation_time: 10
            }
        ];
        
        const { data: products, error: prodError } = await supabase
            .from('products')
            .insert(productsToInsert)
            .select();
            
        if (prodError) {
            console.error('❌ Erro ao inserir produtos:', prodError);
        } else {
            console.log('✅ Produtos inseridos:', products?.length);
        }
        
        // 4. Inserir admin
        console.log('➕ Inserindo admin...');
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
            console.error('❌ Erro ao inserir admin:', adminError);
        } else {
            console.log('✅ Admin inserido:', admin?.length);
        }
        
        // 5. Verificar dados
        console.log('🔍 Verificando dados inseridos...');
        
        const { data: finalCategories } = await supabase.from('categories').select('*');
        const { data: finalProducts } = await supabase.from('products').select('*');
        const { data: finalAdmins } = await supabase.from('admins').select('*');
        
        console.log('🎉🎉🎉 RESET DO BANCO CONCLUÍDO COM SUCESSO! 🎉🎉🎉');
        console.log('📊 Resumo final:');
        console.log(`- ${finalCategories?.length || 0} categorias no banco`);
        console.log(`- ${finalProducts?.length || 0} produtos no banco`);
        console.log(`- ${finalAdmins?.length || 0} administradores no banco`);
        
        return {
            success: true,
            categories: finalCategories?.length || 0,
            products: finalProducts?.length || 0,
            admins: finalAdmins?.length || 0
        };
        
    } catch (error) {
        console.error('❌ Erro durante o reset:', error);
        return { success: false, error: error.message };
    }
}

// Executar o reset
resetDatabaseSimple();