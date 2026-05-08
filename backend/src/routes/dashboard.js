import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todaySales, totalProducts, lowStockProducts, recentSales] = await Promise.all([
      prisma.sale.aggregate({ where: { createdAt: { gte: today, lt: tomorrow } }, _sum: { total: true }, _count: true }),
      prisma.product.count({ where: { active: true } }),
      prisma.$queryRaw`SELECT COUNT(*) as count FROM Product WHERE stock <= minStock AND active = 1`,
      prisma.sale.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } }, items: true } })
    ]);

    res.json({
      todayRevenue: todaySales._sum.total || 0,
      todaySalesCount: todaySales._count,
      totalProducts,
      lowStockCount: Number(lowStockProducts[0]?.count || 0),
      recentSales
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/sales-chart', async (req, res) => {
  try {
    const days = parseInt(req.query.days || 7);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      const result = await prisma.sale.aggregate({
        where: { createdAt: { gte: date, lt: next } },
        _sum: { total: true }, _count: true
      });
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: result._sum.total || 0,
        count: result._count
      });
    }
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/top-products', async (req, res) => {
  try {
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    });
    const withNames = await Promise.all(topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } });
      return { ...item, productName: product?.name || 'N/A' };
    }));
    res.json(withNames);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
