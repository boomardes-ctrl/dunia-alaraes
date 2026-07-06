import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit2, Trash2, X, GripVertical, Image as ImageIcon } from 'lucide-react';
import { api } from '../../lib/api';
import type { Category } from '../../types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [image, setImage] = useState('');
  const [dragId, setDragId] = useState<number | null>(null);

  const load = () => api.getCategories().then(setCategories);

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCategory(editingId, { name, nameEn, image });
      } else {
        await api.createCategory({ name, nameEn, image });
      }
      await load();
      setShowForm(false);
      setEditingId(null);
      setName('');
      setNameEn('');
      setImage('');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleEdit = (c: Category) => {
    setName(c.name);
    setNameEn(c.nameEn || '');
    setImage(c.image || '');
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تأكيد الحذف؟')) return;
    await api.deleteCategory(id);
    await load();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await api.uploadImage(file);
    setImage(res.url);
  };

  const handleDragStart = (id: number) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (dragId === null || dragId === id) return;
    setCategories((prev) => {
      const items = [...prev];
      const fromIdx = items.findIndex((c) => c.id === dragId);
      const toIdx = items.findIndex((c) => c.id === id);
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return items;
    });
  };
  const handleDragEnd = async () => {
    if (dragId === null) return;
    setDragId(null);
    await api.reorderCategories(categories.map((c) => c.id));
  };

  return (
    <div>
      <Helmet><title>إدارة الأقسام - دنيا العرائس</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">الأقسام</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setName(''); setNameEn(''); setImage(''); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> إضافة قسم
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">{editingId ? 'تعديل قسم' : 'إضافة قسم'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم القسم *" className="input-field" required />
              <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="الاسم بالإنجليزية" className="input-field" />
              <div>
                <label className="block text-sm font-bold mb-2">صورة القسم</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <ImageIcon size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-500">اختيار صورة</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {image && (
                    <div className="relative">
                      <img src={image} alt="" className="w-16 h-16 object-cover rounded-2xl" />
                      <button type="button" onClick={() => setImage('')} className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow">✕</button>
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">{editingId ? 'تحديث' : 'إضافة'}</button>
            </form>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={36} className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-bold text-lg">لا توجد أقسام</p>
          <p className="text-gray-400 text-sm mt-1">أضف قسماً جديداً لتبدأ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => handleDragStart(cat.id)}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDragEnd={handleDragEnd}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all overflow-hidden fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative h-32 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                    <ImageIcon size={28} className="text-primary/30" />
                  </div>
                )}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow text-gray-500 flex items-center gap-1">
                    <GripVertical size={12} /> سحب
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEdit(cat)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white hover:text-blue-600 shadow transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white hover:text-red-600 shadow transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold">{cat.name}</p>
                {cat.nameEn && <p className="text-xs text-gray-400 mt-0.5">{cat.nameEn}</p>}
                <p className="text-[11px] text-gray-400 mt-2">ترتيب: {cat.sortOrder}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
