const axios = require('axios');

async function testarConectividade() {
  console.log('🔥🔥🔥 TESTE DE CONECTIVIDADE TOTAL 🔥🔥🔥\n');
  
  const testes = [
    { nome: 'Backend Health', url: 'http://localhost:3001/health', metodo: 'GET' },
    { nome: 'Frontend Home', url: 'http://localhost:8080/', metodo: 'GET' },
    { nome: 'API Produtos', url: 'http://localhost:3001/api/products', metodo: 'GET' },
    { nome: 'API Categorias', url: 'http://localhost:3001/api/categories', metodo: 'GET' },
    { nome: 'API Pedidos', url: 'http://localhost:3001/api/orders', metodo: 'GET' },
    { nome: 'API Dashboard', url: 'http://localhost:3001/api/admin/dashboard', metodo: 'GET' },
    { nome: 'Teste Supabase', url: 'http://localhost:3001/api/test-supabase', metodo: 'GET' }
  ];
  
  let sucessos = 0;
  let falhas = 0;
  
  for (const teste of testes) {
    try {
      console.log(`🧪 Testando: ${teste.nome}...`);
      
      const config = {
        method: teste.metodo,
        url: teste.url,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios(config);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${teste.nome}: OK (${response.status})`);
        sucessos++;
        
        // Se for uma API, mostra dados adicionales
        if (response.data && typeof response.data === 'object') {
          if (response.data.success !== undefined) {
            console.log(`   📊 Success: ${response.data.success}`);
            if (response.data.data && Array.isArray(response.data.data)) {
              console.log(`   📋 Items: ${response.data.data.length}`);
            }
          }
        }
      } else {
        console.log(`⚠️ ${teste.nome}: Status ${response.status}`);
        falhas++;
      }
    } catch (error) {
      console.log(`❌ ${teste.nome}: ${error.message}`);
      falhas++;
      
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   💬 Resposta: ${error.response.statusText}`);
      }
    }
    
    console.log(''); // Linha em branco
  }
  
  console.log('🔥🔥🔥 RESULTADO FINAL 🔥🔥🔥');
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Falhas: ${falhas}`);
  console.log(`📊 Taxa de sucesso: ${Math.round((sucessos / testes.length) * 100)}%`);
  
  if (falhas === 0) {
    console.log('🚀 SISTEMA 100% FUNCIONAL!');
  } else if (sucessos > falhas) {
    console.log('⚠️ Sistema funcional com algumas falhas');
  } else {
    console.log('💥 Sistema com problemas críticos');
  }
}

testarConectividade().catch(console.error);