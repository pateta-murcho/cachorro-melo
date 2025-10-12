// Script para testar pedido no navegador
// Cole este código no console do navegador (F12 > Console)

async function testarPedidoFrontend() {
  console.log('🧪 Testando criação de pedido via frontend...');
  
  try {
    // Primeiro testar health
    console.log('1️⃣ Testando health check...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    
    // Testar produtos
    console.log('2️⃣ Testando produtos...');
    const productsResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await productsResponse.json();
    console.log('✅ Produtos:', productsData);
    
    if (!productsData.success || !productsData.data || productsData.data.length === 0) {
      console.warn('⚠️ Nenhum produto encontrado, usando ID padrão');
    }
    
    // Usar primeiro produto ou ID padrão
    const firstProductId = productsData.data?.[0]?.id || '550e8400-e29b-41d4-a716-446655440011';
    console.log('🎯 Usando produto ID:', firstProductId);
    
    // Dados do pedido de teste
    const pedidoTeste = {
      customer_name: 'Cliente Teste Browser Final',
      customer_phone: '11888777999',
      customer_email: 'teste.browser.final@supabase.com',
      delivery_address: 'Rua Browser Final, 789',
      payment_method: 'PIX',
      notes: 'Pedido final via console navegador',
      items: [
        {
          product_id: firstProductId,
          quantity: 1
        }
      ]
    };
    
    console.log('3️⃣ Enviando pedido:', pedidoTeste);
    
    // Fazer requisição para a API
    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidoTeste)
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    const data = await response.json();
    console.log('📦 Dados recebidos:', data);
    
    if (response.ok && data.success) {
      console.log('🎉 SUCESSO! Pedido criado:');
      console.log('🆔 ID:', data.data.id);
      console.log('💰 Total:', data.data.total);
      console.log('📋 Status:', data.data.status);
      console.log('📅 Criado em:', data.data.created_at);
      
      alert('🎉 PEDIDO CRIADO COM SUCESSO!\n\nID: ' + data.data.id + '\nTotal: R$ ' + data.data.total);
      
      // Verificar no Supabase
      console.log('✅ VERIFICAR NO SUPABASE: Tabela orders deve ter um novo registro!');
      
      return data.data;
    } else {
      console.error('❌ Erro na resposta:', data);
      alert('❌ Erro: ' + (data.message || 'Erro desconhecido'));
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    alert('❌ Erro de conexão: ' + error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('💡 DICA: Verifique se o backend está rodando na porta 3001');
      console.log('🔗 Teste: http://localhost:3001/health');
    }
  }
}

// Executar teste
console.log('🚀 Script de teste carregado!');
console.log('💡 Execute: testarPedidoFrontend()');

// Auto-executar após 3 segundos
setTimeout(() => {
  console.log('🎯 Executando teste automaticamente em 3 segundos...');
  testarPedidoFrontend();
}, 3000);