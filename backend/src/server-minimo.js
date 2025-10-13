const express = require('express');
const cors = require('cors');

console.log('🔥 SERVIDOR MÍNIMO INICIANDO...');

const app = express();
const PORT = 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Health check super simples
app.get('/health', (req, res) => {
  console.log('🩺 Health check');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Teste básico
app.get('/test', (req, res) => {
  console.log('🧪 Teste básico');
  res.json({ message: 'Servidor funcionando!' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR RODANDO EM http://localhost:${PORT}`);
  console.log(`💡 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
});

console.log('✅ Servidor configurado!');