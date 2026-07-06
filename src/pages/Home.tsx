import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, TrendingUp, Tag, Star, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import type { Product, Category, Settings } from '../types';
import ProductGrid from '../components/products/ProductGrid';

function useInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

function SectionHeader({ title, link, icon: Icon }: { title: string; link: string; icon?: any }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
            <Icon size={20} className="text-primary" />
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-black">{title}</h2>
      </div>
      <Link to={link} className="group flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-light transition-all">
        عرض الكل
        <span className="w-8 h-8 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowLeft size={14} />
        </span>
      </Link>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroRef, heroInView] = useInView();
  const [featRef, featInView] = useInView();
  const [bestRef, bestInView] = useInView();
  const [offersRef, offersInView] = useInView();
  const [catsRef, catsInView] = useInView();

  useEffect(() => {
    Promise.all([
      api.getProducts({ featured: '1' }),
      api.getProducts({ bestSeller: '1' }),
      api.getProducts({ hasOffer: '1' }),
      api.getCategories(),
      api.getBrands(),
      api.getSettings(),
    ]).then(([feat, best, offer, cats, brs, sett]) => {
      setProducts(feat);
      setBestSellers(best);
      setOffers(offer);
      setCategories(cats);
      setBrands(brs);
      setSettings(sett);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet><title>{settings?.siteName || 'دنيا العرائس'} - المتجر الأول للعطور والتجميل</title><meta name="description" content={settings?.siteDescription || 'متجر متخصص في بيع العطور ومستحضرات التجميل والإكسسوارات النسائية'} /></Helmet>
      {/* Hero Section - Modern Fullscreen */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#2D0A18]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-glow bg-accent -top-20 -right-20" />
          <div className="hero-glow bg-pink-500 -bottom-20 -left-20" />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent/30 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className={`max-w-2xl transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-4 md:mb-6">
              <Sparkles size={14} className="text-accent" />
              <span className="text-white/80 text-xs md:text-sm font-medium">متجر العطور ومستحضرات التجميل</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-4 md:mb-6">
              {settings?.heroTitle || 'دنيا العرائس'}
            </h1>
            <p className="text-base md:text-xl text-white/70 mb-8 md:mb-10 leading-relaxed max-w-lg">
              {settings?.heroSubtitle || 'اكتشفي عالم من الجمال والأناقة مع أحدث منتجات العطور ومستحضرات التجميل'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/products" className="bg-gradient-to-r from-accent to-accent-dark text-primary-dark font-black px-6 py-3.5 md:px-8 md:py-4 rounded-2xl hover:shadow-2xl hover:shadow-accent/30 hover:scale-105 transition-all text-base md:text-lg inline-flex items-center justify-center gap-3">
                تسوق الآن <ArrowLeft size={18} />
              </Link>
              <Link to="/products?hasOffer=1" className="glass text-white font-bold px-6 py-3.5 md:px-8 md:py-4 rounded-2xl hover:bg-white/20 transition-all text-base md:text-lg inline-flex items-center justify-center gap-3">
                <Tag size={16} /> العروض
              </Link>
            </div>
          </div>
        </div>
        {settings?.heroImage && (
          <img src={settings.heroImage} alt="" className="absolute left-0 top-0 h-full w-full md:w-1/2 object-cover opacity-10 md:opacity-20 pointer-events-none" />
        )}
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs font-medium">اسحبي للأسفل</span>
          <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section ref={catsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <SectionHeader title="الأقسام" link="/products" />
          <div className={`grid grid-cols-3 md:grid-cols-6 gap-4 transition-all duration-700 ${catsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="group card-modern p-5 text-center hover:border-primary/20"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:from-primary group-hover:to-accent/80 transition-all duration-300">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-xl" />
                  ) : (
                    <Sparkles size={22} className="text-primary group-hover:text-white transition-colors" />
                  )}
                </div>
                <span className="font-bold text-sm group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section ref={featRef} className="bg-white py-16 md:py-24">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-700 ${featInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <SectionHeader title="المنتجات المميزة" link="/products" icon={Star} />
            <ProductGrid products={products} loading={loading} />
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section ref={bestRef} className="py-16 md:py-24">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-700 ${bestInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <SectionHeader title="الأكثر مبيعاً" link="/products?bestSeller=1" icon={TrendingUp} />
            <ProductGrid products={bestSellers} />
          </div>
        </section>
      )}

      {/* Offers Banner & Products */}
      {offers.length > 0 && (
        <section ref={offersRef} className="py-16 md:py-24">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-700 ${offersInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-gradient-to-br from-error/5 via-error/10 to-primary/5 rounded-3xl p-8 md:p-12 mb-10 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-error/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-error/10 rounded-full px-4 py-2 mb-4">
                    <Tag size={14} className="text-error" />
                    <span className="text-error font-bold text-sm">عروض حصرية</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-2">خصومات مميزة</h2>
                  <p className="text-text-light">لا تفوتي الفرصة! عروض وخصومات على منتجات مختارة</p>
                </div>
                <Link to="/products?hasOffer=1" className="btn-primary shrink-0">
                  تسوق العروض
                </Link>
              </div>
            </div>
            <ProductGrid products={offers} />
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader title="الماركات" link="/products" />
            <div className="flex flex-wrap gap-3">
              {brands.map((brand) => (
                <Link
                  key={brand}
                  to={`/products?brand=${encodeURIComponent(brand)}`}
                  className="px-6 py-3 bg-gray-50 rounded-2xl hover:bg-gradient-to-r hover:from-primary hover:to-primary-light hover:text-white hover:shadow-xl hover:scale-105 transition-all font-bold text-sm border border-gray-100"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
