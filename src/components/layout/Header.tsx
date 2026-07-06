import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X, Settings, Tag, ClipboardList } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import type { Settings as SiteSettings } from '../../types';
import SearchBar from '../products/SearchBar';

interface Props {
  settings: SiteSettings | null;
}

export default function Header({ settings }: Props) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const isHome = location.pathname === '/';

  useEffect(() => {
    setScrolled(window.scrollY > 20 || !isHome);
    const handleScroll = () => setScrolled(window.scrollY > 20 || !isHome);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const textColor = scrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white';
  const iconColor = scrolled ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white';
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`p-1.5 rounded-xl shadow-md transition-all ${scrolled ? 'bg-white' : 'bg-white/30 backdrop-blur-md'}`}>
              <img
                src={settings?.logo || '/logo.png'}
                alt={settings?.siteName || 'دنيا العرائس'}
                className="h-9 w-auto"
              />
            </div>
            <img src="/name.png" alt={settings?.siteName || 'دنيا العرائس'} className="h-9 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`relative font-semibold transition-all hover:scale-105 ${textColor}`}>
              الرئيسية
            </Link>
            <Link to="/products" className={`relative font-semibold transition-all hover:scale-105 ${textColor}`}>
              المنتجات
            </Link>
            <Link to="/products?hasOffer=1" className={`relative font-semibold transition-all hover:scale-105 ${textColor} flex items-center gap-1.5`}>
              <Tag size={14} className="text-accent" />
              العروض
            </Link>
            <Link to="/order" className={`relative font-semibold transition-all hover:scale-105 ${textColor} flex items-center gap-1.5`}>
              <ClipboardList size={14} />
              متابعة طلبي
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2.5 rounded-xl transition-all ${iconColor}`}
            >
              <Search size={20} />
            </button>
            <Link to="/favorites" className={`p-2.5 rounded-xl transition-all relative ${iconColor}`}>
              <Heart size={20} />
            </Link>
            <Link to="/cart" className={`p-2.5 rounded-xl transition-all relative ${iconColor}`}>
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-accent to-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            {scrolled && (
              <Link to="/admin" className="p-2.5 rounded-xl transition-all text-primary/50 hover:text-primary hover:bg-primary/5" title="لوحة الإدارة">
                <Settings size={18} />
              </Link>
            )}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className={`md:hidden p-2.5 rounded-xl transition-all ${iconColor}`}
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="pb-6 fade-in-fast">
            <div className="bg-white rounded-2xl shadow-2xl p-2">
              <SearchBar />
            </div>
          </div>
        )}

        {mobileMenu && (
          <div className="md:hidden pb-6 fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-3">
              {[
                { to: '/', label: 'الرئيسية' },
                { to: '/products', label: 'المنتجات' },
                { to: '/products?hasOffer=1', label: 'العروض' },
                { to: '/order', label: 'متابعة طلبي' },
                { to: '/favorites', label: 'المفضلة' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
