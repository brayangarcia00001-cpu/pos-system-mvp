import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: { email: 'admin@pos.com', password: adminPassword, name: 'Administrador', role: 'admin' }
  });

  const cashierPassword = await bcrypt.hash('cashier123', 10);
  await prisma.user.upsert({
    where: { email: 'cajero@pos.com' },
    update: {},
    create: { email: 'cajero@pos.com', password: cashierPassword, name: 'Cajero', role: 'cashier' }
  });

  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Bebidas' }, update: {}, create: { name: 'Bebidas' } }),
    prisma.category.upsert({ where: { name: 'Alimentos' }, update: {}, create: { name: 'Alimentos' } }),
    prisma.category.upsert({ where: { name: 'Limpieza' }, update: {}, create: { name: 'Limpieza' } }),
    prisma.category.upsert({ where: { name: 'Electrónica' }, update: {}, create: { name: 'Electrónica' } }),
  ]);

  const products = [
    { name: 'Coca-Cola 500ml', barcode: '7501055300105', price: 2500, cost: 1500, stock: 50, categoryId: categories[0].id },
    { name: 'Agua Cristal 600ml', barcode: '7501055301027', price: 1500, cost: 800, stock: 100, categoryId: categories[0].id },
    { name: 'Pan tajado', barcode: '7702001010015', price: 4500, cost: 3200, stock: 30, categoryId: categories[1].id },
    { name: 'Leche Entera 1L', barcode: '7702001010022', price: 3200, cost: 2500, stock: 40, categoryId: categories[1].id },
    { name: 'Jabón de manos', barcode: '7501007403000', price: 3800, cost: 2200, stock: 25, categoryId: categories[2].id },
    { name: 'Detergente 500g', barcode: '7501007403017', price: 5500, cost: 3800, stock: 20, categoryId: categories[2].id },
    { name: 'Pilas AA x4', barcode: '7509546007003', price: 6000, cost: 3500, stock: 15, categoryId: categories[3].id },
    { name: 'Cargador USB', barcode: '7509546007010', price: 15000, cost: 8000, stock: 8, minStock: 3, categoryId: categories[3].id },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { barcode: p.barcode }, update: {}, create: p });
  }

  console.log('✅ Seed completed!');
  console.log('👤 Admin: admin@pos.com / admin123');
  console.log('👤 Cajero: cajero@pos.com / cashier123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
