import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../../types';
import { CURRENCIES } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isFavorite } = useFavoritesStore();
  const img = product.images?.[0] || '/placeholder.svg';

  return (
    <div
      className="group card-modern overflow-hidden fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.hasOffer === 1 && (
            <span className="badge bg-gradient-to-r from-error to-red-500 text-white shadow-lg">
              عرض خاص
            </span>
          )}
          {product.bestSeller === 1 && (
            <span className="badge bg-gradient-to-r from-accent to-accent-dark text-primary-dark shadow-lg">
              الأكثر مبيعاً
            </span>
          )}
        </div>
        {product.oldPrice && (
          <span className="absolute top-3 left-3 badge bg-white/90 backdrop-blur-sm text-primary font-bold shadow-lg">
            {Math.round((1 - product.price / product.oldPrice) * 100)}% خصم
          </span>
        )}

        {/* Quick actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="flex-1 bg-white/95 backdrop-blur-sm text-primary font-bold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingCart size={16} /> أضف للسلة
          </button>
          <Link
            to={`/product/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl"
          >
            <Eye size={18} />
          </Link>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
          className={`absolute top-3 left-16 p-2 rounded-xl transition-all duration-300 ${
            isFavorite(product.id)
              ? 'bg-error text-white shadow-lg shadow-error/30'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white'
          }`}
        >
          <Heart size={16} className={isFavorite(product.id) ? 'fill-white' : ''} />
        </button>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          {product.categoryName && (
            <p className="text-[11px] uppercase tracking-wider text-primary/60 font-semibold mb-1">{product.categoryName}</p>
          )}
          <h3 className="font-bold text-sm mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-black text-lg">{product.price}</span>
            <span className="text-[10px] text-text-light font-medium">{CURRENCIES[product.currency]?.symbol || 'ر.س'}</span>
            {product.oldPrice && (
              <span className="text-text-light line-through text-xs">{product.oldPrice}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="w-9 h-9 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center hover:from-primary hover:to-primary-light hover:text-white transition-all text-primary"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
