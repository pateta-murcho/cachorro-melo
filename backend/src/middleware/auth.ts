import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase, Admin } from '../lib/supabase';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token de acesso requerido' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verificar se o admin ainda existe e está ativo
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, name, role, active')
      .eq('id', decoded.id)
      .eq('active', true)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token inválido ou usuário inativo' }
      });
    }

    req.user = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Token inválido' }
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Autenticação requerida' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Permissão insuficiente' }
      });
    }

    next();
  };
};