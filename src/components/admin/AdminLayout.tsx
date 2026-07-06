import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, Settings, KeyRound, LogOut, Menu, X, Store, Shield, Download } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

const mainLinks = [
  { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
];

const contentLinks = [
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/categories', label: 'الأقسام', icon: Tags },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
];

const settingsLinks = [
  { path: '/admin/settings', label: 'إعدادات الموقع', icon: Settings },
  { path: '/admin/change-password', label: 'كلمة المرور', icon: KeyRound },
  { path: '/admin/backup', label: 'النسخ الاحتياطي', icon: Download },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAdminStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 right-0 h-full w-72 bg-primary text-white z-40 transition-transform duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="font-black text-lg leading-tight">لوحة الإدارة</p>
              <p className="text-[11px] text-white/50">دنيا العرائس</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* الرئيسية */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 px-3 mb-2 font-bold">الرئيسية</p>
            {mainLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/20 shadow-md'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon size={19} className="opacity-80" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* إدارة المحتوى */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 px-3 mb-2 font-bold">إدارة المحتوى</p>
            {contentLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/20 shadow-md'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon size={19} className="opacity-80" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* الإعدادات */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 px-3 mb-2 font-bold">الإعدادات</p>
            {settingsLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/20 shadow-md'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon size={19} className="opacity-80" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <Store size={19} />
            <span className="font-semibold">العودة للموقع</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <LogOut size={19} />
            <span className="font-semibold">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
