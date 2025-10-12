// Teste rápido do servidor
fetch('http://localhost:3001/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Health check funcionou:', data);
    
    // Testar produtos
    return fetch('http://localhost:3001/api/products');
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Produtos funcionou:', data);
    console.log('📦 Total produtos:', data.data?.length || 0);
    
    // Testar criação de pedido
    const testOrder = {
      customer_name: 'Cliente Teste Final',
      customer_phone: '11999888777',
      customer_email: 'teste@final.com',
      delivery_address: 'Rua Final, 999',
      payment_method: 'PIX',
      notes: 'Pedido de teste final',
      items: [
        {
          product_id: '550e8400-e29b-41d4-a716-446655440011',
          quantity: 1
        }
      ]
    };
    
    return fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder)
    });
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Pedido funcionou:', data);
    if (data.success) {
      console.log('🎉 PEDIDO CRIADO COM SUCESSO!');
      console.log('🆔 ID:', data.data.id);
      console.log('💰 Total:', data.data.total);
    }
  })
  .catch(error => {
    console.error('❌ Erro nos testes:', error);
  });