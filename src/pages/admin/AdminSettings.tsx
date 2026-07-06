import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, X, GripVertical, Image as ImageIcon, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { Settings, SocialLink } from '../../types';
import { SOCIAL_PLATFORMS } from '../../types';

export default function AdminSettings() {
  const [form, setForm] = useState<Settings>({
    siteName: '', siteDescription: '', phone: '', whatsapp: '', logo: '',
    primaryColor: '#6B1D3A', accentColor: '#C9A84C', heroTitle: '', heroSubtitle: '',
    heroImage: '', aboutText: '', address: '', email: '', exchangeRate: '250',
    socialLinks: [], gallery: [],
  });
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api.getSettings().then((s: any) => setForm({ ...s, socialLinks: s.socialLinks || [] })).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في حفظ الإعدادات');
    }
  };

  const handleUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await api.uploadImage(file);
    setForm({ ...form, [key]: res.url });
  };

  const addSocial = () => {
    const first = Object.keys(SOCIAL_PLATFORMS).find(p => !form.socialLinks.find(l => l.platform === p));
    setForm({ ...form, socialLinks: [...form.socialLinks, { platform: first || 'instagram', url: '', label: '' }] });
  };

  const updateSocial = (i: number, data: Partial<SocialLink>) => {
    const links = [...form.socialLinks];
    links[i] = { ...links[i], ...data };
    setForm({ ...form, socialLinks: links });
  };

  const removeSocial = (i: number) => {
    setForm({ ...form, socialLinks: form.socialLinks.filter((_, idx) => idx !== i) });
  };

  return (
    <div>
      <Helmet><title>إعدادات الموقع - دنيا العرائس</title></Helmet>
      <h1 className="text-2xl font-black mb-6">إعدادات الموقع</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 space-y-4">
          <h2 className="font-bold text-lg">معلومات الموقع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">اسم الموقع</label>
              <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">الوصف</label>
              <input value={form.siteDescription} onChange={(e) => setForm({ ...form, siteDescription: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">رقم الجوال</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">رقم واتساب</label>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">البريد الإلكتروني</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">العنوان</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 space-y-4">
          <h2 className="font-bold text-lg">المظهر</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">اللون الأساسي</label>
              <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">لون التمييز</label>
              <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-light mb-1">عنوان الهيرو</label>
            <input value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-light mb-1">نص الهيرو</label>
            <input value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-light mb-1">الشعار</label>
              <input type="file" accept="image/*" onChange={(e) => handleUpload('logo', e)} className="block w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90 transition-all cursor-pointer" />
              {form.logo && <img src={form.logo} alt="logo" className="w-20 h-20 object-cover rounded-xl mt-2" />}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-light mb-1">صورة الهيرو</label>
              <input type="file" accept="image/*" onChange={(e) => handleUpload('heroImage', e)} className="block w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90 transition-all cursor-pointer" />
              {form.heroImage && <img src={form.heroImage} alt="hero" className="w-20 h-20 object-cover rounded-xl mt-2" />}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-light mb-1">نبذة عن المتجر</label>
            <textarea value={form.aboutText} onChange={(e) => setForm({ ...form, aboutText: e.target.value })} className="input-field" rows={3} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 space-y-4">
          <h2 className="font-bold text-lg">معرض الصور</h2>
          <p className="text-xs text-text-light">أضف حتى 5 صور للإعلانات والعروض (تظهر في الصفحة الرئيسية)</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="relative">
                {form.gallery[i] ? (
                  <div className="relative group">
                    <img src={form.gallery[i]} alt={`صورة ${i + 1}`} className="w-full aspect-square object-cover rounded-xl border border-gray-200" />
                    <button onClick={() => {
                      const g = [...form.gallery];
                      g.splice(i, 1);
                      setForm({ ...form, gallery: g });
                    }} className="absolute top-1 left-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"><Trash2 size={14} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-gray-50 transition-all">
                    <ImageIcon size={24} className="text-gray-300" />
                    <span className="text-xs text-gray-400 mt-1">إضافة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const res = await api.uploadImage(file);
                      const g = [...form.gallery];
                      g[i] = res.url;
                      setForm({ ...form, gallery: g });
                      e.target.value = '';
                    }} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 space-y-4">
          <h2 className="font-bold text-lg">العملة</h2>
          <div>
            <label className="block text-xs font-bold text-text-light mb-1">سعر الصرف (ريال يمني لكل ريال سعودي)</label>
            <input type="number" value={form.exchangeRate} onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })} className="input-field" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">روابط التواصل الاجتماعي</h2>
            <button type="button" onClick={addSocial} className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1">
              <Plus size={14} /> إضافة
            </button>
          </div>
          {form.socialLinks.length === 0 && (
            <p className="text-text-light text-sm">لا توجد روابط. أضف رابطاً جديداً</p>
          )}
          <div className="space-y-3">
            {form.socialLinks.map((link, i) => (
              <div key={i} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                  <select value={link.platform} onChange={(e) => updateSocial(i, { platform: e.target.value })} className="input-field !py-2 text-sm flex-1 md:w-36">
                    {Object.entries(SOCIAL_PLATFORMS).map(([key, val]) => (
                      <option key={key} value={key} disabled={key !== link.platform && form.socialLinks.some(l => l.platform === key)}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input value={link.url} onChange={(e) => updateSocial(i, { url: e.target.value })} placeholder="رابط المنصة" className="input-field !py-2 text-sm flex-1" dir="ltr" />
                  <button type="button" onClick={() => removeSocial(i)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-all flex-shrink-0"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 space-y-4">
          <h2 className="font-bold text-lg">تغيير كلمة المرور</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">كلمة المرور الحالية</label>
              <input type="password" value={passwords.oldPassword} onChange={(e) => setPasswords(p => ({ ...p, oldPassword: e.target.value }))} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-light mb-1">كلمة المرور الجديدة</label>
              <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))} className="input-field" dir="ltr" />
            </div>
          </div>
          {passMsg && (
            <div className={`text-sm font-medium ${passMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{passMsg.text}</div>
          )}
          <button type="button" onClick={async () => {
            if (!passwords.oldPassword || !passwords.newPassword) { setPassMsg({ type: 'error', text: 'يرجى تعبئة الحقلين' }); return; }
            try {
              await api.changePassword(passwords.oldPassword, passwords.newPassword);
              setPassMsg({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
              setPasswords({ oldPassword: '', newPassword: '' });
            } catch (e: any) {
              setPassMsg({ type: 'error', text: e.message });
            }
          }} className="btn-primary !py-2 text-sm">تحديث كلمة المرور</button>
        </div>

        <button type="submit" className="btn-primary w-full text-lg">{saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}</button>
      </form>
    </div>
  );
}
