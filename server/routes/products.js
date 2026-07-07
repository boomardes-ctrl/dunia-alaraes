import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET } from './admin.js';

const router = Router();

function auth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'غير مصرح' });
  try {
    jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'غير مصرح' });
  }
}

function mapProduct(p) {
  return { ...p, images: JSON.parse(p.images || '[]') };
}

router.get('/', async (req, res) => {
  const { category, featured, bestSeller, hasOffer, search, brand } = req.query;
  let sql = 'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE 1=1';
  const args = [];
  if (category) { sql += ' AND p.categoryId = ?'; args.push(category); }
  if (featured) { sql += ' AND p.featured = 1'; }
  if (bestSeller) { sql += ' AND p.bestSeller = 1'; }
  if (hasOffer) { sql += ' AND p.hasOffer = 1'; }
  if (brand) { sql += ' AND p.brand = ?'; args.push(brand); }
  if (search) { sql += ' AND (p.name LIKE ? OR p.nameEn LIKE ? OR p.description LIKE ?)'; args.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY p.createdAt DESC';
  const { rows } = await db.execute({ sql, args });
  res.json(rows.map(mapProduct));
});

router.get('/brands', async (req, res) => {
  const { rows } = await db.execute("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != ''");
  res.json(rows.map(b => b.brand));
});

router.get('/:id', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?', args: [req.params.id] });
  if (!rows[0]) return res.status(404).json({ error: 'المنتج غير موجود' });
  const product = mapProduct(rows[0]);
  const { rows: similar } = await db.execute({ sql: 'SELECT * FROM products WHERE categoryId = ? AND id != ? ORDER BY RANDOM() LIMIT 4', args: [product.categoryId, product.id] });
  res.json({ ...product, similar: similar.map(mapProduct) });
});

router.post('/', auth, async (req, res) => {
  const { name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency } = req.body;
  const { lastInsertRowid } = await db.execute({ sql: `INSERT INTO products (name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [name, nameEn, description, price, oldPrice || null, JSON.stringify(images || []), categoryId || null, featured ? 1 : 0, bestSeller ? 1 : 0, hasOffer ? 1 : 0, brand || null, inStock !== undefined ? (inStock ? 1 : 0) : 1, currency || 'sar'] });
  res.json({ id: Number(lastInsertRowid) });
});

router.put('/:id', auth, async (req, res) => {
  const { name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency } = req.body;
  await db.execute({ sql: `UPDATE products SET name=?, nameEn=?, description=?, price=?, oldPrice=?, images=?, categoryId=?, featured=?, bestSeller=?, hasOffer=?, brand=?, inStock=?, currency=? WHERE id=?`, args: [name, nameEn, description, price, oldPrice || null, JSON.stringify(images || []), categoryId || null, featured ? 1 : 0, bestSeller ? 1 : 0, hasOffer ? 1 : 0, brand || null, inStock !== undefined ? (inStock ? 1 : 0) : 1, currency || 'sar', req.params.id] });
  res.json({ message: 'تم التحديث' });
});

router.delete('/:id', auth, async (req, res) => {
  await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [req.params.id] });
  res.json({ message: 'تم الحذف' });
});

export default router;
