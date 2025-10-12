import { Router } from 'express';
import { supabase, Category } from '../lib/supabase';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/categories - Listar todas as categorias
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        products(count)
      `)
      .order('name');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:id - Buscar categoria por ID
router.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabase
      .from('categories')
      .select(`
        *,
        products!inner(*)
      `)
      .eq('id', id)
      .eq('products.available', true)
      .order('products.featured', { ascending: false })
      .order('products.name')
      .single();

    if (error || !category) {
      return res.status(404).json({
        success: false,
        error: { message: 'Categoria não encontrada' }
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories - Criar nova categoria (Admin)
router.post('/', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: any, res: any, next: any) => {
  try {
    const { name, slug, image } = req.body;

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        image
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/categories/:id - Atualizar categoria (Admin)
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { name, slug, image } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (image) updateData.image = image;

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories/:id - Deletar categoria (Admin)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    // Verificar se há produtos na categoria
    const { count: productsCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      throw countError;
    }

    if (productsCount && productsCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Não é possível deletar categoria com produtos associados' }
      });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

export default router;