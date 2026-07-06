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
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  const stringKeys = ['phone', 'whatsapp', 'siteName', 'siteDescription', 'address', 'email', 'heroTitle', 'heroSubtitle', 'aboutText'];
  for (const row of rows) {
    try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; }
    if (stringKeys.includes(row.key)) settings[row.key] = String(settings[row.key]);
  }
  res.json(settings);
});

router.put('/', auth, (req, res) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const trx = db.transaction((settings) => {
    for (const [key, value] of Object.entries(settings)) {
      stmt.run(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  });
  trx(req.body);
  res.json({ message: 'تم حفظ الإعدادات' });
});

export default router;
