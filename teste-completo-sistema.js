// 🔥🔥🔥 TESTE COMPLETO E DETALHADO - TODAS AS FUNCIONALIDADES 🔥🔥🔥
console.log('🚀🚀🚀 INICIANDO TESTE COMPLETO DO SISTEMA 🚀🚀🚀');

const API_BASE = 'http://localhost:3001';
let adminToken = null;
let testCustomerId = null;
let testOrderId = null;

// 📝 RELATÓRIO DE TESTES
const relatorio = {
    backend: { status: '❌', detalhes: '' },
    database: { status: '❌', detalhes: '' },
    produtos: { status: '❌', detalhes: '' },
    categorias: { status: '❌', detalhes: '' },
    adminLogin: { status: '❌', detalhes: '' },
    criarPedido: { status: '❌', detalhes: '' },
    dashboard: { status: '❌', detalhes: '' },
    errors: []
};

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const symbols = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        test: '🧪'
    };
    console.log(`${symbols[type]} [${timestamp}] ${message}`);
}

function addError(funcionalidade, erro) {
    relatorio.errors.push({ funcionalidade, erro, timestamp: new Date().toLocaleTimeString() });
}

// 🧪 TESTE 1: BACKEND HEALTH
async function testeBackendHealth() {
    log('Testando conectividade do backend...', 'test');
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        log(`Backend OK - Status: ${data.status}, Uptime: ${data.uptime}s`, 'success');
        relatorio.backend = { status: '✅', detalhes: `Uptime: ${data.uptime}s` };
        return true;
    } catch (error) {
        const msg = `Backend falhou: ${error.message}`;
        log(msg, 'error');
        relatorio.backend = { status: '❌', detalhes: msg };
        addError('Backend Health', error.message);
        return false;
    }
}

// 🧪 TESTE 2: SUPABASE DATABASE
async function testeDatabase() {
    log('Testando conexão com Supabase...', 'test');
    try {
        const response = await fetch(`${API_BASE}/api/test-supabase`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success) {
            log('Supabase conectado com sucesso!', 'success');
            relatorio.database = { status: '✅', detalhes: 'Conexão OK' };
            return true;
        } else {
            throw new Error(data.error?.message || 'Erro desconhecido');
        }
    } catch (error) {
        const msg = `Database falhou: ${error.message}`;
        log(msg, 'error');
        relatorio.database = { status: '❌', detalhes: msg };
        addError('Database', error.message);
        return false;
    }
}

// 🧪 TESTE 3: CARREGAR PRODUTOS
async function testeProdutos() {
    log('Testando carregamento de produtos...', 'test');
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success && data.data) {
            const produtos = data.data;
            log(`${produtos.length} produtos carregados com sucesso!`, 'success');
            
            // Verificar estrutura dos produtos
            const primeiroProduto = produtos[0];
            const camposObrigatorios = ['id', 'name', 'price', 'description'];
            const camposFaltando = camposObrigatorios.filter(campo => !primeiroProduto[campo]);
            
            if (camposFaltando.length > 0) {
                throw new Error(`Campos faltando nos produtos: ${camposFaltando.join(', ')}`);
            }
            
            relatorio.produtos = { status: '✅', detalhes: `${produtos.length} produtos` };
            return produtos;
        } else {
            throw new Error(data.error?.message || 'Erro desconhecido');
        }
    } catch (error) {
        const msg = `Produtos falhou: ${error.message}`;
        log(msg, 'error');
        relatorio.produtos = { status: '❌', detalhes: msg };
        addError('Produtos', error.message);
        return [];
    }
}

// 🧪 TESTE 4: CARREGAR CATEGORIAS
async function testeCategorias() {
    log('Testando carregamento de categorias...', 'test');
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success && data.data) {
            const categorias = data.data;
            log(`${categorias.length} categorias carregadas!`, 'success');
            relatorio.categorias = { status: '✅', detalhes: `${categorias.length} categorias` };
            return categorias;
        } else {
            throw new Error(data.error?.message || 'Erro desconhecido');
        }
    } catch (error) {
        const msg = `Categorias falhou: ${error.message}`;
        log(msg, 'error');
        relatorio.categorias = { status: '❌', detalhes: msg };
        addError('Categorias', error.message);
        return [];
    }
}

// 🧪 TESTE 5: LOGIN ADMIN
async function testeAdminLogin() {
    log('Testando login de administrador...', 'test');
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
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success && data.admin) {
            adminToken = data.token;
            log(`Login admin OK! Usuário: ${data.admin.name}`, 'success');
            relatorio.adminLogin = { status: '✅', detalhes: `Admin: ${data.admin.name}` };
            return data.admin;
        } else {
            throw new Error(data.error?.message || 'Credenciais inválidas');
        }
    } catch (error) {
        const msg = `Admin login falhou: ${error.message}`;
        log(msg, 'error');
        relatorio.adminLogin = { status: '❌', detalhes: msg };
        addError('Admin Login', error.message);
        return null;
    }
}

