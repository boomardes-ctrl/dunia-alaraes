import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db, { initDatabase } from './db.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';
import uploadRouter from './routes/upload.js';
import settingsRouter from './routes/settings.js';
import backupRouter from './routes/backup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';
const prodOrigins = (process.env.CORS_ORIGINS || 'https://dunia-alaraes.onrender.com,https://dunya-alaraas.vercel.app,https://dunia-alaraas.fly.dev').split(',');

app.use(cors({ origin: isProd ? prodOrigins : '*' }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/backup', backupRouter);

app.get('/api/media/:id', async (req, res) => {
  const row = (await db.execute({ sql: 'SELECT data, mime FROM media WHERE id = ?', args: [req.params.id] })).rows[0];
  if (!row) return res.status(404).json({ error: 'الصورة غير موجودة' });
  const img = Buffer.from(row.data, 'base64');
  res.writeHead(200, { 'Content-Type': row.mime, 'Content-Length': img.length, 'Cache-Control': 'public, max-age=86400' });
  res.end(img);
});

if (isProd) {
  app.use(express.static(join(__dirname, '..', 'dist')));
  app.get('/{*any}', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  initDatabase().catch(err => console.error('DB init failed:', err));
});
