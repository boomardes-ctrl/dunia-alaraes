# دنيا العرائس - Dunya Alaraes

متجر إلكتروني متخصص في بيع العطور ومستحضرات التجميل والإكسسوارات النسائية.

## التقنيات المستخدمة

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Zustand, React Router 7, Lucide Icons
- **Backend:** Express 5, SQLite (better-sqlite3), JWT, Multer
- **Deployment:** Docker, Fly.io

## البدء

```bash
# تثبيت الاعتماديات
npm install

# تشغيل وضع التطوير (واجهة + سيرفر)
npm run dev:all

# أو بشكل منفصل:
npm run dev        # واجهة React على http://localhost:5173
npm run dev:server # سيرفر API على http://localhost:3001
```

## البناء للإنتاج

```bash
npm run build
```

## لوحة التحكم

- الدخول: `/admin`
- اسم المستخدم: `admin`
- كلمة المرور: `admin123`

## API Routes

| المسار | الوصف |
|--------|-------|
| `GET /api/products` | قائمة المنتجات (مع فلترة) |
| `GET /api/products/:id` | تفاصيل منتج |
| `GET /api/products/brands` | قائمة الماركات |
| `POST /api/orders` | إنشاء طلب |
| `GET /api/orders/token/:token` | عرض طلب عبر التوكن |
| `GET /api/categories` | قائمة الأقسام |
| `GET /api/settings` | إعدادات الموقع |
| `POST /api/admin/login` | تسجيل دخول الأدمن |
