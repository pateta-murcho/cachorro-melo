import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'cachorros-quentes' },
      update: {},
      create: {
        name: 'Cachorros-quentes',
        slug: 'cachorros-quentes',
        image: 'hotdog-categoria.jpg'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'combos' },
      update: {},
      create: {
        name: 'Combos',
        slug: 'combos',
        image: 'combo-categoria.jpg'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'bebidas' },
      update: {},
      create: {
        name: 'Bebidas',
        slug: 'bebidas',
        image: 'bebidas-categoria.jpg'
      }
    })
  ]);

  console.log('✅ Categorias criadas');

  // Criar produtos
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'Cachorro-quente Tradicional',
        description: 'Salsicha, batata palha, milho, ervilha, queijo e molhos especiais',
        price: 8.50,
        image: 'hotdog-tradicional.jpg',
        categoryId: categories[0].id,
        featured: true
      }
    }),
    prisma.product.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Cachorro-quente Especial',
        description: 'Salsicha especial, bacon, queijo cheddar, batata palha, milho, ervilha e molhos especiais',
        price: 12.90,
        image: 'hotdog-especial.jpg',
        categoryId: categories[0].id,
        featured: true
      }
    }),
    prisma.product.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        name: 'X-Dog Burger',
        description: 'Hambúrguer artesanal, salsicha, queijo, alface, tomate, batata palha e molhos especiais',
        price: 15.90,
        image: 'xdog-burger.jpg',
        categoryId: categories[0].id,
        featured: true
      }
    }),
    prisma.product.upsert({
      where: { id: '4' },
      update: {},
      create: {
        id: '4',
        name: 'Dog Vegetariano',
        description: 'Salsicha vegetariana, queijo, alface, tomate, milho, ervilha e molhos especiais',
        price: 11.50,
        image: 'dog-vegetariano.jpg',
        categoryId: categories[0].id
      }
    }),
    prisma.product.upsert({
      where: { id: '5' },
      update: {},
      create: {
        id: '5',
        name: 'Combo Dog + Batata',
        description: 'Cachorro-quente tradicional + porção de batata frita + refrigerante 350ml',
        price: 18.90,
        image: 'combo-dog-batata.jpg',
        categoryId: categories[1].id,
        featured: true
      }
    }),
    prisma.product.upsert({
      where: { id: '6' },
      update: {},
      create: {
        id: '6',
        name: 'Refrigerantes 350ml',
        description: 'Coca-Cola, Guaraná Antarctica, Fanta ou Sprite',
        price: 4.50,
        image: 'refrigerantes.jpg',
        categoryId: categories[2].id
      }
    })
  ]);

  console.log('✅ Produtos criados');

  // Criar admin padrão
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.admin.upsert({
    where: { email: 'admin@cachorromelo.com' },
    update: {},
    create: {
      email: 'admin@cachorromelo.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin criado');

  // Criar cliente de exemplo
  await prisma.customer.upsert({
    where: { phone: '11999999999' },
    update: {},
    create: {
      name: 'João Silva',
      phone: '11999999999',
      email: 'joao@email.com',
      address: 'Rua das Flores, 123 - Centro'
    }
  });

  console.log('✅ Cliente de exemplo criado');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });