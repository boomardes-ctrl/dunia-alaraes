import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'data.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nameEn TEXT,
    image TEXT,
    sortOrder INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nameEn TEXT,
    description TEXT,
    price REAL NOT NULL,
    oldPrice REAL,
    images TEXT DEFAULT '[]',
    categoryId INTEGER,
    featured INTEGER DEFAULT 0,
    bestSeller INTEGER DEFAULT 0,
    hasOffer INTEGER DEFAULT 0,
    brand TEXT,
    inStock INTEGER DEFAULT 1,
    currency TEXT DEFAULT 'sar',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNumber TEXT UNIQUE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    customerName TEXT NOT NULL,
    customerPhone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    items TEXT NOT NULL,
    total REAL NOT NULL,
    totalSar REAL DEFAULT 0,
    totalYer REAL DEFAULT 0,
    status TEXT DEFAULT 'جديد',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    mime TEXT DEFAULT 'image/jpeg',
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

const adminExists = db.prepare('SELECT id FROM admins LIMIT 1').get();
if (!adminExists) {
  const hash = bcrypt.hashSync('1234', 10);
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hash);
}

const defaultSettings = {
  siteName: 'دنيا العرائس',
  siteDescription: 'متجر متخصص في بيع العطور ومستحضرات التجميل والإكسسوارات النسائية',
  phone: '+966500000000',
  whatsapp: '+966500000000',
  logo: '',
  primaryColor: '#6B1D3A',
  accentColor: '#C9A84C',
  heroTitle: 'أهلاً بك في دنيا العرائس',
  heroSubtitle: 'اكتشفي عالم من الجمال والأناقة',
  heroImage: '',
  aboutText: '',
  address: 'المملكة العربية السعودية',
  email: 'info@dunyaalaræs.com',
  exchangeRate: '250',
  socialLinks: '[]',
  gallery: '[]',
};

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaultSettings)) {
  insertSetting.run(key, value);
}

export default db;
