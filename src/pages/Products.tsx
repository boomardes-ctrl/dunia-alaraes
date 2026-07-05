import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X } from 'lucide-react';
import { api } from '../lib/api';
import type { Product, Category } from '../types';
import SearchBar from '../components/products/SearchBar';
import ProductGrid from '../components/products/ProductGrid';

export default function Products() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(params.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(params.get('brand') || '');
  const [search, setSearch] = useState(params.get('search') || '');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedCat(params.get('category') || '');
    setSelectedBrand(params.get('brand') || '');
    setSearch(params.get('search') || '');
  }, [params]);

  useEffect(() => {
    setLoading(true);
    const q: Record<string, string> = {};
    if (selectedCat) q.category = selectedCat;
    if (selectedBrand) q.brand = selectedBrand;
    if (search) q.search = search;
    if (params.get('bestSeller')) q.bestSeller = '1';
    if (params.get('hasOffer')) q.hasOffer = '1';
    if (params.get('featured')) q.featured = '1';
    api.getProducts(q).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [selectedCat, selectedBrand, search, params]);

  const filtered = [...products];
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);

  const clearFilters = () => { setSelectedCat(''); setSelectedBrand(''); };

  return (
    <div className="pt-28 pb-16">
      <Helmet><title>المنتجات - دنيا العرائس</title><meta name="description" content="تصفحي مجموعة واسعة من العطور ومستحضرات التجميل والإكسسوارات النسائية" /></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">المنتجات</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Filters - Desktop */}
        <div className="hidden lg:flex flex-wrap items-center gap-3 mb-8">
          <button onClick={clearFilters} className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${!selectedCat && !selectedBrand ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 hover:bg-gray-200'}`}>
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(String(cat.id))}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${selectedCat === String(cat.id) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filters - Mobile */}
        {showFilters && (
          <div className="lg:hidden mb-6 fade-in-fast">
            <div className="bg-white rounded-2xl shadow-xl p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">تصفية حسب</span>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={clearFilters} className={`px-4 py-2 rounded-xl text-sm font-bold ${!selectedCat && !selectedBrand ? 'bg-primary text-white' : 'bg-gray-100'}`}>الكل</button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setSelectedCat(String(cat.id))}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${selectedCat === String(cat.id) ? 'bg-primary text-white' : 'bg-gray-100'}`}
                  >{cat.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Brands */}
        {brands.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedBrand === brand
                    ? 'bg-gradient-to-r from-accent to-accent-dark text-primary-dark shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {/* Sort & Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-text-light text-sm">
            <span className="font-bold text-primary">{filtered.length}</span> منتج
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field w-auto text-sm py-2.5"
          >
            <option value="newest">الأحدث</option>
            <option value="price-asc">السعر: الأقل أولاً</option>
            <option value="price-desc">السعر: الأعلى أولاً</option>
          </select>
        </div>

        <ProductGrid products={filtered} loading={loading} />
      </div>
    </div>
  );
}
