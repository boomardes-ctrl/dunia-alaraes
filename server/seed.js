import db from './db.js';

const categories = [
  { name: 'العطور', nameEn: 'Perfumes', sortOrder: 1 },
  { name: 'المكياج', nameEn: 'Makeup', sortOrder: 2 },
  { name: 'العناية بالبشرة', nameEn: 'Skincare', sortOrder: 3 },
  { name: 'العناية بالشعر', nameEn: 'Hair Care', sortOrder: 4 },
  { name: 'الإكسسوارات', nameEn: 'Accessories', sortOrder: 5 },
  { name: 'هدايا', nameEn: 'Gifts', sortOrder: 6 },
];

const insCat = db.prepare('INSERT INTO categories (name, nameEn, sortOrder) VALUES (?, ?, ?)');
const existingCats = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (existingCats.count === 0) {
  for (const cat of categories) {
    insCat.run(cat.name, cat.nameEn, cat.sortOrder);
  }
  console.log('✅ Added categories');
} else {
  console.log('ℹ️ Categories already exist');
}

const products = [
  { name: 'عطر الورود الفاخر', nameEn: 'Luxury Rose Perfume', description: 'عطر راقٍ مستوحى من الورود الدمشقية، يدوم طويلاً ويمنحك إطلالة ساحرة. مزيج فريد من الزهور النقية مع لمسات من المسك والعنبر.', price: 350, oldPrice: 450, categoryId: 1, featured: 1, bestSeller: 1, brand: 'ديور', hasOffer: 1, images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80', 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&q=80'] },
  { name: 'أحمر شفاه قرمزي', nameEn: 'Crimson Lipstick', description: 'أحمر شفاه طويل الثبات بتركيبة غنية بالزيوت المرطبة. لون قرمزي جذاب يناسب جميع المناسبات.', price: 120, oldPrice: null, categoryId: 2, featured: 1, bestSeller: 1, brand: 'ماك', hasOffer: 0, images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80'] },
  { name: 'كريم ترطيب البشرة', nameEn: 'Moisturizing Cream', description: 'كريم ترطيب عميق بخلاصة الصبار وزبدة الشيا. مناسب لجميع أنواع البشرة، يمنحك نضارة وانتعاش يدوم طوال اليوم.', price: 180, oldPrice: 220, categoryId: 3, featured: 1, brand: 'لوريال', hasOffer: 1, images: ['https://images.unsplash.com/photo-1570194065650-d99fb4a38e1f?w=400&q=80'] },
  { name: 'عطر الياسمين', nameEn: 'Jasmine Perfume', description: 'عطر منعش برائحة الياسمين المتفتح مع لمسات من الحمضيات والفانيليا. عطر يومي مثالي.', price: 280, oldPrice: null, categoryId: 1, featured: 1, bestSeller: 1, brand: 'شانيل', hasOffer: 0, images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80'] },
  { name: 'ظلال عيون طبيعي', nameEn: 'Natural Eye Shadow', description: 'لوحة ظلال عيون بثمانية ألوان طبيعية. تركيبة ناعمة تدوم طويلاً دون تكسير.', price: 150, oldPrice: 190, categoryId: 2, featured: 1, brand: 'نيود', hasOffer: 1, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'] },
  { name: 'ماسك الذهب للوجه', nameEn: 'Gold Face Mask', description: 'ماسك للوجه بخلاصة الذهب عيار 24 قيراطاً. يمنح البشرة إشراقة فورية ويحارب علامات التقدم في السن.', price: 220, oldPrice: null, categoryId: 3, featured: 1, brand: 'كلينيك', hasOffer: 0, images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80'] },
  { name: 'زيت الشعر المغربي', nameEn: 'Moroccan Hair Oil', description: 'زيت الأرگان المغربي الأصلي لترطيب وتغذية الشعر. يمنح الشعر لمعاناً ونعومة لا تُقاوم.', price: 160, oldPrice: 200, categoryId: 4, bestSeller: 1, brand: 'ارگان', hasOffer: 1, images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80'] },
  { name: 'عطر العود الملكي', nameEn: 'Royal Oud Perfume', description: 'عطر فاخر بمزيج من العود والزعفران والورد. عطر شرقي أصلي يناسب السهرات والمناسبات الخاصة.', price: 520, oldPrice: 650, categoryId: 1, bestSeller: 1, brand: 'ديور', hasOffer: 1, images: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&q=80'] },
  { name: 'مجموعة فرش مكياج', nameEn: 'Makeup Brush Set', description: 'مجموعة متكاملة من 12 فرشاة مكياج احترافية. مصنوعة من ألياف فائقة النعومة.', price: 250, oldPrice: null, categoryId: 2, brand: 'ريال تكنيكس', hasOffer: 0, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'] },
  { name: 'كريم واقي شمس', nameEn: 'Sun Protection Cream', description: 'واقي شمس بعامل حماية SPF 50. تركيبة خفيفة لا تسبب انسداد المسام.', price: 140, oldPrice: 170, categoryId: 3, brand: 'لوريال', hasOffer: 1, images: ['https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=400&q=80'] },
  { name: 'عطر الفانيليا الحلو', nameEn: 'Sweet Vanilla Perfume', description: 'عطر دافئ وحلو برائحة الفانيليا مع لمسات من الكراميل وجوز الهند.', price: 310, oldPrice: null, categoryId: 1, featured: 1, brand: 'شانيل', hasOffer: 0, images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80'] },
  { name: 'سيروم فيتامين سي', nameEn: 'Vitamin C Serum', description: 'سيروم مركز بفيتامين C لتفتيح البشرة وتوحيد لونها. يقلل من ظهور البقع الداكنة.', price: 190, oldPrice: 240, categoryId: 3, bestSeller: 1, brand: 'كلينيك', hasOffer: 1, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80'] },
  { name: 'عقد ذهبي ناعم', nameEn: 'Delicate Gold Necklace', description: 'عقد ذهبي ناعم بتصميم عصري أنيق. هدية مثالية لمن تحبين.', price: 450, oldPrice: null, categoryId: 5, brand: 'تيفاني', hasOffer: 0, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'] },
  { name: 'حقيبة هدايا فاخرة', nameEn: 'Luxury Gift Box', description: 'حقيبة هدايا تحتوي على مجموعة منتجات مختارة: عطر، كريم، أحمر شفاه. هدية متكاملة.', price: 600, oldPrice: 780, categoryId: 6, featured: 1, brand: 'ديور', hasOffer: 1, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80'] },
  { name: 'شامبو مغذي بالكيراتين', nameEn: 'Keratin Nourishing Shampoo', description: 'شامبو غني بالكيراتين والبروتينات لتقوية الشعر وترميم التالف.', price: 110, oldPrice: null, categoryId: 4, brand: 'لوريال', hasOffer: 0, images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80'] },
  { name: 'مصحح عيوب الكونسيلر', nameEn: 'Concealer', description: 'كونسيلر بتغطية كاملة لإخفاء الهالات السوداء وعيوب البشرة. تركيبة خفيفة تدوم طويلاً.', price: 95, oldPrice: 130, categoryId: 2, brand: 'ماك', hasOffer: 1, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'] },
  { name: 'عطر المسك الأبيض', nameEn: 'White Musk Perfume', description: 'عطر المسك الأبيض النقي. عطر ناعم وجذاب مناسب للاستخدام اليومي.', price: 260, oldPrice: null, categoryId: 1, bestSeller: 1, brand: 'نارسيسو', hasOffer: 0, images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80'] },
  { name: 'بلسم مرطب للشعر', nameEn: 'Hair Conditioning Balm', description: 'بلسم مغذي بزيت جوز الهند والأرجان لترطيب الشعر وتنعيمه.', price: 130, oldPrice: 160, categoryId: 4, brand: 'ارگان', hasOffer: 1, images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80'] },
  { name: 'ساعة أنيقة', nameEn: 'Elegant Watch', description: 'ساعة يد نسائية بتصميم أنيق. هدية رائعة تناسب جميع الأوقات.', price: 380, oldPrice: null, categoryId: 5, brand: 'تيفاني', hasOffer: 0, images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80'] },
  { name: 'حلق ألماس', nameEn: 'Diamond Earrings', description: 'أقراط ألماس صغيرة بتصميم عصري. تضفي لمسة من الأناقة على إطلالتك.', price: 550, oldPrice: 700, categoryId: 5, featured: 1, brand: 'تيفاني', hasOffer: 1, images: ['https://images.unsplash.com/photo-1535632066927-ab7c8ab60908?w=400&q=80'] },
];

const insProd = db.prepare(`INSERT INTO products (name, nameEn, description, price, oldPrice, images, categoryId, featured, bestSeller, hasOffer, brand, inStock, currency)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'sar')`);

const existingProds = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (existingProds.count === 0) {
  const trx = db.transaction(() => {
    for (const p of products) {
      insProd.run(p.name, p.nameEn, p.description, p.price, p.oldPrice, JSON.stringify(p.images), p.categoryId, p.featured || 0, p.bestSeller || 0, p.hasOffer || 0, p.brand || null);
    }
  });
  trx();
  console.log(`✅ Added ${products.length} products`);
} else {
  console.log(`ℹ️ ${existingProds.count} products already exist`);
}

console.log('✅ Seed completed!');
process.exit(0);
