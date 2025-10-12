// Teste simples de conexão
import http from 'http';

console.log('🧪 Testando conexão com localhost:3001...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('✅ Status:', res.statusCode);
  console.log('📋 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📦 Resposta:', data);
  });
});

req.on('error', (error) => {
  console.error('❌ Erro:', error.message);
});

req.setTimeout(5000, () => {
  console.error('⏰ Timeout - servidor não responde');
  req.destroy();
});

req.end();