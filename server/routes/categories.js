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
  const categories = db.prepare('SELECT * FROM categories ORDER BY sortOrder ASC, name ASC').all();
  res.json(categories);
});

router.post('/', auth, (req, res) => {
  const { name, nameEn, image } = req.body;
  const maxOrder = db.prepare('SELECT MAX(sortOrder) as m FROM categories').get();
  const result = db.prepare('INSERT INTO categories (name, nameEn, image, sortOrder) VALUES (?, ?, ?, ?)').run(name, nameEn || '', image || '', (maxOrder?.m || 0) + 1);
  res.json({ id: result.lastInsertRowid });
});

router.put('/reorder', auth, (req, res) => {
  const { items } = req.body;
  const stmt = db.prepare('UPDATE categories SET sortOrder = ? WHERE id = ?');
  const trx = db.transaction((items) => {
    for (const [index, id] of items.entries()) {
      stmt.run(index, id);
    }
  });
  trx(items);
  res.json({ message: 'تم إعادة الترتيب' });
});

router.put('/:id', auth, (req, res) => {
  const { name, nameEn, image } = req.body;
  db.prepare('UPDATE categories SET name=?, nameEn=?, image=? WHERE id=?').run(name, nameEn || '', image || '', req.params.id);
  res.json({ message: 'تم التحديث' });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('UPDATE products SET categoryId = NULL WHERE categoryId = ?').run(req.params.id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'تم الحذف' });
});

export default router;
