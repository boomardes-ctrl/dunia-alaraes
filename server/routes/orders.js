import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET } from './admin.js';

const router = Router();

function generateOrderNumber() {
  const last = db.prepare('SELECT id FROM orders ORDER BY id DESC LIMIT 1').get();
  const next = (last?.id || 0) + 1;
  return `ds-${next}`;
}

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

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

router.post('/', (req, res) => {
  const { customerName, customerPhone, city, address, notes, items, total, totalSar, totalYer, whatsappNumber, frontendUrl } = req.body;
  const orderNumber = generateOrderNumber();
  const token = generateToken();
  try { db.prepare("ALTER TABLE orders ADD COLUMN totalSar REAL DEFAULT 0").run(); } catch {}
  try { db.prepare("ALTER TABLE orders ADD COLUMN totalYer REAL DEFAULT 0").run(); } catch {}
  const result = db.prepare(`INSERT INTO orders (orderNumber, token, customerName, customerPhone, city, address, notes, items, total, totalSar, totalYer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(orderNumber, token, customerName, customerPhone, city, address || '', notes || '', JSON.stringify(items), total, totalSar || 0, totalYer || 0);
  const origin = frontendUrl || req.headers.origin || `${req.protocol}://${req.get('host')}`;
  const cartLink = `${origin}/cart/${token}`;
  let totalText = `المجموع: ${total}`;
  if (totalSar && totalYer) totalText = `المجموع: ${totalSar} ر.س + ${totalYer} ر.ي`;
  else if (totalSar) totalText = `المجموع: ${totalSar} ر.س`;
  else if (totalYer) totalText = `المجموع: ${totalYer} ر.ي`;
  const waMsg = encodeURIComponent(`السلام عليكم.\nلدي طلب جديد.\nرقم الطلب: ${orderNumber}\n${totalText}\nرابط السلة: ${cartLink}`);
  const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${waMsg}`;
  res.json({ id: result.lastInsertRowid, orderNumber, token, cartLink, waUrl });
});

router.get('/token/:token', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE token = ?').get(req.params.token);
  if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
  order.items = JSON.parse(order.items);
  res.json(order);
});

router.get('/', auth, (req, res) => {
  const { search, status } = req.query;
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND (orderNumber LIKE ? OR customerName LIKE ? OR customerPhone LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY createdAt DESC';
  const orders = db.prepare(sql).all(...params);
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

router.put('/:id/status', auth, (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?").run(status, req.params.id);
  res.json({ message: 'تم تحديث الحالة' });
});

router.get('/:id', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
  order.items = JSON.parse(order.items);
  res.json(order);
});

export default router;
