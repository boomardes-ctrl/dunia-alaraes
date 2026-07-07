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

router.get('/', async (req, res) => {
  const { rows } = await db.execute('SELECT * FROM categories ORDER BY sortOrder ASC, name ASC');
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { name, nameEn, image } = req.body;
  const { rows } = await db.execute('SELECT MAX(sortOrder) as m FROM categories');
  const maxOrder = rows[0]?.m || 0;
  const { lastInsertRowid } = await db.execute({ sql: 'INSERT INTO categories (name, nameEn, image, sortOrder) VALUES (?, ?, ?, ?)', args: [name, nameEn || '', image || '', maxOrder + 1] });
  res.json({ id: Number(lastInsertRowid) });
});

router.put('/reorder', auth, async (req, res) => {
  const { items } = req.body;
  await db.execute('BEGIN');
  try {
    for (const [index, id] of items.entries()) {
      await db.execute({ sql: 'UPDATE categories SET sortOrder = ? WHERE id = ?', args: [index, id] });
    }
    await db.execute('COMMIT');
  } catch (err) {
    await db.execute('ROLLBACK');
  }
  res.json({ message: 'تم إعادة الترتيب' });
});

router.put('/:id', auth, async (req, res) => {
  const { name, nameEn, image } = req.body;
  await db.execute({ sql: 'UPDATE categories SET name=?, nameEn=?, image=? WHERE id=?', args: [name, nameEn || '', image || '', req.params.id] });
  res.json({ message: 'تم التحديث' });
});

router.delete('/:id', auth, async (req, res) => {
  await db.execute({ sql: 'UPDATE products SET categoryId = NULL WHERE categoryId = ?', args: [req.params.id] });
  await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [req.params.id] });
  res.json({ message: 'تم الحذف' });
});

export default router;
