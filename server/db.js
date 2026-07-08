import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const gfetch = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TURSO_URL = process.env.TURSO_DB_URL || 'https://dunia-alaraes-boomardes.aws-eu-west-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_DB_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM0MTUyOTYsImlkIjoiMDE5ZjNiZDEtY2MwMS03OGIzLTgyOTktOTVjYWIxOTk5ODU3Iiwia2lkIjoiWlAybGgwYTFSU0dUandpYTB2YTU0TzlqdGZ4MDhkSWYwZWVQd2lGRGdsZyIsInJpZCI6IjdlMzYxYmZiLTVkNDktNGQzZS04ZTU2LWFiMmQ3ZmQ3OTQzZCJ9.UM7zp7xi2TPlUIQg0CmsmUjbrNWKNLZ7xpNo42pLGqipJKCEd8k3LPKzdVYegY8-xkMz0epqsRpSGDt7WPqvAw';

const DB_HTTP = TURSO_URL.replace('libsql://', 'https://') + '/v2/pipeline';

function tv(v) {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'number') return { type: Number.isInteger(v) ? 'integer' : 'float', value: String(v) };
  return { type: 'text', value: String(v) };
}

async function q(sql, args) {
  if (typeof sql === 'object' && sql !== null) { args = sql.args || []; sql = sql.sql; }
  const body = { requests: [{ type: 'execute', stmt: { sql, args: (args || []).map(tv) } }] };
  const resp = await gfetch(DB_HTTP, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TURSO_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`DB error (${resp.status}): ${txt}`);
  }
  const result = await resp.json();
  const res = result.results?.[0]?.response?.result;
  if (!res) {
    const err = result.results?.[0]?.error || 'DB query failed';
    throw new Error(typeof err === 'object' ? JSON.stringify(err) : err);
  }
  return { rows: res.rows?.map(r => {
    const obj = {};
    res.cols.forEach((col, i) => {
      const cell = r[i];
      if (!cell || cell.type === 'null') { obj[col.name] = null; return; }
      if (cell.type === 'integer') obj[col.name] = Number(cell.value);
      else if (cell.type === 'float') obj[col.name] = parseFloat(cell.value);
      else obj[col.name] = cell.value;
    });
    return obj;
  }) || [], lastInsertRowid: res.last_insert_rowid, cols: res.cols };
}

const db = { execute: q };

