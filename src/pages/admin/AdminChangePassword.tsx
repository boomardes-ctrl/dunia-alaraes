import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { KeyRound } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.changePassword(oldPassword, newPassword);
      setMessage('تم تغيير كلمة المرور بنجاح');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Helmet><title>تغيير كلمة المرور - دنيا العرائس</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">تغيير كلمة المرور</h1>
      <form onSubmit={handleSubmit} className="card p-6 max-w-md space-y-4">
        <div className="text-center mb-4">
          <KeyRound size={40} className="mx-auto text-primary" />
        </div>
        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="كلمة المرور القديمة" className="input-field" required />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة" className="input-field" required />
        {error && <p className="text-error text-sm">{error}</p>}
        {message && <p className="text-success text-sm">{message}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'جاري...' : 'تغيير كلمة المرور'}</button>
      </form>
    </div>
  );
}
