import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';
import type { Order } from '../types';
import { CURRENCIES } from '../types';

export default function CartView() {
  const { token } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.getOrderByToken(token).then(setOrder).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="pt-28 text-center">
        <Helmet><title>عرض الطلب - دنيا العرائس</title></Helmet>
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-28 text-center px-4">
        <Helmet><title>الطلب غير موجود - دنيا العرائس</title></Helmet>
        <p className="text-xl text-text-light">{error || 'الطلب غير موجود'}</p>
        <Link to="/" className="btn-primary inline-block mt-6">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16">
      <Helmet><title>طلب {order.orderNumber} - دنيا العرائس</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="card-modern p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
              <ShoppingBag size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black">طلب رقم {order.orderNumber}</h1>
              <p className="text-text-light text-sm">رابط الطلب الخاص</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 rounded-2xl mb-8">
            <div><span className="text-text-light text-sm">الاسم:</span> <p className="font-bold">{order.customerName}</p></div>
            <div><span className="text-text-light text-sm">الجوال:</span> <p className="font-bold" dir="ltr">{order.customerPhone}</p></div>
            <div><span className="text-text-light text-sm">المدينة:</span> <p className="font-bold">{order.city}</p></div>
            {order.address && <div><span className="text-text-light text-sm">العنوان:</span> <p className="font-bold">{order.address}</p></div>}
            {order.notes && <div className="col-span-2"><span className="text-text-light text-sm">ملاحظات:</span> <p>{order.notes}</p></div>}
          </div>

          <h3 className="font-bold text-lg mb-4">المنتجات</h3>
          <div className="space-y-3">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl">
                <img src={item.product.images?.[0] || '/placeholder.svg'} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl" />
                <div className="flex-1">
                  <p className="font-bold">{item.product.name}</p>
                  <p className="text-sm text-text-light">{item.product.price} {CURRENCIES[item.product.currency as 'sar' | 'yer']?.symbol || 'ر.س'} × {item.quantity}</p>
                </div>
                <p className="font-black text-primary">{item.product.price * item.quantity} {CURRENCIES[item.product.currency as 'sar' | 'yer']?.symbol || 'ر.س'}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-text-light">الإجمالي</p>
            <div className="text-left">
              {order.totalSar! > 0 && <p className="text-2xl font-black text-primary">{order.totalSar} {CURRENCIES.sar.symbol}</p>}
              {order.totalYer! > 0 && <p className="text-2xl font-black text-primary">{order.totalYer} {CURRENCIES.yer.symbol}</p>}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-text-light mb-2">
            الحالة:{' '}
            <span className="font-bold text-primary bg-primary/5 px-4 py-1.5 rounded-full text-sm">{order.status}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
