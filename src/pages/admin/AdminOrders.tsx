import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Eye, CheckCircle, XCircle, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import type { Order } from '../../types';
import { CURRENCIES } from '../../types';

const statuses = ['جديد', 'قيد المراجعة', 'تم قبول الطلب', 'جاري التجهيز', 'تم التسليم', 'مرفوض', 'ملغي'];

const statusColors: Record<string, string> = {
  'جديد': 'bg-blue-100 text-blue-800 border-blue-200',
  'قيد المراجعة': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'تم قبول الطلب': 'bg-green-100 text-green-800 border-green-200',
  'جاري التجهيز': 'bg-purple-100 text-purple-800 border-purple-200',
  'تم التسليم': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'مرفوض': 'bg-red-100 text-red-800 border-red-200',
  'ملغي': 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = (q?: string, s?: string) => {
    const params: Record<string, string> = {};
    if (q) params.search = q;
    if (s) params.status = s;
    api.getOrders(params).then(setOrders).catch(() => showToast('error', 'فشل تحميل الطلبات'));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search, filterStatus);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdating(id);
    setOpenDropdown(null);
    try {
      await api.updateOrderStatus(id, newStatus);
      await load(search, filterStatus);
      showToast('success', 'تم تحديث الحالة');
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch {
      showToast('error', 'فشل تحديث الحالة');
    } finally {
      setUpdating(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA') + ' ' + d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/cart/${token}`;
    navigator.clipboard.writeText(link).then(() => showToast('success', 'تم نسخ الرابط'));
  };

  return (
    <div>
      <Helmet><title>إدارة الطلبات - دنيا العرائس</title></Helmet>
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-2 fade-in ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">إدارة الطلبات</h1>
        <span className="text-sm text-text-light bg-gray-100 px-3 py-1.5 rounded-xl font-bold">{orders.length} طلب</span>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم الطلب أو الاسم أو الجوال..."
          className="input-field flex-1 min-w-[200px]"
        />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); load(search, e.target.value); }} className="input-field w-auto">
          <option value="">جميع الحالات</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn-primary px-4"><Search size={18} /></button>
      </form>

      {/* Desktop: Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80">
                <th className="p-4 text-right font-bold text-text-light">رقم الطلب</th>
                <th className="p-4 text-right font-bold text-text-light">العميل</th>
                <th className="p-4 text-right font-bold text-text-light">المبلغ</th>
                <th className="p-4 text-right font-bold text-text-light">الحالة</th>
                <th className="p-4 text-right font-bold text-text-light">الوقت</th>
                <th className="p-4 text-right font-bold text-text-light">رابط الطلب</th>
                <th className="p-4 text-right font-bold text-text-light"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-text-light">لا توجد طلبات</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                  <td className="p-4 font-bold text-primary">{o.orderNumber}</td>
                  <td className="p-4">
                    <p className="font-bold">{o.customerName}</p>
                    <p className="text-xs text-text-light" dir="ltr">{o.customerPhone}</p>
                  </td>
                  <td className="p-4 font-bold">
                    {o.totalSar! > 0 && <span>{o.totalSar} {CURRENCIES.sar.symbol}</span>}
                    {o.totalYer! > 0 && <span> {o.totalYer} {CURRENCIES.yer.symbol}</span>}
                  </td>
                  <td className="p-4 relative">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === o.id ? null : o.id)}
                        disabled={updating === o.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          statusColors[o.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                        } ${updating === o.id ? 'opacity-50' : 'cursor-pointer hover:shadow-md'}`}
                      >
                        {updating === o.id ? 'جاري...' : o.status}
                        <ChevronDown size={12} />
                      </button>
                      {openDropdown === o.id && (
                        <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 min-w-[140px]">
                          {statuses.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(o.id, s)}
                              className={`w-full text-right px-4 py-2 text-xs font-bold hover:bg-gray-50 transition-all ${
                                s === o.status ? 'text-primary' : 'text-gray-700'
                              }`}
                            >
                              {s === o.status ? '✓ ' : ''}{s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-text-light text-xs whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                  <td className="p-4">
                    {o.token ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyLink(o.token)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-primary"
                        >
                          <Copy size={14} />
                        </button>
                        <a
                          href={`${window.location.origin}/cart/${o.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-gray-400 hover:text-blue-600"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ) : <span className="text-text-light text-xs">—</span>}
                  </td>
                  <td className="p-4">
                    <button onClick={() => setSelectedOrder(o)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all hover:shadow-sm"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-text-light">لا توجد طلبات</p>
          </div>
        ) : orders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 fade-in">
            <div className="flex items-center justify-between">
              <span className="font-black text-primary">{o.orderNumber}</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColors[o.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {o.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">{o.customerName}</span>
              <span className="text-text-light text-xs" dir="ltr">{o.customerPhone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-black text-primary">
                {o.totalSar! > 0 && <span>{o.totalSar} {CURRENCIES.sar.symbol} </span>}
                {o.totalYer! > 0 && <span>{o.totalYer} {CURRENCIES.yer.symbol}</span>}
              </span>
              <span className="text-xs text-text-light">{formatDateTime(o.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2">
                {o.token && (
                  <>
                    <button onClick={() => copyLink(o.token)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-primary" title="نسخ الرابط">
                      <Copy size={14} />
                    </button>
                    <a href={`${window.location.origin}/cart/${o.token}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-gray-400 hover:text-blue-600" title="فتح الرابط">
                      <ExternalLink size={14} />
                    </a>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  disabled={updating === o.id}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 font-bold"
                >
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setSelectedOrder(o)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-xl transition-all" title="عرض التفاصيل">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black">طلب {selectedOrder.orderNumber}</h2>
                <p className="text-xs text-text-light mt-0.5">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><XCircle size={18} /></button>
            </div>
            <div className="space-y-4">
              {selectedOrder.token && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl text-xs">
                  <span className="text-text-light">الرابط:</span>
                  <a href={`${window.location.origin}/cart/${selectedOrder.token}`} target="_blank" rel="noopener noreferrer" className="text-primary font-bold truncate hover:underline">
                    {window.location.origin}/cart/${selectedOrder.token}
                  </a>
                  <button
                    onClick={() => copyLink(selectedOrder.token)}
                    className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-primary"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl text-sm">
                <div><span className="text-text-light block text-xs">الاسم</span><span className="font-bold">{selectedOrder.customerName}</span></div>
                <div><span className="text-text-light block text-xs">الجوال</span><span className="font-bold" dir="ltr">{selectedOrder.customerPhone}</span></div>
                <div><span className="text-text-light block text-xs">المدينة</span><span className="font-bold">{selectedOrder.city}</span></div>
                {selectedOrder.address && <div><span className="text-text-light block text-xs">العنوان</span><span className="font-bold">{selectedOrder.address}</span></div>}
                {selectedOrder.notes && <div className="col-span-2"><span className="text-text-light block text-xs">ملاحظات</span><span className="font-bold">{selectedOrder.notes}</span></div>}
              </div>
              <div className="space-y-2">
                <p className="font-bold text-sm">المنتجات</p>
                {selectedOrder.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl">
                    <img src={item.product.images?.[0] || '/placeholder.svg'} alt="" className="w-14 h-14 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.product.name}</p>
                      <p className="text-text-light text-xs mt-0.5">{item.product.price} {CURRENCIES[item.product.currency as 'sar' | 'yer']?.symbol || 'ر.س'} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">{item.product.price * item.quantity} {CURRENCIES[item.product.currency as 'sar' | 'yer']?.symbol || 'ر.س'}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-sm text-text-light">الإجمالي</p>
                <div className="text-left">
                  {selectedOrder.totalSar! > 0 && <p className="text-xl font-black text-primary">{selectedOrder.totalSar} {CURRENCIES.sar.symbol}</p>}
                  {selectedOrder.totalYer! > 0 && <p className="text-xl font-black text-primary">{selectedOrder.totalYer} {CURRENCIES.yer.symbol}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">تحديث الحالة</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder.id, s)}
                      disabled={updating === selectedOrder.id}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        s === selectedOrder.status
                          ? statusColors[s] + ' ring-2 ring-offset-1'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      } ${updating === selectedOrder.id ? 'opacity-50' : 'cursor-pointer'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
