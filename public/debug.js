console.log('🚀 Debug: Frontend carregado');

// Teste de conexão com backend
fetch('http://localhost:3001/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend conectado:', data);
  })
  .catch(error => {
    console.error('❌ Erro ao conectar backend:', error);
  });

// Teste de carregamento de produtos
fetch('http://localhost:3001/api/products')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Produtos carregados:', data);
    if (data.success && data.data) {
      console.log('📦 Total de produtos:', data.data.length);
      data.data.forEach(product => {
        console.log(`- ${product.name}: R$ ${product.price}`);
      });
    }
  })
  .catch(error => {
    console.error('❌ Erro ao carregar produtos:', error);
  });

// Verificar se variáveis globais estão disponíveis
setTimeout(() => {
  console.log('🔍 Verificando elementos da página...');
  console.log('- window.location:', window.location.href);
  console.log('- document.title:', document.title);
  
  // Simular clique em adicionar ao carrinho se existir
  const addButton = document.querySelector('[data-testid="add-to-cart"]');
  if (addButton) {
    console.log('🛒 Botão adicionar ao carrinho encontrado');
  } else {
    console.log('❓ Botão adicionar ao carrinho não encontrado');
  }
}, 2000);