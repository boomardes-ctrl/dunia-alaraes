import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Product, Category } from '../../types';

interface ProductForm {
  name: string; nameEn: string; description: string; price: string; oldPrice: string;
  images: string[]; categoryId: string; featured: boolean; bestSeller: boolean;
  hasOffer: boolean; brand: string; inStock: boolean; currency: 'sar' | 'yer';
}

const emptyForm: ProductForm = {
  name: '', nameEn: '', description: '', price: '', oldPrice: '',
  images: [], categoryId: '', featured: false, bestSeller: false,
  hasOffer: false, brand: '', inStock: true, currency: 'sar',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()]).then(([p, c]) => {
      setProducts(p);
      setCategories(c);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      currency: form.currency,
    };
    if (editingId) {
      await api.updateProduct(editingId, data);
    } else {
      await api.createProduct(data);
    }
    const updated = await api.getProducts();
    setProducts(updated);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, nameEn: p.nameEn || '', description: p.description || '',
      price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : '',
      images: p.images, categoryId: p.categoryId ? String(p.categoryId) : '',
      featured: !!p.featured, bestSeller: !!p.bestSeller, hasOffer: !!p.hasOffer,
      brand: p.brand || '', inStock: !!p.inStock, currency: p.currency || 'sar',
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تأكيد الحذف؟')) return;
    await api.deleteProduct(id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await api.uploadImage(file);
    setForm({ ...form, images: [...form.images, res.url] });
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <Helmet><title>إدارة المنتجات - دنيا العرائس</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> إضافة منتج
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mt-8 mb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'تعديل منتج' : 'إضافة منتج'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم المنتج *" className="input-field" required />
                <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="الاسم بالإنجليزية" className="input-field" />
              </div>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="الوصف" className="input-field" rows={3} />
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-light mb-1">السعر ({form.currency === 'sar' ? 'ر.س' : 'ر.ي'})</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="السعر *" className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-light mb-1">السعر القديم</label>
                    <input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} placeholder="السعر القديم" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-light mb-1">العملة</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as 'sar' | 'yer' })} className="input-field">
                    <option value="sar">ريال سعودي</option>
                    <option value="yer">ريال يمني</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                  <option value="">بدون قسم</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="الماركة" className="input-field" />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> مميز</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.bestSeller} onChange={(e) => setForm({ ...form, bestSeller: e.target.checked })} /> الأكثر مبيعاً</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasOffer} onChange={(e) => setForm({ ...form, hasOffer: e.target.checked })} /> عليه عرض</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} /> متوفر</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الصور</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
                <div className="flex gap-2 flex-wrap">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img src={img} alt="" className="w-full h-full object-cover rounded" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">{editingId ? 'تحديث' : 'إضافة'}</button>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-right">الصورة</th>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">السعر</th>
              <th className="p-3 text-right">القسم</th>
              <th className="p-3 text-right">الماركة</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">خيارات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3"><img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-12 h-12 object-cover rounded" /></td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.price} {p.currency === 'yer' ? 'ر.ي' : 'ر.س'}</td>
                <td className="p-3">{p.categoryName || '-'}</td>
                <td className="p-3">{p.brand || '-'}</td>
                <td className="p-3">{p.inStock ? 'متوفر' : 'غير متوفر'}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
