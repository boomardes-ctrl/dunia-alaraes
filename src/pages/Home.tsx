import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, TrendingUp, Tag, Star, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import type { Product, Settings } from '../types';
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

function GallerySlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  const goTo = useCallback((i: number) => setCurrent(Math.max(0, Math.min(i, images.length - 1))), [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') goTo(current + 1); if (e.key === 'ArrowRight') goTo(current - 1); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white/5"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
        }}
      >
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
          {images.map((url, i) => (
            <div key={i} className="min-w-full">
              <img src={url} alt="" className="w-full aspect-[4/3] object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {images.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-accent' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroRef, heroInView] = useInView();
  const [featRef, featInView] = useInView();
  const [bestRef, bestInView] = useInView();
  const [offersRef, offersInView] = useInView();

  useEffect(() => {
    Promise.all([
      api.getProducts({ featured: '1' }),
      api.getProducts({ bestSeller: '1' }),
      api.getProducts({ hasOffer: '1' }),
      api.getSettings(),
    ]).then(([feat, best, offer, sett]) => {
      setProducts(feat);
      setBestSellers(best);
      setOffers(offer);
      setSettings(sett);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet><title>{settings?.siteName || 'دنيا العرائس'} - المتجر الأول للعطور والتجميل</title><meta name="description" content={settings?.siteDescription || 'متجر متخصص في بيع العطور ومستحضرات التجميل والإكسسوارات النسائية'} /></Helmet>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-primary via-primary-dark to-[#2D0A18]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-glow bg-accent -top-20 -right-20" />
          <div className="hero-glow bg-pink-500 -bottom-20 -left-20" />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent/30 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className={`max-w-2xl transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-6">
              <Sparkles size={14} className="text-accent" />
              <span className="text-white/80 text-xs md:text-sm font-medium">متجر العطور ومستحضرات التجميل</span>
            </div>
            <img src="/name.png" alt={settings?.siteName || 'دنيا العرائس'} className="h-14 md:h-20 lg:h-28 w-auto mb-2 md:mb-5" />
            <p className="text-sm md:text-xl text-white/70 mb-4 md:mb-10 leading-relaxed max-w-lg">
              {settings?.heroSubtitle || 'اكتشف عالم من الجمال والأناقة مع أحدث منتجات العطور ومستحضرات التجميل'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/products" className="bg-gradient-to-r from-accent to-accent-dark text-primary-dark font-black px-6 py-3.5 md:px-8 md:py-4 rounded-2xl hover:shadow-2xl hover:shadow-accent/30 hover:scale-105 transition-all text-sm md:text-lg inline-flex items-center justify-center gap-3">
                تسوق الآن <ArrowLeft size={18} />
              </Link>
              <Link to="/products?hasOffer=1" className="glass text-white font-bold px-6 py-3.5 md:px-8 md:py-4 rounded-2xl hover:bg-white/20 transition-all text-sm md:text-lg inline-flex items-center justify-center gap-3">
                <Tag size={16} /> العروض
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      {/* Gallery */}
      {settings && settings.gallery && settings.gallery.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <GallerySlider images={settings.gallery} />
          </div>
        </section>
      )}
    </div>
  );
}
