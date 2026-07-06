import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Check, Send, User, Copy, ExternalLink } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { api } from '../lib/api';
import { CURRENCIES } from '../types';

const STORAGE_KEY = 'dunya_customer';

function loadCustomer() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveCustomer(data: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotals, clearCart } = useCartStore();
  const saved = loadCustomer();
  const [name, setName] = useState(saved.name || '');
  const [phone, setPhone] = useState(saved.phone || '');
  const [city, setCity] = useState(saved.city || '');
  const [address, setAddress] = useState(saved.address || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string; waUrl: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !city.trim()) {
      setError('يرجى إدخال الاسم والجوال والمدينة');
      return;
    }
    if (items.length === 0) {
      setError('السلة فارغة');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const settings = await api.getSettings();
      const totals = getTotals();
      const order = await api.createOrder({
        customerName: name,
        customerPhone: phone,
        city,
        address,
        notes,
        items: items.map((i) => ({ product: { id: i.product.id, name: i.product.name, price: i.product.price, images: i.product.images, currency: i.product.currency }, quantity: i.quantity })),
        total: totals.sar + totals.yer,
        totalSar: totals.sar,
        totalYer: totals.yer,
        whatsappNumber: settings.whatsapp,
        frontendUrl: window.location.origin,
      });
      saveCustomer({ name, phone, city, address });
      setDone({ orderNumber: order.orderNumber, waUrl: order.waUrl });
      clearCart();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const handleCopy = () => {
      navigator.clipboard.writeText(done.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    };
    return (
      <div className="max-w-lg mx-auto px-4 pt-28 pb-16">
        <Helmet><title>تم الطلب - دنيا العرائس</title><meta name="description" content="تم إرسال طلبك بنجاح" /></Helmet>
        <div className="scale-in">
          <div className="bg-gradient-to-br from-success/5 to-emerald-50 rounded-3xl p-6 md:p-10 text-center border border-success/10">
            <div className="w-20 h-20 bg-gradient-to-br from-success to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success/30">
              <Check size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black mb-2">تم إرسال الطلب</h2>

            <div className="bg-white rounded-2xl p-5 mb-6 border border-success/20">
              <p className="text-text-light text-sm mb-2">رقم الطلب</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-black text-primary text-2xl">{done.orderNumber}</span>
                <button onClick={handleCopy} className={`p-2 rounded-xl transition-all ${copied ? 'bg-success text-white' : 'bg-gray-100 text-gray-500 hover:bg-primary hover:text-white'}`} title="نسخ رقم الطلب">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 text-right leading-relaxed">
                <p className="font-bold mb-0.5">💡 لماذا أحفظ رقم الطلب؟</p>
                <p>رقم الطلب هو الوسيلة الوحيدة لمتابعة حالة طلبك وتعديله لاحقاً. احتفظ به لحين استلام الطلب. يمكنك أيضاً نسخ الرابط المخصص للعودة لطلباتك لاحقاً.</p>
              </div>
            </div>

            <p className="text-sm text-text-light mb-6">سيتم التواصل معك عبر واتساب لتأكيد الطلب ومناقشة التفاصيل</p>
            <a
              href={done.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent inline-flex items-center gap-3 mb-3 w-full justify-center text-lg py-4"
            >
              <Send size={20} /> فتح واتساب
            </a>
            <Link to={`/order/${done.orderNumber}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all">
              <ExternalLink size={18} /> متابعة حالة الطلب
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center pt-28 pb-20 px-4">
        <Helmet><title>سلة التسوق - دنيا العرائس</title><meta name="description" content="سلة التسوق الخاصة بك" /></Helmet>
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-black mb-2">السلة فارغة</h2>
        <p className="text-text-light mb-8">أضف بعض المنتجات الجميلة إلى سلتك</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-3 text-lg px-10 py-4">
          <ArrowLeft size={20} /> تسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16">
      <Helmet><title>سلة التسوق - دنيا العرائس</title><meta name="description" content="سلة التسوق الخاصة بك" /></Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-black mb-10">سلة التسوق</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="card-modern p-3 md:p-6 flex gap-3 md:gap-4 hover:shadow-xl transition-all">
                <img
                  src={item.product.images?.[0] || '/placeholder.svg'}
                  alt={item.product.name}
                  className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-xl md:rounded-2xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.id}`} className="font-bold text-sm md:text-base hover:text-primary transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-primary font-black text-sm md:text-lg mt-0.5 md:mt-1">{item.product.price} <span className="text-xs md:text-sm font-medium text-text-light">{CURRENCIES[item.product.currency]?.symbol || 'ر.س'}</span></p>
                  <div className="flex items-center justify-between mt-2 md:mt-4">
                    <div className="flex items-center bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 md:p-2 hover:bg-gray-100 transition-all rounded-r-xl md:rounded-r-2xl">
                        <Minus size={14} />
                      </button>
                      <span className="px-2 md:px-4 font-bold text-xs md:text-sm min-w-[2rem] md:min-w-[2.5rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 md:p-2 hover:bg-gray-100 transition-all rounded-l-xl md:rounded-l-2xl">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <p className="font-black text-primary text-sm md:text-base">{item.product.price * item.quantity} <span className="text-xs md:text-sm font-medium text-text-light">{CURRENCIES[item.product.currency]?.symbol || 'ر.س'}</span></p>
                      <button onClick={() => removeItem(item.product.id)} className="p-1.5 md:p-2 text-error/60 hover:text-error hover:bg-error/5 rounded-lg md:rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="card-modern p-4 md:p-8 sticky top-28 space-y-4 md:space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-black">معلومات الطلب</h3>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-5 text-center space-y-2">
                <p className="text-text-light text-sm">الإجمالي</p>
                {getTotals().sar > 0 && <p className="text-3xl font-black text-primary">{getTotals().sar.toLocaleString()} <span className="text-lg font-medium">{CURRENCIES.sar.symbol}</span></p>}
                {getTotals().yer > 0 && <p className="text-3xl font-black text-primary">{getTotals().yer.toLocaleString()} <span className="text-lg font-medium">{CURRENCIES.yer.symbol}</span></p>}
              </div>

              <div className="space-y-4">
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم *" className="input-field" />
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال *" className="input-field" dir="ltr" />
                <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة *" className="input-field" />
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="العنوان (اختياري)" className="input-field" />
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات (اختياري)" className="input-field" rows={3} />
              </div>

              <p className="text-[11px] text-text-light/60 text-center -mb-2">
                سيتم حفظ بياناتك تلقائياً للطلبات القادمة
              </p>

              {error && <p className="text-error text-sm bg-error/5 p-3 rounded-xl">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-accent w-full text-lg py-4 flex items-center justify-center gap-3">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري الإرسال...
                  </span>
                ) : (
                  <><Send size={20} /> إرسال الطلب عبر واتساب</>
                )}
              </button>
              <p className="text-xs text-text-light text-center leading-relaxed">
                بعد الإرسال سيتم توجيهك إلى واتساب لإكمال الطلب<br />
                الدفع والتوصيل يتم الاتفاق عليها عبر واتساب
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
