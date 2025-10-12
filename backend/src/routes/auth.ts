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

    // Buscar admin pelo email
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('active', true)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciais inválidas' }
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

    // Atualizar último login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register - Registrar novo admin (apenas para desenvolvimento)
router.post('/register', async (req: any, res: any, next: any) => {
  try {
    const { name, email, password, role = 'MANAGER' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Nome, email e senha são obrigatórios' }
      });
    }

    // Verificar se já existe admin com este email
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: { message: 'Já existe um admin com este email' }
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar admin
    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: role,
        active: true
      })
      .select('id, name, email, role')
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: admin,
      message: 'Admin criado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify - Verificar token
router.post('/verify', async (req: any, res: any, next: any) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Token é obrigatório' }
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Buscar admin no banco
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, name, email, role, active')
      .eq('id', decoded.id)
      .single();

    if (error || !admin || !admin.active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token inválido' }
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error: any) {
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