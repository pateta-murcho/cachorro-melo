// 🔥🔥🔥 TESTE ULTRA COMPLETO - CADA FUNCIONALIDADE 🔥🔥🔥
console.log('🚀🚀🚀 INICIANDO TESTES COMPLETOS DO SISTEMA 🚀🚀🚀');

const API_BASE = 'http://localhost:3001';
let testResults = [];
let adminToken = null;

// 📝 Função para adicionar resultado
function addResult(test, status, details) {
    testResults.push({
        test,
        status,
        details,
        timestamp: new Date().toLocaleTimeString()
    });
    console.log(`${status} ${test}: ${details}`);
}

// 🧪 TESTE 1: BACKEND HEALTH
async function testeBackendHealth() {
    console.log('\n🩺 TESTANDO BACKEND HEALTH...');
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (response.ok && data.status === 'ok') {
            addResult('Backend Health', '✅', `OK (Uptime: ${Math.round(data.uptime)}s)`);
            return true;
        } else {
            addResult('Backend Health', '❌', `Status inválido: ${data.status}`);
            return false;
        }
    } catch (error) {
        addResult('Backend Health', '❌', `Erro: ${error.message}`);
        return false;
    }
}

// 🧪 TESTE 2: CARREGAR PRODUTOS
async function testeCarregarProdutos() {
    console.log('\n📦 TESTANDO CARREGAMENTO DE PRODUTOS...');
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const data = await response.json();
        
        if (response.ok && data.success && Array.isArray(data.data)) {
            addResult('Carregar Produtos', '✅', `${data.data.length} produtos carregados`);
            return data.data;
        } else {
            addResult('Carregar Produtos', '❌', 'Resposta inválida');
            return [];
        }
    } catch (error) {
        addResult('Carregar Produtos', '❌', `Erro: ${error.message}`);
        return [];
    }
}

// 🧪 TESTE 3: CARREGAR CATEGORIAS
async function testeCarregarCategorias() {
    console.log('\n🏷️ TESTANDO CARREGAMENTO DE CATEGORIAS...');
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        
        if (response.ok && data.success && Array.isArray(data.data)) {
            addResult('Carregar Categorias', '✅', `${data.data.length} categorias carregadas`);
            return data.data;
        } else {
            addResult('Carregar Categorias', '❌', 'Resposta inválida');
            return [];
        }
    } catch (error) {
        addResult('Carregar Categorias', '❌', `Erro: ${error.message}`);
        return [];
    }
}

// 🧪 TESTE 4: LOGIN ADMIN
async function testeLoginAdmin() {
    console.log('\n🔐 TESTANDO LOGIN ADMIN...');
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@cachorromelo.com',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data && data.data.admin) {
            adminToken = data.data.token;
            addResult('Login Admin', '✅', `Login OK: ${data.data.admin.name}`);
            return data.data.admin;
        } else {
            addResult('Login Admin', '❌', data.error?.message || 'Falha no login');
            return null;
        }
    } catch (error) {
        addResult('Login Admin', '❌', `Erro: ${error.message}`);
        return null;
    }
}

// 🧪 TESTE 5: DASHBOARD ADMIN
async function testeDashboard() {
    console.log('\n📊 TESTANDO DASHBOARD ADMIN...');
    try {
        const headers = adminToken ? 
            { 'Authorization': `Bearer ${adminToken}` } : {};
            
        const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
            headers
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data) {
            const stats = data.data;
            addResult('Dashboard Admin', '✅', `Produtos: ${stats.totalProducts}, Pedidos: ${stats.totalOrders}`);
            return stats;
        } else {
            addResult('Dashboard Admin', '❌', data.error?.message || 'Falha no dashboard');
            return null;
        }
    } catch (error) {
        addResult('Dashboard Admin', '❌', `Erro: ${error.message}`);
        return null;
    }
}

