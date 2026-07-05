import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';
import type { Order } from '../types';

const statusConfig: Record<string, { color: string; icon: string }> = {
  'جديد': { color: 'bg-blue-500', icon: '📋' },
  'قيد المراجعة': { color: 'bg-yellow-500', icon: '⏳' },
  'تم قبول الطلب': { color: 'bg-green-500', icon: '✅' },
  'جاري التجهيز': { color: 'bg-purple-500', icon: '📦' },
  'تم التسليم': { color: 'bg-emerald-500', icon: '🎉' },
  'مرفوض': { color: 'bg-red-500', icon: '❌' },
  'ملغي': { color: 'bg-gray-500', icon: '🚫' },
};

export default function OrderStatus() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const orders = await api.getOrders({ search: orderNumber });
      if (orders.length === 0) {
        setError('الطلب غير موجود');
      } else {
        setOrder(orders[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-28 pb-16">
      <Helmet><title>متابعة الطلب - دنيا العرائس</title><meta name="description" content="تابعي حالة طلبك" /></Helmet>
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-2">متابعة الطلب</h1>
        <p className="text-text-light">أدخلي رقم الطلب لمعرفة حالته</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="رقم الطلب (مثال: ds-1)"
          className="input-field text-sm"
        />
        <button type="submit" disabled={loading} className="btn-primary px-6">
          {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Search size={20} />}
        </button>
      </form>

      {error && <p className="text-error text-center bg-error/5 p-4 rounded-2xl">{error}</p>}

      {order && (
        <div className="scale-in">
          <div className="card-modern p-8 text-center">
            <div className="text-6xl mb-4">{statusConfig[order.status]?.icon || '📋'}</div>
            <p className="text-text-light mb-2">رقم الطلب</p>
            <p className="text-2xl font-black mb-6">{order.orderNumber}</p>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold ${statusConfig[order.status]?.color || 'bg-gray-500'}`}>
              <span>{order.status}</span>
            </div>
            <div className="mt-6 text-sm text-text-light">
              <p>تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
