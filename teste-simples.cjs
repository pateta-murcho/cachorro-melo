// 🔥 TESTE SIMPLIFICADO PARA NODE.JS ANTIGO
const http = require('http');

console.log('🚀🚀🚀 INICIANDO TESTE SIMPLIFICADO 🚀🚀🚀');

function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: url,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function executarTestes() {
    const resultados = [];
    
    console.log('\n🧪 TESTANDO BACKEND HEALTH...');
    try {
        const health = await makeRequest('/health');
        if (health.status === 200) {
            console.log('✅ Backend Health: OK');
            resultados.push({ teste: 'Backend Health', status: '✅', detalhes: 'OK' });
        } else {
            console.log('❌ Backend Health: FALHOU');
            resultados.push({ teste: 'Backend Health', status: '❌', detalhes: `Status ${health.status}` });
        }
    } catch (error) {
        console.log('❌ Backend Health: ERRO -', error.message);
        resultados.push({ teste: 'Backend Health', status: '❌', detalhes: error.message });
    }

    console.log('\n🧪 TESTANDO SUPABASE...');
    try {
        const supabase = await makeRequest('/api/test-supabase');
        if (supabase.status === 200 && supabase.data.success) {
            console.log('✅ Supabase: CONECTADO');
            resultados.push({ teste: 'Supabase', status: '✅', detalhes: 'Conectado' });
        } else {
            console.log('❌ Supabase: FALHOU');
            resultados.push({ teste: 'Supabase', status: '❌', detalhes: 'Falha na conexão' });
        }
    } catch (error) {
        console.log('❌ Supabase: ERRO -', error.message);
        resultados.push({ teste: 'Supabase', status: '❌', detalhes: error.message });
    }

    console.log('\n🧪 TESTANDO PRODUTOS...');
    try {
        const products = await makeRequest('/api/products');
        if (products.status === 200 && products.data.success) {
            const count = products.data.data.length;
            console.log(`✅ Produtos: ${count} produtos carregados`);
            resultados.push({ teste: 'Produtos', status: '✅', detalhes: `${count} produtos` });
        } else {
            console.log('❌ Produtos: FALHOU');
            resultados.push({ teste: 'Produtos', status: '❌', detalhes: 'Falha ao carregar' });
        }
    } catch (error) {
        console.log('❌ Produtos: ERRO -', error.message);
        resultados.push({ teste: 'Produtos', status: '❌', detalhes: error.message });
    }

    console.log('\n🧪 TESTANDO CATEGORIAS...');
    try {
        const categories = await makeRequest('/api/categories');
        if (categories.status === 200 && categories.data.success) {
            const count = categories.data.data.length;
            console.log(`✅ Categorias: ${count} categorias carregadas`);
            resultados.push({ teste: 'Categorias', status: '✅', detalhes: `${count} categorias` });
        } else {
            console.log('❌ Categorias: FALHOU');
            resultados.push({ teste: 'Categorias', status: '❌', detalhes: 'Falha ao carregar' });
        }
    } catch (error) {
        console.log('❌ Categorias: ERRO -', error.message);
        resultados.push({ teste: 'Categorias', status: '❌', detalhes: error.message });
    }

    console.log('\n🧪 TESTANDO ADMIN LOGIN...');
    try {
        const login = await makeRequest('/api/auth/login', 'POST', {
            email: 'admin@cachorromelo.com',
            password: 'admin123'
        });
        if (login.status === 200 && login.data.success) {
            console.log('✅ Admin Login: OK');
            resultados.push({ teste: 'Admin Login', status: '✅', detalhes: 'Login OK' });
        } else {
            console.log('❌ Admin Login: FALHOU');
            resultados.push({ teste: 'Admin Login', status: '❌', detalhes: 'Credenciais inválidas' });
        }
    } catch (error) {
        console.log('❌ Admin Login: ERRO -', error.message);
        resultados.push({ teste: 'Admin Login', status: '❌', detalhes: error.message });
    }

    console.log('\n🧪 TESTANDO CRIAR PEDIDO...');
    try {
        const pedido = {
            customer: {
                name: 'João Teste',
                phone: '11999999999',
                email: 'teste@teste.com'
            },
            items: [
                {
                    productId: 'test-product-id',
                    name: 'Hot Dog Teste',
                    quantity: 1,
                    price: 10.00
                }
            ],
            total: 10.00,
            deliveryAddress: 'Rua Teste, 123',
            paymentMethod: 'money'
        };

        const order = await makeRequest('/api/orders', 'POST', pedido);
        if (order.status === 200 && order.data.success) {
            console.log('✅ Criar Pedido: OK');
            resultados.push({ teste: 'Criar Pedido', status: '✅', detalhes: 'Pedido criado' });
        } else {
            console.log('❌ Criar Pedido: FALHOU -', order.data?.error?.message || 'Erro desconhecido');
            resultados.push({ teste: 'Criar Pedido', status: '❌', detalhes: order.data?.error?.message || 'Erro desconhecido' });
        }
    } catch (error) {
        console.log('❌ Criar Pedido: ERRO -', error.message);
        resultados.push({ teste: 'Criar Pedido', status: '❌', detalhes: error.message });
    }

    console.log('\n🧪 TESTANDO BUSCAR PEDIDOS...');
    try {
        const orders = await makeRequest('/api/orders');
        if (orders.status === 200 && orders.data.success) {
            const count = orders.data.data.length;
            console.log(`✅ Buscar Pedidos: ${count} pedidos encontrados`);
            resultados.push({ teste: 'Buscar Pedidos', status: '✅', detalhes: `${count} pedidos` });
        } else {
            console.log('❌ Buscar Pedidos: FALHOU');
            resultados.push({ teste: 'Buscar Pedidos', status: '❌', detalhes: 'Falha ao buscar' });
        }
    } catch (error) {
        console.log('❌ Buscar Pedidos: ERRO -', error.message);
        resultados.push({ teste: 'Buscar Pedidos', status: '❌', detalhes: error.message });
    }

    // Relatório final
    console.log('\n🔥🔥🔥 RELATÓRIO FINAL 🔥🔥🔥');
    console.log('=====================================');
    
    const passou = resultados.filter(r => r.status === '✅').length;
    const total = resultados.length;
    
    resultados.forEach(r => {
        console.log(`${r.status} ${r.teste}: ${r.detalhes}`);
    });
    
    console.log(`\n📊 RESULTADO: ${passou}/${total} testes passaram (${Math.round((passou/total)*100)}%)`);
    
    if (passou === total) {
        console.log('\n🎉🎉🎉 TODOS OS TESTES PASSARAM! SISTEMA FUNCIONANDO! 🎉🎉🎉');
    } else {
        console.log('\n⚠️⚠️⚠️ ALGUNS TESTES FALHARAM - VERIFICAR LOGS ⚠️⚠️⚠️');
    }
    console.log('=====================================');
}

// Aguardar um pouco e executar
setTimeout(() => {
    executarTestes().catch(console.error);
}, 1000);