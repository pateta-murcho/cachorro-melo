import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/customers - Listar clientes (Admin)
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

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

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!customer) {
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

// POST /api/customers - Criar/buscar cliente por telefone
router.post('/', async (req: any, res: any, next: any) => {
  try {
    const { name, phone, email, address } = req.body;

    // Verificar se já existe cliente com este telefone
    let customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (customer) {
      // Atualizar dados se fornecidos
      customer = await prisma.customer.update({
        where: { phone },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(address && { address })
        }
      });
    } else {
      // Criar novo cliente
      customer = await prisma.customer.create({
        data: {
          name,
          phone,
          email,
          address
        }
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

// PUT /api/customers/:id - Atualizar cliente
router.put('/:id', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(address && { address })
      }
    });

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

export default router;