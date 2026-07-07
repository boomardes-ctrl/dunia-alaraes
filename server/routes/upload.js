import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import fs from 'fs';
import db from '../db.js';
import { JWT_SECRET } from './admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = join(__dirname, '..', 'uploads');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '9118c0de4584627875d554d0c1c8e12d';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    cb(null, allowed.test(file.mimetype));
  },
});

const router = Router();

router.post('/', upload.single('file'), async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'غير مصرح' });
  try {
    jwt.verify(auth.split(' ')[1], JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'غير مصرح' });
  }

  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع ملف' });

  const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

  if (useCloudinary) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { public_id: uuidv4(), folder: 'dunya-alaraes', resource_type: 'image' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      return res.json({ url: result.secure_url });
    } catch (err) {
      return res.status(500).json({ error: 'فشل رفع الصورة لـ Cloudinary' });
    }
  }

  if (IMGBB_API_KEY) {
    try {
      const base64 = req.file.buffer.toString('base64');
      const resp = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ image: base64 }),
      });
      const result = await resp.json();
      if (result && result.data && result.data.url) {
        return res.json({ url: result.data.url });
      }
    } catch (err) {}
  }

  const mediaId = uuidv4();
  const base64 = req.file.buffer.toString('base64');
  const mime = req.file.mimetype;
  await db.execute({ sql: 'INSERT INTO media (id, data, mime) VALUES (?, ?, ?)', args: [mediaId, base64, mime] });

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${mediaId}${extname(req.file.originalname)}`;
  fs.writeFileSync(join(uploadsDir, filename), req.file.buffer);

  res.json({ url: `/api/media/${mediaId}`, mediaId });
});

export default router;
