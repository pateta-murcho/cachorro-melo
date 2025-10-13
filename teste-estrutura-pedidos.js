// Teste rápido da API de pedidos
console.log('🔥 TESTANDO NOVA ESTRUTURA DE PEDIDOS...\n');

async function testarEstrutura() {
  try {
    // Teste 1: Verificar estrutura do Supabase
    console.log('1️⃣ Testando conexão Supabase...');
    const testResponse = await fetch('http://localhost:3001/api/test-supabase');
    const testData = await testResponse.json();
    console.log('   ✅ Resultado:', testData.message);
    if (testData.ordersInfo) {
      console.log('   📋 Info Orders:', testData.ordersInfo);
    }
    
    console.log('\n2️⃣ Tentando criar pedido com nova estrutura...');
    
    // Teste 2: Criar pedido simples
    const pedidoTeste = {
      customer_name: 'João Teste Estrutura',
      customer_phone: '11999887766',
      customer_email: 'joao.estrutura@teste.com',
      delivery_address: 'Rua Teste Estrutura, 123',
      payment_method: 'pix',
      total: 29.90,
      notes: 'Teste da nova estrutura',
      items: [
        { product_id: 'produto-teste-1', quantity: 2 }
      ]
    };
    
    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoTeste)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ PEDIDO CRIADO COM SUCESSO!');
      console.log('   📦 ID:', data.data.id || data.data.orderNumber);
      console.log('   💰 Total:', data.data.total);
      console.log('   📍 Status:', data.data.status);
    } else {
      console.log('   ❌ FALHA:', data.error?.message || 'Erro desconhecido');
      console.log('   📋 Detalhes:', data.error?.details || 'Sem detalhes');
    }
    
    console.log('\n3️⃣ Verificando pedidos existentes...');
    const ordersResponse = await fetch('http://localhost:3001/api/orders');
    const ordersData = await ordersResponse.json();
    
    if (ordersResponse.ok && ordersData.success) {
      console.log(`   ✅ ENCONTRADOS ${ordersData.data.length} PEDIDOS`);
      if (ordersData.data.length > 0) {
        const ultimoPedido = ordersData.data[0];
        console.log('   📦 Último pedido:', ultimoPedido.id);
        console.log('   📋 Estrutura:', Object.keys(ultimoPedido).join(', '));
      }
    } else {
      console.log('   ❌ Erro ao buscar pedidos:', ordersData.error?.message);
    }
    
  } catch (error) {
    console.log('❌ ERRO CRÍTICO:', error.message);
  }
}

testarEstrutura();