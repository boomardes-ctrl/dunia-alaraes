import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Tag, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import type { Settings } from '../types';

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
  const [settings, setSettings] = useState<Settings | null>(null);
  const [heroRef, heroInView] = useInView();

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <div>
      <Helmet><title>{settings?.siteName || 'دنيا العرائس'} - المتجر الأول للعطور والتجميل</title><meta name="description" content={settings?.siteDescription || 'متجر متخصص في بيع العطور ومستحضرات التجميل والإكسسوارات النسائية'} /></Helmet>
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 lg:pt-0 lg:min-h-screen lg:flex lg:items-center pb-12 lg:pb-0 bg-gradient-to-br from-primary via-primary-dark to-[#2D0A18]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-glow bg-accent -top-20 -right-20" />
          <div className="hero-glow bg-pink-500 -bottom-20 -left-20" />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent/30 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className={`flex-1 max-w-2xl flex flex-col gap-4 md:gap-6 items-start transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-white/80 text-xs md:text-sm font-medium">متجر العطور ومستحضرات التجميل</span>
              </div>
              <img src="/name.png" alt={settings?.siteName || 'دنيا العرائس'} className="h-16 md:h-24 lg:h-32 w-auto" />
              <p className="text-sm md:text-xl text-white/70 leading-relaxed max-w-lg">
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
            {settings && settings.gallery && settings.gallery.length > 0 && (
              <GallerySlider images={settings.gallery} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
