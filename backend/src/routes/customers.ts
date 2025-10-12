import { Router } from 'express';
import { supabase, Customer } from '../lib/supabase';

const router = Router();

// GET /api/customers - Listar clientes (Admin)
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        *,
        orders(count)
      `)
      .order('name');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id - Buscar cliente por ID
router.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        orders(
          *,
          order_items(
            *,
            product:products(name, image)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !customer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Cliente não encontrado' }
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/phone/:phone - Buscar cliente por telefone
router.get('/phone/:phone', async (req: any, res: any, next: any) => {
  try {
    const { phone } = req.params;

    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        orders(
          id,
          status,
          total_amount,
          created_at
        )
      `)
      .eq('phone', phone)
      .order('orders.created_at', { ascending: false })
      .single();

    if (error || !customer) {
      return res.status(404).json({
        success: false,
        error: { message: 'Cliente não encontrado' }
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers - Criar novo cliente
router.post('/', async (req: any, res: any, next: any) => {
  try {
    const { name, phone, email, address } = req.body;

    // Verificar se já existe cliente com este telefone
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: { message: 'Já existe um cliente com este telefone' }
      });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name,
        phone,
        email,
        address
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/:id - Atualizar cliente
router.put('/:id', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (address) updateData.address = address;

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

export default router;