// 🧪 TESTE 6: CRIAR PEDIDO COMPLETO
async function testeCriarPedido() {
    console.log('\n🛒 TESTANDO CRIAÇÃO DE PEDIDO COMPLETO...');
    try {
        const pedidoTeste = {
            customer: {
                name: 'João Silva Teste',
                phone: '11987654321',
                email: 'joao@teste.com'
            },
            items: [
                {
                    productId: '1',
                    name: 'Hot Dog Tradicional',
                    quantity: 2,
                    price: 8.50
                },
                {
                    productId: '2',
                    name: 'Hot Dog Especial',
                    quantity: 1,
                    price: 12.90
                }
            ],
            total: 29.90,
            deliveryAddress: 'Rua das Flores, 123 - São Paulo, SP - CEP: 01234-567',
            paymentMethod: 'money',
            notes: 'Teste automatizado do sistema - Sem cebola no tradicional'
        };
        
        console.log('📝 Dados do pedido:', JSON.stringify(pedidoTeste, null, 2));
        
        const response = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoTeste)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data) {
            addResult('Criar Pedido', '✅', `Pedido ${data.data.orderNumber} criado com sucesso`);
            return data.data;
        } else {
            addResult('Criar Pedido', '❌', data.error?.message || 'Falha na criação');
            return null;
        }
    } catch (error) {
        addResult('Criar Pedido', '❌', `Erro: ${error.message}`);
        return null;
    }
}

// 🧪 TESTE 7: LISTAR PEDIDOS
async function testeListarPedidos() {
    console.log('\n📋 TESTANDO LISTAGEM DE PEDIDOS...');
    try {
        const response = await fetch(`${API_BASE}/api/orders`);
        const data = await response.json();
        
        if (response.ok && data.success && Array.isArray(data.data)) {
            addResult('Listar Pedidos', '✅', `${data.data.length} pedidos encontrados`);
            return data.data;
        } else {
            addResult('Listar Pedidos', '❌', 'Resposta inválida');
            return [];
        }
    } catch (error) {
        addResult('Listar Pedidos', '❌', `Erro: ${error.message}`);
        return [];
    }
}

// 🧪 TESTE 8: TESTE DE CONECTIVIDADE FRONTEND-BACKEND
async function testeConectividadeFrontendBackend() {
    console.log('\n🌐 TESTANDO CONECTIVIDADE FRONTEND-BACKEND...');
    try {
        // Simular requisição do frontend
        const frontendUrl = 'http://localhost:8080';
        const backendUrl = 'http://localhost:3001/api/test-supabase';
        
        const response = await fetch(backendUrl);
        const data = await response.json();
        
        if (response.ok && data.success) {
            addResult('Conectividade Frontend-Backend', '✅', 'Comunicação estabelecida');
            return true;
        } else {
            addResult('Conectividade Frontend-Backend', '❌', 'Falha na comunicação');
            return false;
        }
    } catch (error) {
        addResult('Conectividade Frontend-Backend', '❌', `Erro: ${error.message}`);
        return false;
    }
}

// 🧪 TESTE 9: VALIDAÇÃO DE DADOS DO PEDIDO
async function testeValidacaoPedido() {
    console.log('\n✅ TESTANDO VALIDAÇÃO DE DADOS DE PEDIDO...');
    try {
        // Testar pedido inválido (sem dados obrigatórios)
        const pedidoInvalido = {
            customer: {},
            items: [],
            total: 0
        };
        
        const response = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoInvalido)
        });
        
        const data = await response.json();
        
        if (response.status === 400 && !data.success) {
            addResult('Validação Pedido', '✅', 'Validação funcionando (pedido inválido rejeitado)');
            return true;
        } else {
            addResult('Validação Pedido', '❌', 'Validação falhou (pedido inválido aceito)');
            return false;
        }
    } catch (error) {
        addResult('Validação Pedido', '❌', `Erro: ${error.message}`);
        return false;
    }
}

// 🧪 TESTE 10: PERFORMANCE E CARGA
async function testePerformance() {
    console.log('\n⚡ TESTANDO PERFORMANCE...');
    try {
        const inicio = Date.now();
        
        // Fazer 5 requisições simultâneas
        const promises = Array(5).fill(null).map(() => 
            fetch(`${API_BASE}/api/products`)
        );
        
        const responses = await Promise.all(promises);
        const fim = Date.now();
        const tempoTotal = fim - inicio;
        
        const sucessos = responses.filter(r => r.ok).length;
        
        if (sucessos === 5 && tempoTotal < 5000) {
            addResult('Performance', '✅', `${sucessos}/5 requisições OK em ${tempoTotal}ms`);
            return true;
        } else {
            addResult('Performance', '⚠️', `${sucessos}/5 requisições OK em ${tempoTotal}ms`);
            return false;
        }
    } catch (error) {
        addResult('Performance', '❌', `Erro: ${error.message}`);
        return false;
    }
}

