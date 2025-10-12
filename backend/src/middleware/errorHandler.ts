import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erro interno do servidor';

  // Log do erro
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Erro de validação do Prisma
  if (error.code === 'P2002') {
    statusCode = 400;
    message = 'Dados duplicados. Este registro já existe.';
  }

  // Erro de registro não encontrado do Prisma
  if (error.code === 'P2025') {
    statusCode = 404;
    message = 'Registro não encontrado.';
  }

  // Erro de JSON inválido
  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'JSON inválido.';
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido.';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};