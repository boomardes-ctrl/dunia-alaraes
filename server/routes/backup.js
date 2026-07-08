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

router.get('/', auth, async (req, res) => {
  const { rows: products } = await db.execute('SELECT * FROM products ORDER BY id');
  const { rows: categories } = await db.execute('SELECT * FROM categories ORDER BY id');
  const { rows: orders } = await db.execute('SELECT * FROM orders ORDER BY id');
  const { rows: settingsRows } = await db.execute('SELECT * FROM settings');
  const settings = {};
  settingsRows.forEach(r => { settings[r.key] = r.value; });
  try { settings.socialLinks = JSON.parse(settings.socialLinks || '[]'); } catch { settings.socialLinks = []; }
  const { rows: media } = await db.execute('SELECT * FROM media');

  res.json({
    version: 2,
    createdAt: new Date().toISOString(),
    products: products.map(p => ({ ...p, images: JSON.parse(p.images || '[]') })),
    categories,
    orders: orders.map(o => ({ ...o, items: JSON.parse(o.items || '[]') })),
    settings,
    media,
  });
});

router.post('/restore', auth, async (req, res) => {
  const data = req.body;
  if (!data || !data.products || !data.categories || !data.settings) {
    return res.status(400).json({ error: 'بيانات غير صالحة' });
  }
  try {
    await db.execute('DELETE FROM products');
    await db.execute('DELETE FROM categories');
    await db.execute('DELETE FROM orders');

    for (const c of data.categories) {
      await db.execute({ sql: 'INSERT INTO categories (id, name, nameEn, image, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?)', args: [c.id || undefined, c.name, c.nameEn || null, c.image || null, c.sortOrder || 0, c.createdAt || new Date().toISOString()] });
    }

    for (const p of data.products) {
      await db.execute({ sql: `INSERT INTO products (id, name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [p.id || undefined, p.name, p.nameEn || null, p.description || null, p.price, p.oldPrice || null, JSON.stringify(p.images || []), p.categoryId || null, p.featured || 0, p.bestSeller || 0, p.hasOffer || 0, p.brand || null, p.inStock !== undefined ? (p.inStock ? 1 : 0) : 1, p.currency || 'sar', p.createdAt || new Date().toISOString()] });
    }

    for (const o of data.orders || []) {
      await db.execute({ sql: `INSERT INTO orders (id, orderNumber, token, customerName, customerPhone, city, address, notes, items, total, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [o.id || undefined, o.orderNumber, o.token, o.customerName, o.customerPhone, o.city, o.address || '', o.notes || '', JSON.stringify(o.items || []), o.total, o.status || 'جديد', o.createdAt || new Date().toISOString(), o.updatedAt || new Date().toISOString()] });
    }

    for (const [key, value] of Object.entries(data.settings)) {
      await db.execute({ sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', args: [key, typeof value === 'object' ? JSON.stringify(value) : String(value)] });
    }

    if (data.media && data.media.length > 0) {
      await db.execute('DELETE FROM media');
      for (const m of data.media) {
        await db.execute({ sql: 'INSERT OR REPLACE INTO media (id, data, mime, createdAt) VALUES (?, ?, ?, ?)', args: [m.id, m.data || '', m.mime || 'image/jpeg', m.createdAt || new Date().toISOString()] });
      }
    }

    res.json({ message: `تمت استعادة ${data.products.length} منتج و ${data.categories.length} قسم و ${(data.media || []).length} صورة` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