async function initDatabase() {
  await q("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, nameEn TEXT, image TEXT, sortOrder INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now')))");
  await q("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, nameEn TEXT, description TEXT, price REAL NOT NULL, oldPrice REAL, images TEXT DEFAULT '[]', categoryId INTEGER, featured INTEGER DEFAULT 0, bestSeller INTEGER DEFAULT 0, hasOffer INTEGER DEFAULT 0, brand TEXT, inStock INTEGER DEFAULT 1, currency TEXT DEFAULT 'sar', createdAt TEXT DEFAULT (datetime('now')), FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL)");
  await q("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, orderNumber TEXT UNIQUE NOT NULL, token TEXT UNIQUE NOT NULL, customerName TEXT NOT NULL, customerPhone TEXT NOT NULL, city TEXT NOT NULL, address TEXT DEFAULT '', notes TEXT DEFAULT '', items TEXT NOT NULL, total REAL NOT NULL, totalSar REAL DEFAULT 0, totalYer REAL DEFAULT 0, status TEXT DEFAULT 'جديد', createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')))");
  await q("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  await q("CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)");
  await q("CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, data TEXT NOT NULL, mime TEXT DEFAULT 'image/jpeg', createdAt TEXT DEFAULT (datetime('now')))");

  const admin = (await q('SELECT * FROM admins WHERE id = 1')).rows[0];
  if (!admin) {
    await q('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', bcrypt.hashSync('1234', 10)]);
  } else if (bcrypt.compareSync('admin123', admin.password)) {
    await q('UPDATE admins SET password = ? WHERE id = 1', [bcrypt.hashSync('1234', 10)]);
  }

  const defaultSettings = {
    siteName: 'دنيا العرائس', siteDescription: 'متجر متخصص في بيع العطور ومستحضرات التجميل والإكسسوارات النسائية',
    phone: '+966500000000', whatsapp: '+966500000000', logo: '', primaryColor: '#6B1D3A', accentColor: '#C9A84C',
    bgColor: '#FDF8F5', textColor: '#1A1A1A', textLight: '#6B7280', borderColor: '#E5E7EB',
    successColor: '#059669', warningColor: '#D97706', errorColor: '#DC2626',
    headerBg: '#6B1D3A', headerText: '#FFFFFF', footerBg: '#4A1227',
    footerText: '#FFFFFF', cardBg: '#FFFFFF', buttonBg: '#6B1D3A', buttonText: '#FFFFFF',
    heroTitle: 'أهلاً بك في دنيا العرائس', heroSubtitle: 'اكتشف عالم من الجمال والأناقة', heroImage: '', aboutText: '',
    address: 'المملكة العربية السعودية', email: 'info@dunyaalaraes.com', exchangeRate: '250', socialLinks: '[]',
    gallery: '["/gallery/1.jpg","/gallery/2.jpg","/gallery/3.jpg","/gallery/4.jpg","/gallery/5.jpg"]',
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await q('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }

  const catCount = (await q('SELECT COUNT(*) as c FROM categories')).rows[0].c;
  if (catCount === 0) {
    const cats = ['العطور', 'المكياج', 'العناية بالبشرة', 'العناية بالشعر', 'الإكسسوارات', 'هدايا'];
    const catEn = ['Perfumes', 'Makeup', 'Skincare', 'Hair Care', 'Accessories', 'Gifts'];
    for (let i = 0; i < cats.length; i++) {
      await q('INSERT INTO categories (name, nameEn, sortOrder) VALUES (?, ?, ?)', [cats[i], catEn[i], i + 1]);
    }

    const products = [
      { name: 'عطر الورد الفاخر', nameEn: 'Luxury Rose Perfume', description: 'عطر زهري فاخر يجمع بين نضارة الورد وجمال الإطلالة.', price: 350, oldPrice: 450, images: JSON.stringify(['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80', 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&q=80']), categoryId: 1, featured: 1, bestSeller: 1, hasOffer: 1, brand: 'ديور' },
      { name: 'أحمر الشفاه', nameEn: 'Crimson Lipstick', description: 'أحمر شفاه طويل يدوم طوال اليوم.', price: 120, categoryId: 2, featured: 1, bestSeller: 1, brand: 'مي', images: JSON.stringify(['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80']) },
      { name: 'كريم الترطيب', nameEn: 'Moisturizing Cream', description: 'كريم مغذي للبشرة يجعلها ناعمة.', price: 180, oldPrice: 220, categoryId: 3, featured: 1, hasOffer: 1, brand: 'نيفيا', images: JSON.stringify(['https://images.unsplash.com/photo-1570194065650-d99fb4a38e1f?w=400&q=80']) },
      { name: 'عطر الياسمين', nameEn: 'Jasmine Perfume', description: 'عطر الياسمين المنعش برائحة تدوم طويلاً.', price: 280, categoryId: 1, featured: 1, bestSeller: 1, brand: 'نفيس', images: JSON.stringify(['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80']) },
      { name: 'ظلال العيون', nameEn: 'Natural Eye Shadow', description: 'ظلال عيون طبيعية بألوان رائعة.', price: 150, oldPrice: 190, categoryId: 2, featured: 1, hasOffer: 1, brand: 'لور', images: JSON.stringify(['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80']) },
      { name: 'قناع الذهب', nameEn: 'Gold Face Mask', description: 'قناع للعناية بالبشرة بعيار 24 قيراط.', price: 220, categoryId: 3, featured: 1, brand: 'سويس', images: JSON.stringify(['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80']) },
      { name: 'زيت الشعر', nameEn: 'Moroccan Hair Oil', description: 'زيت مغربي لتقوية الشعر وتطويله.', price: 160, oldPrice: 200, categoryId: 4, bestSeller: 1, hasOffer: 1, brand: 'أرجان', images: JSON.stringify(['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80']) },
      { name: 'عطر العود الملكي', nameEn: 'Royal Oud Perfume', description: 'عطر خشبي فاخر برائحة العود.', price: 520, oldPrice: 650, categoryId: 1, bestSeller: 1, hasOffer: 1, brand: 'ديور', images: JSON.stringify(['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&q=80']) },
      { name: 'طقم فرش مكياج', nameEn: 'Makeup Brush Set', description: 'طقم مكون من 12 فرشاة مكياج احترافية.', price: 250, categoryId: 2, brand: 'بيوتي', images: JSON.stringify(['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80']) },
      { name: 'واقي الشمس', nameEn: 'Sun Protection Cream', description: 'كريم للحماية من الشمس SPF 50.', price: 140, oldPrice: 170, categoryId: 3, hasOffer: 1, brand: 'لاروش', images: JSON.stringify(['https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=400&q=80']) },
      { name: 'عطر الفانيليا', nameEn: 'Sweet Vanilla Perfume', description: 'عطر حلو برائحة الفانيليا اللذيذة.', price: 310, categoryId: 1, featured: 1, brand: 'نفيس', images: JSON.stringify(['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80']) },
      { name: 'سيروم فيتامين سي', nameEn: 'Vitamin C Serum', description: 'سيروم فيتامين C لتفتيح البشرة.', price: 190, oldPrice: 240, categoryId: 3, bestSeller: 1, hasOffer: 1, brand: 'سيروم', images: JSON.stringify(['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80']) },
      { name: 'عقد ذهبي', nameEn: 'Delicate Gold Necklace', description: 'عقد ذهبي أنيق وناعم.', price: 450, categoryId: 5, brand: 'لولو', images: JSON.stringify(['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80']) },
      { name: 'سلة هدايا', nameEn: 'Luxury Gift Box', description: 'سلة هدايا فاخرة تحتوي على عطر وشوكولاتة وورود.', price: 600, oldPrice: 780, categoryId: 6, featured: 1, hasOffer: 1, brand: 'ديور', images: JSON.stringify(['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80']) },
      { name: 'شامبو كيراتين', nameEn: 'Keratin Nourishing Shampoo', description: 'شامبو كيراتين مغذي للشعر الجاف.', price: 110, categoryId: 4, brand: 'لوريال', images: JSON.stringify(['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80']) },
      { name: 'خافي العيوب', nameEn: 'Concealer', description: 'خافي عيوب يخفي الهالات السوداء.', price: 95, oldPrice: 130, categoryId: 2, hasOffer: 1, brand: 'مي', images: JSON.stringify(['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80']) },
      { name: 'عطر المسك', nameEn: 'White Musk Perfume', description: 'عطر المسك الأبيض النقي.', price: 260, categoryId: 1, bestSeller: 1, brand: 'رصاصي', images: JSON.stringify(['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80']) },
      { name: 'بلسم الشعر', nameEn: 'Hair Conditioning Balm', description: 'بلسم لترطيب وتنعيم الشعر.', price: 130, oldPrice: 160, categoryId: 4, hasOffer: 1, brand: 'أرجان', images: JSON.stringify(['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80']) },
      { name: 'ساعة أنيقة', nameEn: 'Elegant Watch', description: 'ساعة نسائية أنيقة بلون ذهبي.', price: 380, categoryId: 5, brand: 'فاشن', images: JSON.stringify(['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80']) },
      { name: 'أقراط ألماس', nameEn: 'Diamond Earrings', description: 'أقراط ألماس طبيعي نقي.', price: 550, oldPrice: 700, categoryId: 5, featured: 1, hasOffer: 1, brand: 'لولو', images: JSON.stringify(['https://images.unsplash.com/photo-1535632066927-ab7c8ab60908?w=400&q=80']) },
    ];
    for (const p of products) {
      await q('INSERT INTO products (name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, \'sar\')', [p.name, p.nameEn, p.description, p.price, p.oldPrice || null, p.images, p.categoryId, p.featured || 0, p.bestSeller || 0, p.hasOffer || 0, p.brand || null]);
    }
  }
  console.log('Database initialized');
}

export { initDatabase };
export default db;
