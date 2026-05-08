import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { from, to, limit = 50 } = req.query;
    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    const sales = await prisma.sale.findMany({
      where,
      include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    res.json(sales);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { items, payment, discount = 0, tax = 0 } = req.body;
    const userId = req.user.id;

    // Validate stock
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para ${product?.name || 'producto'}` });
      }
    }

    const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const total = subtotal + tax - discount;

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          subtotal, total, tax, discount, payment, userId,
          items: { create: items.map(i => ({ quantity: i.quantity, price: i.price, total: i.price * i.quantity, productId: i.productId })) }
        },
        include: { items: { include: { product: true } }, user: { select: { name: true } } }
      });
      for (const item of items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }
      return newSale;
    });

    res.status(201).json(sale);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: { include: { product: true } }, user: { select: { name: true } } }
    });
    if (!sale) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(sale);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
