export interface Product {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  oldPrice?: number | null;
  images: string[];
  categoryId?: number | null;
  categoryName?: string;
  featured: number;
  bestSeller: number;
  hasOffer: number;
  brand?: string;
  inStock: number;
  currency: 'sar' | 'yer';
  createdAt: string;
}

export const CURRENCIES = {
  sar: { label: 'ريال سعودي', symbol: 'ر.س', code: 'SAR' },
  yer: { label: 'ريال يمني', symbol: 'ر.ي', code: 'YER' },
} as const;

export interface Category {
  id: number;
  name: string;
  nameEn?: string;
  image?: string;
  sortOrder: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  token: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  notes: string;
  items: CartItem[];
  total: number;
  totalSar?: number;
  totalYer?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export const SOCIAL_PLATFORMS: Record<string, { label: string; icon: string }> = {
  instagram: { label: 'انستقرام', icon: 'instagram' },
  facebook: { label: 'فيسبوك', icon: 'facebook' },
  tiktok: { label: 'تيك توك', icon: 'tiktok' },
  twitter: { label: 'تويتر', icon: 'twitter' },
  youtube: { label: 'يوتيوب', icon: 'youtube' },
  snapchat: { label: 'سناب شات', icon: 'snapchat' },
  telegram: { label: 'تيليجرام', icon: 'telegram' },
  whatsapp: { label: 'واتساب', icon: 'whatsapp' },
  pinterest: { label: 'بينتريست', icon: 'pinterest' },
  linkedin: { label: 'لينكد إن', icon: 'linkedin' },
};

export interface Settings {
  siteName: string;
  siteDescription: string;
  phone: string;
  whatsapp: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutText: string;
  address: string;
  email: string;
  exchangeRate: string;
  socialLinks: SocialLink[];
  gallery: string[];
}