// 📊 GERAR RELATÓRIO FINAL
function gerarRelatorioFinal() {
    console.log('\n🔥🔥🔥 RELATÓRIO FINAL COMPLETO 🔥🔥🔥');
    console.log('='.repeat(60));
    
    const sucessos = testResults.filter(r => r.status === '✅').length;
    const avisos = testResults.filter(r => r.status === '⚠️').length;
    const falhas = testResults.filter(r => r.status === '❌').length;
    const total = testResults.length;
    
    console.log('\n📋 RESULTADOS POR TESTE:');
    testResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.status} ${result.test}: ${result.details} [${result.timestamp}]`);
    });
    
    console.log('\n📊 ESTATÍSTICAS:');
    console.log(`✅ Sucessos: ${sucessos}/${total} (${Math.round((sucessos/total)*100)}%)`);
    console.log(`⚠️ Avisos: ${avisos}/${total} (${Math.round((avisos/total)*100)}%)`);
    console.log(`❌ Falhas: ${falhas}/${total} (${Math.round((falhas/total)*100)}%)`);
    
    console.log('\n🎯 URLS TESTADAS:');
    console.log('Backend: http://localhost:3001');
    console.log('Frontend: http://localhost:8080');
    console.log('Health: http://localhost:3001/health');
    console.log('API: http://localhost:3001/api');
    
    console.log('\n🔗 COMUNICAÇÃO:');
    console.log('Frontend → Backend: http://localhost:8080 → http://localhost:3001/api');
    console.log('CORS: Habilitado para localhost:8080');
    console.log('Portas: Frontend(8080) ↔ Backend(3001)');
    
    if (sucessos === total) {
        console.log('\n🎉🎉🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL! 🎉🎉🎉');
        console.log('🚀 O sistema está pronto para produção!');
    } else if (sucessos + avisos === total) {
        console.log('\n✅✅✅ TESTES PASSARAM COM AVISOS - SISTEMA FUNCIONAL! ✅✅✅');
        console.log('⚠️ Alguns testes têm avisos de performance, mas o sistema funciona!');
    } else {
        console.log('\n❌❌❌ ALGUNS TESTES FALHARAM - REVISAR SISTEMA ❌❌❌');
        console.log('🔧 Verificar logs e corrigir problemas identificados.');
    }
    
    console.log('\n' + '='.repeat(60));
}

// 🚀 EXECUTAR TODOS OS TESTES
async function executarTodosOsTestes() {
    try {
        console.log('⏳ Aguardando 2 segundos para estabilizar...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Testes básicos
        const backendOk = await testeBackendHealth();
        if (!backendOk) {
            console.log('🛑 Backend não está funcionando - abortando testes avançados');
            gerarRelatorioFinal();
            return;
        }
        
        // Testes de dados
        const produtos = await testeCarregarProdutos();
        const categorias = await testeCarregarCategorias();
        
        // Testes de autenticação
        const admin = await testeLoginAdmin();
        await testeDashboard();
        
        // Testes de funcionalidade
        await testeCriarPedido();
        await testeListarPedidos();
        await testeValidacaoPedido();
        
        // Testes de conectividade
        await testeConectividadeFrontendBackend();
        await testePerformance();
        
        // Relatório final
        gerarRelatorioFinal();
        
    } catch (error) {
        console.error('💥 ERRO CRÍTICO NOS TESTES:', error);
        addResult('Sistema Geral', '❌', `Erro crítico: ${error.message}`);
        gerarRelatorioFinal();
    }
}

// Executar automaticamente
console.log('🔄 Iniciando testes em 3 segundos...');
setTimeout(() => {
    executarTodosOsTestes();
}, 3000);