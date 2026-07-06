import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Copy, Check, AlertTriangle } from 'lucide-react';

export default function AdminBackup() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/backup', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dunia-alaraes-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg({ type: 'success', text: 'تم تحميل النسخة الاحتياطية' });
    } catch { setMsg({ type: 'error', text: 'فشل تحميل النسخة' }); }
    setLoading(false);
  };

  const handleCopy = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/backup', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      await navigator.clipboard.writeText(JSON.stringify(data));
      setCopied(true);
      setMsg({ type: 'success', text: 'تم نسخ الكود' });
      setTimeout(() => setCopied(false), 3000);
    } catch { setMsg({ type: 'error', text: 'فشل النسخ' }); }
    setLoading(false);
  };

  const handleRestore = async () => {
    if (!pastedCode.trim()) { setMsg({ type: 'error', text: 'الصق الكود أولاً' }); return; }
    if (!confirm('تأكيد استعادة البيانات؟ سيتم استبدال جميع البيانات الحالية!')) return;
    setLoading(true);
    try {
      const data = JSON.parse(pastedCode);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: result.message || 'تمت الاستعادة' });
        setPastedCode('');
        setShowPaste(false);
      } else throw new Error(result.error);
    } catch (e: any) { setMsg({ type: 'error', text: e.message || 'فشل الاستعادة' }); }
    setLoading(false);
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: result.message || 'تمت الاستعادة' });
        e.target.value = '';
      } else throw new Error(result.error);
    } catch (e: any) { setMsg({ type: 'error', text: e.message || 'ملف غير صالح' }); }
    setLoading(false);
  };

  return (
    <div>
      <Helmet><title>النسخ الاحتياطي - دنيا العرائس</title></Helmet>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
        <p className="text-text-light text-sm mt-1">حفظ واستعادة بيانات الموقع</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 p-4 rounded-2xl mb-6 text-sm font-bold ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="mr-auto opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button onClick={handleDownload} disabled={loading} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all text-right flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <Download size={24} />
          </div>
          <div>
            <p className="font-bold text-sm">تحميل نسخة</p>
            <p className="text-xs text-gray-400 mt-0.5">حمل جميع البيانات كملف JSON</p>
          </div>
        </button>

        <button onClick={handleCopy} disabled={loading} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all text-right flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${copied ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
            {copied ? <Check size={24} /> : <Copy size={24} />}
          </div>
          <div>
            <p className="font-bold text-sm">{copied ? 'تم النسخ!' : 'نسخ الكود'}</p>
            <p className="text-xs text-gray-400 mt-0.5">انسخ البيانات للحافظة</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="font-bold mb-4">استعادة البيانات</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">رفع ملف JSON</label>
            <input type="file" accept=".json" onChange={handleFileRestore} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90 transition-all cursor-pointer" />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <button onClick={() => setShowPaste(!showPaste)} className="text-sm font-bold text-primary hover:text-primary-light transition-all">
              {showPaste ? 'إلغاء' : 'أو لصق الكود'}
            </button>
            {showPaste && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  placeholder="الصق كود JSON هنا..."
                  className="input-field h-32 text-xs font-mono"
                  dir="ltr"
                />
                <button onClick={handleRestore} disabled={loading} className="btn-primary text-sm">
                  {loading ? 'جاري...' : 'استعادة'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-100">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">نصيحة</p>
            <p className="text-xs text-amber-700 mt-1">خذ نسخة احتياطية قبل أي إعادة نشر للموقع. الصور المخزنة على Cloudinary تبقى آمنة.</p>
          </div>
        </div>
      </div>
    </div>
  );
}