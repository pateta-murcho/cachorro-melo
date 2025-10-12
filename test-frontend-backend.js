// Teste simples da API
async function testAPI() {
  console.log('🧪 Testando conexão com backend...');
  
  try {
    // Teste 1: Health check
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Teste 2: Listar produtos
    const productsResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await productsResponse.json();
    console.log('✅ Produtos:', productsData.data?.length || 0, 'encontrados');
    
    // Teste 3: Criar um pedido de teste
    const testOrder = {
      customer_name: 'Teste Frontend',
      customer_phone: '11999888777',
      customer_email: 'teste@frontend.com',
      delivery_address: 'Rua do Teste, 123',
      payment_method: 'CASH',
      notes: 'Teste de integração frontend-backend',
      items: [
        {
          product_id: '550e8400-e29b-41d4-a716-446655440011', // ID do primeiro produto
          quantity: 1
        }
      ]
    };
    
    console.log('📦 Criando pedido de teste...');
    const orderResponse = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder)
    });
    
    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      console.log('✅ Pedido criado com sucesso!');
      console.log('🆔 ID do pedido:', orderData.data.id);
      console.log('📊 Total:', orderData.data.total);
      console.log('📋 Status:', orderData.data.status);
      
      return orderData.data;
    } else {
      const errorText = await orderResponse.text();
      console.error('❌ Erro ao criar pedido:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

// Executar teste
testAPI();