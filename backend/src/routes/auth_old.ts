import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, Admin } from '../lib/supabase';

const router = Router();

// POST /api/auth/login - Login de admin
router.post('/login', async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email e senha são obrigatórios' }
      });
    }

    // Buscar admin
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciais inválidas' }
      });
    }

    if (!admin.active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Conta desativada' }
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciais inválidas' }
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Retornar dados do admin sem a senha
    const { password: _, ...adminData } = admin;

    res.json({
      success: true,
      data: {
        admin: adminData,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register - Registrar novo admin (apenas para outros admins)
router.post('/register', async (req: any, res: any, next: any) => {
  try {
    const { email, password, name, role = 'ADMIN' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email, senha e nome são obrigatórios' }
      });
    }

    // Verificar se já existe admin com este email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: { message: 'Este email já está cadastrado' }
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar admin
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role
      }
    });

    // Retornar dados do admin sem a senha
    const { password: _, ...adminData } = admin;

    res.status(201).json({
      success: true,
      data: adminData
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify - Verificar token
router.post('/verify', async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token não fornecido' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        active: true 
      }
    });

    if (!admin || !admin.active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token inválido ou usuário inativo' }
      });
    }

    res.json({
      success: true,
      data: { admin }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token inválido ou expirado' }
      });
    }
    next(error);
  }
});

export default router;