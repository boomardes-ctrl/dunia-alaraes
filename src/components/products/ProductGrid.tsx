import ProductCard from './ProductCard';
import type { Product } from '../../types';

interface Props {
  products: Product[];
  loading?: boolean;
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card-modern animate-pulse overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-gray-200 rounded-full w-1/3" />
            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
            <div className="h-5 bg-gray-200 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid({ products, loading }: Props) {
  if (loading) return <Skeleton />;

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 009.586 13H7" />
          </svg>
        </div>
        <p className="text-xl font-bold text-gray-400">لا توجد منتجات</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
