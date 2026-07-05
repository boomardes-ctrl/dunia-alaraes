import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Package, ShoppingCart, Tags, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import type { Order } from '../../types';
import { CURRENCIES } from '../../types';

interface Stats {
  products: number;
  orders: number;
  categories: number;
  revenueSar: number;
  revenueYer: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, categories: 0, revenueSar: 0, revenueYer: 0, pendingOrders: 0 });

  useEffect(() => {
    Promise.all([
      api.getProducts(),
      api.getOrders(),
      api.getCategories(),
      api.getOrders({ status: 'جديد' }),
    ]).then(([products, orders, categories, pending]) => {
      setStats({
        products: products.length,
        orders: orders.length,
        categories: categories.length,
        revenueSar: orders.reduce((sum: number, o: Order) => sum + (o.totalSar || (o.items?.some((i: any) => i.product?.currency === 'yer') ? 0 : o.total)), 0),
        revenueYer: orders.reduce((sum: number, o: Order) => sum + (o.totalYer || 0), 0),
        pendingOrders: pending.length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'المنتجات', value: stats.products, icon: Package, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'الطلبات', value: stats.orders, icon: ShoppingCart, gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { label: 'الأقسام', value: stats.categories, icon: Tags, gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
    {
      label: `مبيعات ${CURRENCIES.sar.symbol}`,
      value: `${stats.revenueSar.toLocaleString()} ${CURRENCIES.sar.symbol}`,
      icon: DollarSign, gradient: 'from-accent to-accent-dark', shadow: 'shadow-accent/20',
    },
    {
      label: `مبيعات ${CURRENCIES.yer.symbol}`,
      value: `${stats.revenueYer.toLocaleString()} ${CURRENCIES.yer.symbol}`,
      icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20',
    },
    { label: 'طلبات جديدة', value: stats.pendingOrders, icon: Clock, gradient: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
  ];

  return (
    <div className="space-y-8">
      <Helmet><title>لوحة التحكم - دنيا العرائس</title></Helmet>
      <div>
        <h1 className="text-3xl font-black">لوحة التحكم</h1>
        <p className="text-text-light mt-1">نظرة عامة على متجرك</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-black leading-tight">{card.value}</p>
            <p className="text-xs text-text-light mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-4">آخر الطلبات</h3>
          <LastOrders />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin/products', label: 'إدارة المنتجات', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
              { to: '/admin/categories', label: 'إدارة الأقسام', icon: Tags, color: 'text-purple-600', bg: 'bg-purple-50' },
              { to: '/admin/orders', label: 'عرض الطلبات', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { to: '/admin/settings', label: 'إعدادات الموقع', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((link) => (
              <a key={link.to} href={link.to} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-50 hover:border-gray-200 hover:shadow-md transition-all group">
                <div className={`p-2.5 rounded-xl ${link.bg} ${link.color} group-hover:scale-110 transition-transform`}>
                  <link.icon size={18} />
                </div>
                <span className="font-bold text-sm">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LastOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.getOrders().then((data) => setOrders(data.slice(0, 5))).catch(() => {});
  }, []);

  if (orders.length === 0) {
    return <p className="text-text-light text-sm text-center py-8">لا توجد طلبات بعد</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <a key={order.id} href="/admin/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all group">
          <div>
            <p className="font-bold text-sm group-hover:text-primary transition-colors">{order.orderNumber}</p>
            <p className="text-xs text-text-light">{order.customerName}</p>
          </div>
          <div className="text-left">
            {order.totalSar! > 0 && <p className="text-xs font-bold">{order.totalSar} {CURRENCIES.sar.symbol}</p>}
            {order.totalYer! > 0 && <p className="text-xs font-bold">{order.totalYer} {CURRENCIES.yer.symbol}</p>}
          </div>
        </a>
      ))}
    </div>
  );
}
