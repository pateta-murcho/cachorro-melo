import { Router } from 'express';
import { supabase, Product } from '../lib/supabase';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/products - Listar todos os produtos
router.get('/', async (req, res, next) => {
  try {
    const { categoryId, featured, available } = req.query;
    
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug)
      `);
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (featured !== undefined) {
      query = query.eq('featured', featured === 'true');
    }
    
    if (available !== undefined) {
      query = query.eq('available', available === 'true');
    } else {
      // Por padrão, só mostrar produtos disponíveis para o público
      query = query.eq('available', true);
    }

    query = query.order('featured', { ascending: false }).order('name');

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produto não encontrado' }
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Criar novo produto (Admin)
router.post('/', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const { name, description, price, image, category_id, available, featured } = req.body;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: parseFloat(price),
        image,
        category_id,
        available: available ?? true,
        featured: featured ?? false
      })
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Atualizar produto (Admin)
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category_id, available, featured } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (image) updateData.image = image;
    if (category_id) updateData.category_id = category_id;
    if (available !== undefined) updateData.available = available;
    if (featured !== undefined) updateData.featured = featured;

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Deletar produto (Admin)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

export default router;