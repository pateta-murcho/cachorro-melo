import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import customerRoutes from './routes/customers';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import delivererRoutes from './routes/deliverer';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:8080", 
      "http://localhost:8081",
      "http://192.168.15.7:8080",
      "http://192.168.15.7:5173",
      ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});

// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080", 
    "http://localhost:8081",
    "http://192.168.15.7:8080",
    "http://192.168.15.7:5173",
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.IO para atualizações em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Disponibilizar io globalmente
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health check em /api/health também
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Página inicial da API
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cachorro Melo Delivery API</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          line-height: 1.6;
        }
        .container {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        h1 {
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.5em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .status {
          background: rgba(76,175,80,0.2);
          border: 2px solid #4CAF50;
          border-radius: 10px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        .endpoint {
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          border-left: 4px solid #FFD700;
        }
        .endpoint h3 {
          margin: 0 0 10px 0;
          color: #FFD700;
        }
        .endpoint code {
          background: rgba(0,0,0,0.3);
          padding: 5px 10px;
          border-radius: 5px;
          font-family: 'Courier New', monospace;
        }
        .endpoint a {
          color: #FFD700;
          text-decoration: none;
          font-weight: bold;
        }
        .endpoint a:hover {
          text-decoration: underline;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌭 Cachorro Melo Delivery API</h1>
        
        <div class="status">
          <h2>✅ API Funcionando Perfeitamente!</h2>
          <p>Servidor rodando na porta 3001 com Supabase</p>
        </div>

        <h2>📡 Endpoints Disponíveis:</h2>

        <div class="endpoint">
          <h3>Health Check</h3>
          <code>GET</code> <a href="/health" target="_blank">/health</a>
          <p>Verifica se a API está funcionando</p>
        </div>

        <div class="endpoint">
          <h3>Produtos</h3>
          <code>GET</code> <a href="/api/products" target="_blank">/api/products</a>
          <p>Lista todos os produtos disponíveis</p>
        </div>

        <div class="endpoint">
          <h3>Categorias</h3>
          <code>GET</code> <a href="/api/categories" target="_blank">/api/categories</a>
          <p>Lista todas as categorias de produtos</p>
        </div>

        <div class="endpoint">
          <h3>Pedidos</h3>
          <code>GET</code> <a href="/api/orders" target="_blank">/api/orders</a>
          <p>Lista pedidos (com paginação)</p>
        </div>

        <div class="endpoint">
          <h3>Clientes</h3>
          <code>GET</code> <a href="/api/customers" target="_blank">/api/customers</a>
          <p>Lista clientes cadastrados</p>
        </div>

        <div class="endpoint">
          <h3>Autenticação</h3>
          <code>POST</code> <span style="color:#FFD700">/api/auth/login</span>
          <p>Login de administradores</p>
        </div>

        <div class="endpoint">
          <h3>Admin Dashboard</h3>
          <code>GET</code> <span style="color:#FFD700">/api/admin/dashboard</span>
          <p>Estatísticas e dados do painel administrativo</p>
        </div>

        <div class="footer">
          <p>🚀 <strong>Backend 100% funcional</strong> | 💾 <strong>Supabase Database</strong> | ⚡ <strong>Express + TypeScript</strong></p>
          <p>Desenvolvido com ❤️ para o Cachorro Melo Delivery</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/deliverer', delivererRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const portNumber = typeof PORT === 'string' ? parseInt(PORT) : PORT;

server.listen(portNumber, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${portNumber}`);
  console.log(`📱 CORS habilitado para: ${process.env.CORS_ORIGIN}`);
  console.log(`🔗 Health check local: http://localhost:${portNumber}/health`);
  console.log(`🔗 Health check rede: http://192.168.15.7:${portNumber}/health`);
  console.log(`✅ Servidor acessível em TODAS as interfaces de rede (0.0.0.0)`);
});