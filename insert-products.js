import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const supabaseUrl = 'https://lwwtfodpnqyceuqomopj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d3Rmb2RwbnF5Y2V1cW9tb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk4MDMsImV4cCI6MjA3NTc1NTgwM30.1cr-bOgfZO97ijgww3sNUPTBEjVMa3RC8pQMOnrmftI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertProductsWithoutSlug() {
    console.log('➕ Inserindo produtos SEM campo slug...');
    
    try {
        // Buscar categorias
        const { data: categories } = await supabase.from('categories').select('*');
        console.log('Categorias encontradas:', categories?.map(c => `${c.name} (${c.slug})`));
        
        const hotDogsCategory = categories?.find(c => c.slug === 'hot-dogs');
        const combosCategory = categories?.find(c => c.slug === 'combos');
        const bebidasCategory = categories?.find(c => c.slug === 'bebidas');
        const acompanhamentosCategory = categories?.find(c => c.slug === 'acompanhamentos');
        
        // Produtos sem slug
        const productsToInsert = [
            {
                category_id: hotDogsCategory?.id,
                name: 'Cachorro-quente Tradicional',
                description: 'Salsicha, batata palha, milho, ervilha, queijo e molhos especiais',
                price: 8.50,
                available: true,
                featured: true
            },
            {
                category_id: hotDogsCategory?.id,
                name: 'Cachorro-quente Especial',
                description: 'Salsicha, bacon, ovo, batata palha, milho, ervilha, queijo e molhos',
                price: 12.90,
                available: true,
                featured: true
            },
            {
                category_id: hotDogsCategory?.id,
                name: 'X-Dog Burguer',
                description: 'Hambúrguer de carne, salsicha, bacon, queijo, alface, tomate e molhos',
                price: 15.90,
                available: true,
                featured: false
            },
            {
                category_id: hotDogsCategory?.id,
                name: 'Dog Vegetariano',
                description: 'Salsicha vegana, batata palha, milho, ervilha, queijo vegano e molhos',
                price: 11.50,
                available: true,
                featured: false
            },
            {
                category_id: combosCategory?.id,
                name: 'Combo Tradicional',
                description: 'Hot dog tradicional + batata frita + refrigerante lata',
                price: 16.90,
                available: true,
                featured: true
            },
            {
                category_id: combosCategory?.id,
                name: 'Combo Especial',
                description: 'Hot dog especial + batata frita + refrigerante lata',
                price: 20.90,
                available: true,
                featured: false
            },
            {
                category_id: bebidasCategory?.id,
                name: 'Refrigerante Lata',
                description: 'Coca-Cola, Guaraná, Fanta ou Sprite - 350ml',
                price: 4.50,
                available: true,
                featured: false
            },
            {
                category_id: bebidasCategory?.id,
                name: 'Refrigerante 600ml',
                description: 'Coca-Cola, Guaraná, Fanta ou Sprite - 600ml',
                price: 6.90,
                available: true,
                featured: false
            },
            {
                category_id: bebidasCategory?.id,
                name: 'Suco Natural',
                description: 'Suco natural de laranja, limão ou maracujá - 300ml',
                price: 5.50,
                available: true,
                featured: false
            },
            {
                category_id: acompanhamentosCategory?.id,
                name: 'Batata Frita',
                description: 'Porção de batata frita crocante',
                price: 8.90,
                available: true,
                featured: false
            },
            {
                category_id: acompanhamentosCategory?.id,
                name: 'Onion Rings',
                description: 'Anéis de cebola empanados e fritos',
                price: 9.90,
                available: true,
                featured: false
            }
        ];
        
        console.log('Tentando inserir produtos...');
        const { data: products, error: prodError } = await supabase
            .from('products')
            .insert(productsToInsert)
            .select();
            
        if (prodError) {
            console.error('❌ Erro ao inserir produtos:', prodError);
        } else {
            console.log('✅ Produtos inseridos:', products?.length);
        }
        
        // Verificar resultado
        const { data: allProducts } = await supabase.from('products').select('*');
        console.log('📊 Total de produtos no banco:', allProducts?.length);
        
        // Mostrar alguns produtos
        if (allProducts && allProducts.length > 0) {
            console.log('📋 Produtos inseridos:');
            allProducts.forEach(p => {
                console.log(`- ${p.name}: R$ ${p.price}`);
            });
        }
        
        return products;
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Executar inserção
insertProductsWithoutSlug();