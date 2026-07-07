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

async function generateOrderNumber() {
  const { rows } = await db.execute('SELECT id FROM orders ORDER BY id DESC LIMIT 1');
  const next = (rows[0]?.id || 0) + 1;
  return `ds-${next}`;
}

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}

router.post('/', async (req, res) => {
  const { customerName, customerPhone, city, address, notes, items, total, totalSar, totalYer, whatsappNumber, frontendUrl } = req.body;
  const orderNumber = await generateOrderNumber();
  const token = generateToken();
  const { lastInsertRowid } = await db.execute({ sql: `INSERT INTO orders (orderNumber, token, customerName, customerPhone, city, address, notes, items, total, totalSar, totalYer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [orderNumber, token, customerName, customerPhone, city, address || '', notes || '', JSON.stringify(items), total, totalSar || 0, totalYer || 0] });
  const origin = frontendUrl || req.headers.origin || `${req.protocol}://${req.get('host')}`;
  const cartLink = `${origin}/cart/${token}`;
  let totalText = `المجموع: ${total}`;
  if (totalSar && totalYer) totalText = `المجموع: ${totalSar} ر.س + ${totalYer} ر.ي`;
  else if (totalSar) totalText = `المجموع: ${totalSar} ر.س`;
  else if (totalYer) totalText = `المجموع: ${totalYer} ر.ي`;
  const waMsg = encodeURIComponent(`السلام عليكم.\nلدي طلب جديد.\nرقم الطلب: ${orderNumber}\n${totalText}\nرابط السلة: ${cartLink}`);
  const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${waMsg}`;
  res.json({ id: Number(lastInsertRowid), orderNumber, token, cartLink, waUrl });
});

router.get('/token/:token', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM orders WHERE token = ?', args: [req.params.token] });
  if (!rows[0]) return res.status(404).json({ error: 'الطلب غير موجود' });
  rows[0].items = JSON.parse(rows[0].items);
  res.json(rows[0]);
});

router.get('/', auth, async (req, res) => {
  const { search, status } = req.query;
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const args = [];
  if (search) { sql += ' AND (orderNumber LIKE ? OR customerName LIKE ? OR customerPhone LIKE ?)'; args.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (status) { sql += ' AND status = ?'; args.push(status); }
  sql += ' ORDER BY createdAt DESC';
  const { rows } = await db.execute({ sql, args });
  res.json(rows.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  await db.execute({ sql: "UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?", args: [status, req.params.id] });
  res.json({ message: 'تم تحديث الحالة' });
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [req.params.id] });
  if (!rows[0]) return res.status(404).json({ error: 'الطلب غير موجود' });
  rows[0].items = JSON.parse(rows[0].items);
  res.json(rows[0]);
});

export default router;
