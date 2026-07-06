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

router.get('/', (req, res) => {
  const { category, featured, bestSeller, hasOffer, search, brand } = req.query;
  let sql = 'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND p.categoryId = ?'; params.push(category); }
  if (featured) { sql += ' AND p.featured = 1'; }
  if (bestSeller) { sql += ' AND p.bestSeller = 1'; }
  if (hasOffer) { sql += ' AND p.hasOffer = 1'; }
  if (brand) { sql += ' AND p.brand = ?'; params.push(brand); }
  if (search) { sql += ' AND (p.name LIKE ? OR p.nameEn LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY p.createdAt DESC';
  const products = db.prepare(sql).all(...params);
  res.json(products.map(p => ({ ...p, images: JSON.parse(p.images || '[]') })));
});

router.get('/brands', (req, res) => {
  const brands = db.prepare("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != ''").all();
  res.json(brands.map(b => b.brand));
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  product.images = JSON.parse(product.images || '[]');
  const similar = db.prepare('SELECT * FROM products WHERE categoryId = ? AND id != ? ORDER BY RANDOM() LIMIT 4').all(product.categoryId, product.id);
  res.json({ ...product, similar: similar.map(p => ({ ...p, images: JSON.parse(p.images || '[]') })) });
});

router.post('/', auth, (req, res) => {
  const { name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency } = req.body;
  const result = db.prepare(`INSERT INTO products (name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    name, nameEn, description, price, oldPrice || null, JSON.stringify(images || []), categoryId || null,
    featured ? 1 : 0, bestSeller ? 1 : 0, hasOffer ? 1 : 0, brand || null, inStock !== undefined ? (inStock ? 1 : 0) : 1,
    currency || 'sar'
  );
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', auth, (req, res) => {
  const { name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency } = req.body;
  db.prepare(`UPDATE products SET name=?, nameEn=?, description=?, price=?, oldPrice=?, images=?, categoryId=?, featured=?, bestSeller=?, hasOffer=?, brand=?, inStock=?, currency=? WHERE id=?`).run(
    name, nameEn, description, price, oldPrice || null, JSON.stringify(images || []), categoryId || null,
    featured ? 1 : 0, bestSeller ? 1 : 0, hasOffer ? 1 : 0, brand || null, inStock !== undefined ? (inStock ? 1 : 0) : 1,
    currency || 'sar',
    req.params.id
  );
  res.json({ message: 'تم التحديث' });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'تم الحذف' });
});

export default router;
