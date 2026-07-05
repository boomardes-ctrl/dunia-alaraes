import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingCart, Share2, Minus, Plus, ChevronRight, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Product } from '../types';
import { CURRENCIES } from '../types';
import ProductGrid from '../components/products/ProductGrid';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [currentImg, setCurrentImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isFavorite } = useFavoritesStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api.getProduct(Number(id)).then((data) => {
      setProduct(data);
      setSimilar(data.similar || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded-full w-1/4" />
            <div className="h-10 bg-gray-200 rounded-full w-3/4" />
            <div className="h-8 bg-gray-200 rounded-full w-1/3" />
            <div className="h-24 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={40} className="text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-400 mb-6">المنتج غير موجود</p>
        <Link to="/products" className="btn-primary inline-block">العودة للمنتجات</Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="pt-24">
      <Helmet><title>{product?.name || 'المنتج'} - دنيا العرائس</title><meta name="description" content={product?.description || 'تفاصيل المنتج'} /></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-light mb-8">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:text-primary transition-colors">المنتجات</Link>
          {product.categoryName && (
            <>
              <ChevronRight size={14} />
              <Link to={`/products?category=${product.categoryId}`} className="hover:text-primary transition-colors">{product.categoryName}</Link>
            </>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl">
              <img
                src={product.images[currentImg] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      i === currentImg ? 'border-primary shadow-lg shadow-primary/20' : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            {product.categoryName && (
              <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-1.5 mb-4 w-fit">
                <span className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-primary font-bold text-sm">{product.categoryName}</span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-black mb-3">{product.name}</h1>
            {product.nameEn && <p className="text-text-light mb-4 text-sm">{product.nameEn}</p>}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl md:text-5xl font-black text-primary">{product.price}</span>
              <span className="text-text-light font-medium">{CURRENCIES[product.currency]?.symbol || 'ر.س'}</span>
              {product.oldPrice && (
                <>
                  <span className="text-text-light line-through text-xl">{product.oldPrice} {CURRENCIES[product.currency]?.symbol || 'ر.س'}</span>
                  <span className="badge bg-error/10 text-error">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {product.brand && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-text-light font-medium">الماركة:</span>
                <span className="font-bold bg-gray-100 px-3 py-1 rounded-xl text-sm">{product.brand}</span>
              </div>
            )}

            <div className="border-t border-b border-gray-100 py-6 my-6">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {!product.inStock && (
              <div className="bg-error/5 rounded-2xl p-4 mb-6">
                <p className="text-error font-bold text-center">المنتج غير متوفر حالياً</p>
              </div>
            )}

            {product.inStock && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-bold">الكمية:</span>
                  <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100 transition-all rounded-r-2xl">
                      <Minus size={18} />
                    </button>
                    <span className="px-6 font-black text-lg min-w-[3rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-100 transition-all rounded-l-2xl">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAdd}
                    className={`flex-1 btn-primary flex items-center justify-center gap-3 text-lg py-4 ${
                      added ? 'bg-gradient-to-r from-success to-emerald-500' : ''
                    }`}
                  >
                    {added ? <><Check size={22} /> تمت الإضافة</> : <><ShoppingCart size={22} /> أضف إلى السلة</>}
                  </button>
                  <button
                    onClick={() => toggle(product.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isFavorite(product.id)
                        ? 'border-error bg-error/5 text-error'
                        : 'border-gray-200 hover:border-primary/30 text-gray-400 hover:text-primary'
                    }`}
                  >
                    <Heart size={22} className={isFavorite(product.id) ? 'fill-error' : ''} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-4 rounded-2xl border-2 border-gray-200 hover:border-primary/30 text-gray-400 hover:text-primary transition-all"
                  >
                    <Share2 size={22} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={20} className="text-primary" />
              </div>
              <h2 className="text-2xl font-black">منتجات مشابهة</h2>
            </div>
            <ProductGrid products={similar} />
          </section>
        )}
      </div>
    </div>
  );
}
