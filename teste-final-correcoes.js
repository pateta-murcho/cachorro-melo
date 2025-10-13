console.log('🔥 TESTE FINAL - VALIDAÇÃO COMPLETA 🔥\n');

const BASE_URL = 'http://localhost:3001';

// 🧪 TESTE 1: LOGIN ADMIN
async function testLogin() {
  try {
    console.log('🔐 Testando Login Admin...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cachorromelo.com',
        password: 'admin123'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Login Admin: SUCESSO');
      return true;
    } else {
      console.log('❌ Login Admin: FALHOU -', result.error?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login Admin: ERRO -', error.message);
    return false;
  }
}

// 🧪 TESTE 2: CRIAR PEDIDO
async function testOrder() {
  try {
    console.log('🛒 Testando Criação de Pedido...');
    
    const orderData = {
      customer_name: 'João Teste Final',
      customer_phone: '11999999999',
      customer_email: 'joao@teste.final.com',
      delivery_address: 'Rua Final, 123',
      payment_method: 'PIX', // ✅ MAIÚSCULO
      notes: 'Pedido de teste final',
      items: [
        {
          product_id: '1',
          quantity: 2,
          name: 'Hot Dog Teste',
          price: 8.5
        }
      ],
      total: 17
    };
    
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Criação de Pedido: SUCESSO');
      console.log(`   📋 ID: ${result.data.id}`);
      return true;
    } else {
      console.log('❌ Criação de Pedido: FALHOU -', result.error?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Criação de Pedido: ERRO -', error.message);
    return false;
  }
}

// 🧪 TESTE 3: PEDIDO COM PAYMENT CASH (money)
async function testOrderMoney() {
  try {
    console.log('💰 Testando Pedido com Payment Method: money...');
    
    const orderData = {
      customer_name: 'Maria Teste Cash',
      customer_phone: '11888777666',
      customer_email: 'maria@teste.cash.com',
      delivery_address: 'Rua Dinheiro, 456',
      payment_method: 'money', // Vai ser mapeado para CASH
      notes: 'Pedido pagamento dinheiro',
      items: [
        {
          product_id: '2',
          quantity: 1,
          name: 'Hot Dog Especial',
          price: 10.0
        }
      ],
      total: 10
    };
    
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Pedido Payment Money→CASH: SUCESSO');
      console.log(`   📋 ID: ${result.data.id}`);
      return true;
    } else {
      console.log('❌ Pedido Payment Money→CASH: FALHOU -', result.error?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Pedido Payment Money→CASH: ERRO -', error.message);
    return false;
  }
}

// 🏁 EXECUÇÃO DOS TESTES
async function runTests() {
  console.log('⏳ Aguardando servidor inicializar...\n');
  
  // Aguarda 2 segundos para o servidor estar pronto
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  let passCount = 0;
  const totalTests = 3;
  
  const result1 = await testLogin();
  if (result1) passCount++;
  
  console.log('');
  
  const result2 = await testOrder();
  if (result2) passCount++;
  
  console.log('');
  
  const result3 = await testOrderMoney();
  if (result3) passCount++;
  
  console.log('\n' + '='.repeat(50));
  console.log('🏆 RESULTADO FINAL:');
  console.log(`✅ Sucessos: ${passCount}/${totalTests}`);
  console.log(`❌ Falhas: ${totalTests - passCount}/${totalTests}`);
  
  if (passCount === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL! 🎉');
  } else {
    console.log('⚠️  Ainda há problemas para resolver...');
  }
  console.log('='.repeat(50));
}

runTests();