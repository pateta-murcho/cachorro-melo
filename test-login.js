// TESTE SIMPLES DE LOGIN ADMIN
const API_URL = 'http://localhost:3001/api';

async function testLogin() {
  console.log('🧪 Testando login admin...');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cachorromelo.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    console.log('📤 Resposta completa:', JSON.stringify(data, null, 2));
    
    if (!data.success) {
      console.error('❌ FALHA: Login retornou success=false');
      console.error('Erro:', data.error);
      process.exit(1);
    }
    
    if (!data.data) {
      console.error('❌ FALHA: Propriedade "data" não existe na resposta');
      console.error('Estrutura recebida:', Object.keys(data));
      process.exit(1);
    }
    
    if (!data.data.admin) {
      console.error('❌ FALHA: Propriedade "admin" não existe em data');
      console.error('Estrutura data:', Object.keys(data.data));
      process.exit(1);
    }
    
    if (!data.data.admin.name) {
      console.error('❌ FALHA: Propriedade "name" não existe em admin');
      console.error('Estrutura admin:', Object.keys(data.data.admin));
      process.exit(1);
    }
    
    console.log('✅ SUCESSO: Login funcionando corretamente!');
    console.log('👤 Admin Name:', data.data.admin.name);
    console.log('📧 Admin Email:', data.data.admin.email);
    console.log('🔑 Token:', data.data.token);
    
  } catch (error) {
    console.error('❌ ERRO NA REQUISIÇÃO:', error.message);
    process.exit(1);
  }
}

testLogin();
