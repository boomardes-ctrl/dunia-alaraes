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

router.get('/', auth, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id').all();
  const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
  const orders = db.prepare('SELECT * FROM orders ORDER BY id').all();
  const settingsRows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  settingsRows.forEach(r => { settings[r.key] = r.value; });
  try { settings.socialLinks = JSON.parse(settings.socialLinks || '[]'); } catch { settings.socialLinks = []; }

  const media = db.prepare('SELECT * FROM media').all();

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

router.post('/restore', auth, (req, res) => {
  const data = req.body;
  if (!data || !data.products || !data.categories || !data.settings) {
    return res.status(400).json({ error: 'بيانات غير صالحة' });
  }

  try {
    const trx = db.transaction(() => {
      db.exec('DELETE FROM products');
      db.exec('DELETE FROM categories');
      db.exec('DELETE FROM orders');

      const insCat = db.prepare('INSERT INTO categories (id, name, nameEn, image, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
      for (const c of data.categories) {
        insCat.run(c.id || undefined, c.name, c.nameEn || null, c.image || null, c.sortOrder || 0, c.createdAt || new Date().toISOString());
      }

      const insProd = db.prepare(`INSERT INTO products (id, name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const p of data.products) {
        insProd.run(p.id || undefined, p.name, p.nameEn || null, p.description || null, p.price, p.oldPrice || null,
          JSON.stringify(p.images || []), p.categoryId || null, p.featured || 0, p.bestSeller || 0, p.hasOffer || 0,
          p.brand || null, p.inStock !== undefined ? (p.inStock ? 1 : 0) : 1, p.currency || 'sar', p.createdAt || new Date().toISOString());
      }

      const insOrder = db.prepare(`INSERT INTO orders (id, orderNumber, token, customerName, customerPhone, city, address, notes, items, total, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const o of data.orders || []) {
        insOrder.run(o.id || undefined, o.orderNumber, o.token, o.customerName, o.customerPhone, o.city, o.address || '',
          o.notes || '', JSON.stringify(o.items || []), o.total, o.status || 'جديد',
          o.createdAt || new Date().toISOString(), o.updatedAt || new Date().toISOString());
      }

      const upsertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      for (const [key, value] of Object.entries(data.settings)) {
        upsertSetting.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }

      if (data.media && data.media.length > 0) {
        db.exec('DELETE FROM media');
        const insMedia = db.prepare('INSERT OR REPLACE INTO media (id, data, mime, createdAt) VALUES (?, ?, ?, ?)');
        for (const m of data.media) {
          insMedia.run(m.id, m.data || '', m.mime || 'image/jpeg', m.createdAt || new Date().toISOString());
        }
      }
    });
    trx();
    res.json({ message: `تمت استعادة ${data.products.length} منتج و ${data.categories.length} قسم و ${(data.media || []).length} صورة` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;