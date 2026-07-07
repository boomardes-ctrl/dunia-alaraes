import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();
const JWT_SECRET = 'dunya-alaraes-secret-key-2026';

router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(401).json({ error: 'كلمة المرور مطلوبة' });
  const { rows } = await db.execute('SELECT * FROM admins WHERE id = 1');
  const admin = rows[0];
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

router.put('/password', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'غير مصرح' });
  try {
    jwt.verify(auth.split(' ')[1], JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  const { oldPassword, newPassword } = req.body;
  const { rows } = await db.execute('SELECT * FROM admins WHERE id = 1');
  const admin = rows[0];
  if (!bcrypt.compareSync(oldPassword, admin.password)) {
    return res.status(400).json({ error: 'كلمة المرور القديمة غير صحيحة' });
  }
  await db.execute({ sql: 'UPDATE admins SET password = ? WHERE id = 1', args: [bcrypt.hashSync(newPassword, 10)] });
  res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
});

export default router;
export { JWT_SECRET };
