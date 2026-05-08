import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    const where = { active: true };
    if (search) where.OR = [{ name: { contains: search } }, { barcode: { contains: search } }];
    if (category) where.categoryId = parseInt(category);
    if (lowStock === 'true') where.stock = { lte: prisma.product.fields.minStock };
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/low-stock', async (req, res) => {
  try {
    const products = await prisma.$queryRaw`SELECT * FROM Product WHERE stock <= minStock AND active = 1`;
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/barcode/:code', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: req.params.code },
      include: { category: true }
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true }
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, barcode, price, cost, stock, minStock, unit, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { name, barcode, price: parseFloat(price), cost: parseFloat(cost || 0), stock: parseInt(stock || 0), minStock: parseInt(minStock || 5), unit: unit || 'unidad', categoryId: categoryId ? parseInt(categoryId) : null },
      include: { category: true }
    });
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, barcode, price, cost, stock, minStock, unit, categoryId, active } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { name, barcode, price: parseFloat(price), cost: parseFloat(cost || 0), stock: parseInt(stock || 0), minStock: parseInt(minStock || 5), unit, categoryId: categoryId ? parseInt(categoryId) : null, active: active !== undefined ? active : true },
      include: { category: true }
    });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.update({ where: { id: parseInt(req.params.id) }, data: { active: false } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
