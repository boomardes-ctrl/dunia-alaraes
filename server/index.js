import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';
import uploadRouter from './routes/upload.js';
import settingsRouter from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';
const prodOrigins = (process.env.CORS_ORIGINS || 'https://dunya-alaraas.vercel.app,https://dunia-alaraas.fly.dev').split(',');

app.use(cors({ origin: isProd ? prodOrigins : '*' }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/settings', settingsRouter);

if (isProd) {
  app.use(express.static(join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
});