// 🧪 TESTE 6: CRIAR PEDIDO COMPLETO
async function testeCriarPedido(produtos) {
    log('Testando criação de pedido completo...', 'test');
    
    if (!produtos || produtos.length === 0) {
        const msg = 'Não é possível criar pedido sem produtos';
        log(msg, 'error');
        relatorio.criarPedido = { status: '❌', detalhes: msg };
        return null;
    }
    
    try {
        // Selecionar primeiro produto disponível
        const produtoTeste = produtos.find(p => p.available) || produtos[0];
        
        const pedidoTeste = {
            customer: {
                name: 'João da Silva Teste',
                phone: '11987654321',
                email: 'teste@cachorromelo.com'
            },
            items: [
                {
                    productId: produtoTeste.id,
                    name: produtoTeste.name,
                    quantity: 2,
                    price: produtoTeste.price
                }
            ],
            total: produtoTeste.price * 2,
            deliveryAddress: 'Rua das Flores, 123 - São Paulo, SP',
            paymentMethod: 'money',
            notes: 'Teste automatizado do sistema'
        };
        
        log(`Criando pedido teste: ${pedidoTeste.items[0].name} x${pedidoTeste.items[0].quantity}`, 'info');
        
        const response = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoTeste)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
            testOrderId = data.data.id;
            log(`Pedido criado com sucesso! Número: ${data.data.orderNumber}`, 'success');
            relatorio.criarPedido = { status: '✅', detalhes: `Pedido #${data.data.orderNumber}` };
            return data.data;
        } else {
            throw new Error(data.error?.message || 'Erro ao criar pedido');
        }
    } catch (error) {
        const msg = `Criar pedido falhou: ${error.message}`;
        log(msg, 'error');
        relatorio.criarPedido = { status: '❌', detalhes: msg };
        addError('Criar Pedido', error.message);
        return null;
    }
}

// 🧪 TESTE 7: DASHBOARD ADMIN
async function testeDashboard() {
    log('Testando dashboard do admin...', 'test');
    try {
        const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
            headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success && data.data) {
            const stats = data.data;
            log(`Dashboard OK - Produtos: ${stats.totalProducts}, Pedidos: ${stats.totalOrders}`, 'success');
            relatorio.dashboard = { status: '✅', detalhes: `${stats.totalProducts} produtos, ${stats.totalOrders} pedidos` };
            return stats;
        } else {
            throw new Error(data.error?.message || 'Erro no dashboard');
        }
    } catch (error) {
        const msg = `Dashboard falhou: ${error.message}`;
        log(msg, 'error');
        relatorio.dashboard = { status: '❌', detalhes: msg };
        addError('Dashboard', error.message);
        return null;
    }
}

// 🧪 TESTE 8: BUSCAR PEDIDOS
async function testeBuscarPedidos() {
    log('Testando busca de pedidos...', 'test');
    try {
        const response = await fetch(`${API_BASE}/api/orders`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success) {
            const pedidos = data.data || [];
            log(`${pedidos.length} pedidos encontrados`, 'success');
            return pedidos;
        } else {
            throw new Error(data.error?.message || 'Erro ao buscar pedidos');
        }
    } catch (error) {
        log(`Buscar pedidos falhou: ${error.message}`, 'error');
        addError('Buscar Pedidos', error.message);
        return [];
    }
}

// 📊 RELATÓRIO FINAL
function gerarRelatorioFinal() {
    console.log('\n🔥🔥🔥 RELATÓRIO FINAL DOS TESTES 🔥🔥🔥');
    console.log('===============================================');
    
    console.log('\n📋 RESULTADOS POR FUNCIONALIDADE:');
    Object.entries(relatorio).forEach(([funcionalidade, resultado]) => {
        if (funcionalidade !== 'errors') {
            console.log(`${resultado.status} ${funcionalidade.toUpperCase()}: ${resultado.detalhes}`);
        }
    });
    
    const totalTestes = Object.keys(relatorio).length - 1; // -1 para excluir 'errors'
    const testesPassaram = Object.values(relatorio).filter(r => r.status === '✅').length;
    const tesvesFalharam = totalTestes - testesPassaram;
    
    console.log('\n📊 ESTATÍSTICAS:');
    console.log(`✅ Testes que passaram: ${testesPassaram}/${totalTestes}`);
    console.log(`❌ Testes que falharam: ${tesvesFalharam}/${totalTestes}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((testesPassaram/totalTestes)*100)}%`);
    
    if (relatorio.errors.length > 0) {
        console.log('\n🚨 ERROS ENCONTRADOS:');
        relatorio.errors.forEach((erro, index) => {
            console.log(`${index + 1}. [${erro.timestamp}] ${erro.funcionalidade}: ${erro.erro}`);
        });
    }
    
    if (testesPassaram === totalTestes) {
        console.log('\n🎉🎉🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL! 🎉🎉🎉');
    } else {
        console.log('\n⚠️⚠️⚠️ ALGUNS TESTES FALHARAM - NECESSÁRIO CORREÇÃO ⚠️⚠️⚠️');
    }
    
    console.log('===============================================');
}

// 🚀 EXECUTAR TODOS OS TESTES
async function executarTodosOsTestes() {
    log('Iniciando bateria completa de testes...', 'info');
    
    // Testes básicos
    const backendOk = await testeBackendHealth();
    if (!backendOk) {
        log('❌ Backend não está funcionando - abortando testes', 'error');
        gerarRelatorioFinal();
        return;
    }
    
    await testeDatabase();
    const produtos = await testeProdutos();
    await testeCategorias();
    await testeAdminLogin();
    
    // Testes avançados
    await testeCriarPedido(produtos);
    await testeDashboard();
    await testeBuscarPedidos();
    
    // Relatório final
    gerarRelatorioFinal();
}

// Executar testes
executarTodosOsTestes().catch(error => {
    console.error('💥 ERRO CRÍTICO NOS TESTES:', error);
});