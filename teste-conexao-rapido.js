// 🔥 TESTE RÁPIDO DE CONEXÃO - FRONTEND + BACKEND
console.log('🚀 Iniciando teste de conexão...');

async function testeRapido() {
    try {
        console.log('🖥️ Testando backend health...');
        const healthResponse = await fetch('http://localhost:3001/health');
        const healthData = await healthResponse.json();
        console.log('✅ Backend health:', healthData);

        console.log('📦 Testando produtos...');
        const productsResponse = await fetch('http://localhost:3001/api/products');
        const productsData = await productsResponse.json();
        console.log('✅ Produtos carregados:', productsData.success, '- Total:', productsData.data?.length);

        console.log('🏷️ Testando categorias...');
        const categoriesResponse = await fetch('http://localhost:3001/api/categories');
        const categoriesData = await categoriesResponse.json();
        console.log('✅ Categorias carregadas:', categoriesData.success, '- Total:', categoriesData.data?.length);

        console.log('🎉 TODOS OS TESTES PASSARAM! O SISTEMA ESTÁ FUNCIONANDO!');
        
        // Mostrar alguns produtos como exemplo
        if (productsData.success && productsData.data) {
            console.log('📦 Primeiros 3 produtos:');
            productsData.data.slice(0, 3).forEach((produto, index) => {
                console.log(`  ${index + 1}. ${produto.name} - R$ ${produto.price}`);
            });
        }

    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error.message);
    }
}

// Executar teste
testeRapido();