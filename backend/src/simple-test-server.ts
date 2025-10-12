import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = 3001;

// CORS permissivo para desenvolvimento
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check acessado');
  res.json({ status: 'ok', message: 'Servidor funcionando!' });
});

// Página inicial
app.get('/', (req, res) => {
  console.log('🏠 Página inicial acessada');
  res.json({ 
    message: 'API Cachorro Melo funcionando!',
    endpoints: ['/health', '/api/test']
  });
});

// Endpoint de teste
app.get('/api/test', (req, res) => {
  console.log('🧪 Endpoint de teste acessado');
  res.json({ 
    success: true,
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString()
  });
});

// Erro 404
app.use('*', (req, res) => {
  console.log('❌ 404 - Rota não encontrada:', req.originalUrl);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log('🚀 Servidor SIMPLES rodando na porta', PORT);
  console.log('🔗 Health: http://localhost:3001/health');
  console.log('🧪 Teste: http://localhost:3001/api/test');
});

server.on('error', (error) => {
  console.error('❌ Erro no servidor:', error);
});

process.on('SIGTERM', () => {
  console.log('🛑 Encerrando servidor...');
  server.close();
});