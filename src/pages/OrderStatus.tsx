import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ShoppingBag, Check, Copy, ExternalLink, Phone, MapPin, User, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { Order } from '../types';
import { CURRENCIES } from '../types';

const statusFlow = ['جديد', 'قيد المراجعة', 'تم قبول الطلب', 'جاري التجهيز', 'تم التسليم'];
const statusColors: Record<string, string> = {
  'جديد': 'bg-blue-500', 'قيد المراجعة': 'bg-yellow-500', 'تم قبول الطلب': 'bg-green-500',
  'جاري التجهيز': 'bg-purple-500', 'تم التسليم': 'bg-emerald-500', 'مرفوض': 'bg-red-500', 'ملغي': 'bg-gray-500',
};
const statusLabels: Record<string, string> = {
  'جديد': 'تم استلام الطلب', 'قيد المراجعة': 'جاري المراجعة', 'تم قبول الطلب': 'تم قبول الطلب',
  'جاري التجهيز': 'جاري تجهيز الطلب', 'تم التسليم': 'تم تسليم الطلب',
};

function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = statusFlow.indexOf(currentStatus);
  const isRejected = currentStatus === 'مرفوض' || currentStatus === 'ملغي';
  return (
    <div className="relative">
      {isRejected ? (
        <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
          <span className="text-2xl">{currentStatus === 'مرفوض' ? '❌' : '🚫'}</span>
          <span className="font-bold text-red-700">{currentStatus === 'مرفوض' ? 'تم رفض الطلب' : 'تم إلغاء الطلب'}</span>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute right-[11px] top-3 bottom-3 w-0.5 bg-gray-200 rounded-full" />
          <div className="space-y-0">
            {statusFlow.map((s, i) => {
              const isPast = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={s} className={`flex items-start gap-4 pb-6 ${!isPast ? 'opacity-40' : ''}`}>
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''
                  } ${isPast ? statusColors[s] : 'bg-gray-200'}`}>
                    {isPast && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`font-bold text-sm ${isCurrent ? 'text-primary' : ''}`}>{statusLabels[s]}</p>
                    {isCurrent && (
                      <p className="text-xs text-text-light mt-0.5 flex items-center gap-1">
                        <Clock size={11} /> الحالة الحالية
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderStatus() {
  const { orderNumber: paramNumber } = useParams();
  const [orderNumber, setOrderNumber] = useState(paramNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paramNumber) {
      setOrderNumber(paramNumber);
      searchOrder(paramNumber);
    }
  }, [paramNumber]);

  const searchOrder = async (q?: string) => {
    const query = q || orderNumber;
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const order = await api.trackOrder(query);
      setOrder(order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder();
  };

  const handleCopy = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-16">
      <Helmet><title>متابعة الطلب - دنيا العرائس</title><meta name="description" content="تابع حالة طلبك" /></Helmet>
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <ShoppingBag size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">متابعة الطلب</h1>
          <p className="text-text-light">أدخل رقم الطلب لمتابعة حالته أو تعديله</p>
        </div>

        {/* Search */}
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

        {error && (
          <div className="text-center mb-6">
            <p className="inline-flex items-center gap-2 bg-error/5 text-error px-6 py-3 rounded-2xl font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-5">
            {/* Status Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-lg">حالة الطلب</h2>
                <span className={`px-3 py-1.5 rounded-full text-white text-xs font-bold ${statusColors[order.status] || 'bg-gray-500'}`}>
                  {order.status}
                </span>
              </div>
              <OrderTimeline currentStatus={order.status} />
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg">رقم الطلب</h2>
                <div className="flex items-center gap-2">
                  <span className="font-black text-primary text-xl">{order.orderNumber}</span>
                  <button onClick={handleCopy} className={`p-2 rounded-xl transition-all ${copied ? 'bg-success text-white' : 'bg-gray-100 text-gray-500 hover:bg-primary hover:text-white'}`} title="نسخ رقم الطلب">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed mb-4">
                <p className="font-bold mb-0.5">💡 نصيحة</p>
                <p>احتفظ برقم الطلب لمتابعة حالتك. يمكنك أيضاً نسخ الرابط الخاص للعودة إليه لاحقاً.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl text-sm">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-text-light" />
                  <span className="font-bold">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-text-light" />
                  <span className="font-bold" dir="ltr">{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-text-light" />
                  <span className="font-bold">{order.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-light" />
                  <span className="font-bold text-xs">{new Date(order.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}</span>
                </div>
                {order.address && (
                  <div className="col-span-2 flex items-center gap-2">
                    <MapPin size={14} className="text-text-light" />
                    <span className="text-sm">{order.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-black text-lg mb-4">المنتجات</h2>
              <div className="space-y-3">
                {order.items.map((item: any, i: number) => {
                  const prod = item.product || item;
                  return (
                  <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl hover:border-primary/20 transition-all">
                    <img src={prod.images?.[0] || '/placeholder.svg'} alt={prod.name} className="w-16 h-16 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{prod.name}</p>
                      <p className="text-text-light text-xs mt-0.5">{prod.price} {CURRENCIES[prod.currency as 'sar' | 'yer']?.symbol || 'ر.س'} × {item.quantity}</p>
                    </div>
                    <p className="font-black text-primary text-sm">{prod.price * item.quantity} {CURRENCIES[prod.currency as 'sar' | 'yer']?.symbol || 'ر.س'}</p>
                  </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <p className="text-text-light">الإجمالي</p>
                <div className="text-left">
                  {order.totalSar! > 0 && <p className="text-xl font-black text-primary">{order.totalSar} {CURRENCIES.sar.symbol}</p>}
                  {order.totalYer! > 0 && <p className="text-xl font-black text-primary">{order.totalYer} {CURRENCIES.yer.symbol}</p>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {order.token && (
                <Link
                  to={`/cart/${order.token}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all text-sm"
                >
                  <ExternalLink size={18} /> عرض الرابط المخصص للطلب
                </Link>
              )}
              <p className="text-center text-xs text-text-light leading-relaxed">
                للتعديل على الطلب، تواصل معنا عبر واتساب وسنقوم بالتعديل
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}