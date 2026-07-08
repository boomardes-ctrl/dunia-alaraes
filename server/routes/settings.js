import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET } from './admin.js';

const router = Router();
const stringKeys = ['phone', 'whatsapp', 'siteName', 'siteDescription', 'address', 'email', 'heroTitle', 'heroSubtitle', 'aboutText'];

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

router.get('/', async (req, res) => {
  const { rows } = await db.execute('SELECT key, value FROM settings');
  const settings = {};
  for (const row of rows) {
    try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; }
    if (stringKeys.includes(row.key)) settings[row.key] = String(settings[row.key]);
  }
  res.json(settings);
});

router.put('/', auth, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.execute({ sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', args: [key, typeof value === 'object' ? JSON.stringify(value) : value] });
    }
    res.json({ message: 'تم حفظ الإعدادات' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
