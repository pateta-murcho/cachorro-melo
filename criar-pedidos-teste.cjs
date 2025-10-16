const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lwwtfodpnqyceuqomopj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d3Rmb2RwbnF5Y2V1cW9tb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDQ4MDcsImV4cCI6MjA2MDAyMDgwN30.8AHp7cK_6cYFdNFD9VqD6jxY1TxwmYnZMSLwEFpXGxE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function criarPedidosTeste() {
  console.log('🔥 Criando pedidos de teste com status READY...\n');

  try {
    // 1. Buscar um cliente de teste
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    if (!customers || customers.length === 0) {
      console.log('❌ Nenhum cliente encontrado. Criando cliente de teste...');
      
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          name: 'Cliente Teste',
          phone: '11999888777',
          email: 'teste@cliente.com'
        })
        .select()
        .single();
      
      customers[0] = newCustomer;
    }

    const customer = customers[0];
    console.log(`✅ Cliente: ${customer.name} (${customer.id})`);

    // 2. Buscar produtos
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (!products || products.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      return;
    }

    console.log(`✅ ${products.length} produtos disponíveis\n`);

    // 3. Criar 3 pedidos com status READY
    const statuses = ['READY', 'READY', 'PREPARING'];
    const addresses = [
      'Rua das Flores, 123 - Centro',
      'Av. Paulista, 456 - Bela Vista',
      'Rua dos Jardins, 789 - Jardim América'
    ];

    for (let i = 0; i < 3; i++) {
      const selectedProducts = products.slice(0, Math.floor(Math.random() * 3) + 1);
      const total = selectedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          delivery_address: addresses[i],
          payment_method: i % 2 === 0 ? 'PIX' : 'DINHEIRO',
          total: total.toFixed(2),
          status: statuses[i],
          observations: `Pedido de teste ${i + 1}`,
          delivery_code: String(Math.floor(100 + Math.random() * 900))
        })
        .select()
        .single();

      if (orderError) {
        console.log(`❌ Erro ao criar pedido ${i + 1}:`, orderError.message);
        continue;
      }

      // Criar itens do pedido
      const items = selectedProducts.map(product => ({
        order_id: order.id,
        product_id: product.id,
        quantity: Math.floor(Math.random() * 2) + 1,
        price: product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items);

      if (itemsError) {
        console.log(`❌ Erro ao criar itens do pedido ${i + 1}:`, itemsError.message);
      } else {
        console.log(`✅ Pedido ${i + 1} criado: ${order.id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Total: R$ ${order.total}`);
        console.log(`   Endereço: ${order.delivery_address}`);
        console.log(`   Itens: ${items.length} produtos\n`);
      }
    }

    console.log('\n🎉 Pedidos de teste criados com sucesso!');
    console.log('🔄 Acesse http://192.168.15.7:8081/motoboy para ver os pedidos');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

criarPedidosTeste();
