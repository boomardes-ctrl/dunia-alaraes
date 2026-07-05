import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import { useAdminStore } from './store/adminStore';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import CartView from './pages/CartView';
import OrderStatus from './pages/OrderStatus';
import Favorites from './pages/Favorites';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminChangePassword from './pages/admin/AdminChangePassword';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function App() {
  const init = useAdminStore((s) => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="cart/:token" element={<CartView />} />
            <Route path="order/:orderNumber" element={<OrderStatus />} />
            <Route path="favorites" element={<Favorites />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="change-password" element={<AdminChangePassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
