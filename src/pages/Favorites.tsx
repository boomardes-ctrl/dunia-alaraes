import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Product } from '../types';
import ProductGrid from '../components/products/ProductGrid';

export default function Favorites() {
  const { ids } = useFavoritesStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    api.getProducts().then((all) => {
      setProducts(all.filter((p: Product) => ids.includes(p.id)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [ids]);

  if (ids.length === 0) {
    return (
      <div className="text-center pt-28 pb-20 px-4">
        <Helmet><title>المفضلة - دنيا العرائس</title></Helmet>
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Heart size={48} className="text-pink-400" />
        </div>
        <h2 className="text-3xl font-black mb-2">المفضلة فارغة</h2>
        <p className="text-text-light mb-8">أضف منتجاتك المفضلة هنا</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-3 text-lg px-10 py-4">
          <ArrowLeft size={20} /> تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16">
      <Helmet><title>المفضلة - دنيا العرائس</title><meta name="description" content="منتجاتك المفضلة" /></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center">
            <Heart size={20} className="text-pink-500" />
          </div>
          <h1 className="text-3xl font-black">المفضلة</h1>
          <span className="text-text-light text-sm mr-2">({products.length} منتج)</span>
        </div>
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}
