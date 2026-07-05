import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAdminStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login('', password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4">
      <Helmet><title>تسجيل الدخول - دنيا العرائس</title></Helmet>
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
          <p className="text-text-light text-sm mt-1">أدخل كلمة المرور</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="input-field text-center text-lg tracking-widest"
            autoFocus
            required
          />
          {error && <p className="text-error text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'جاري...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
