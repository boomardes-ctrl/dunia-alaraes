const BASE = '/api';

async function request(url: string, options?: RequestInit) {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string>) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'خطأ في الاتصال' }));
    throw new Error(err.error || 'خطأ غير معروف');
  }
  return res.json();
}

export const api = {
  // Products
  getProducts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/products${q}`);
  },
  getProduct: (id: number) => request(`/products/${id}`),
  getBrands: () => request('/products/brands'),
  createProduct: (data: any) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data: any) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: any) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) => request(`/categories/${id}`, { method: 'DELETE' }),
  reorderCategories: (items: number[]) => request('/categories/reorder', { method: 'PUT', body: JSON.stringify({ items }) }),

  // Orders
  createOrder: (data: any) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrderByToken: (token: string) => request(`/orders/token/${token}`),
  getOrders: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/orders${q}`);
  },
  updateOrderStatus: (id: number, status: string) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Auth
  login: (_username: string, password: string) => request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  changePassword: (oldPassword: string, newPassword: string) => request('/admin/password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) }),

  // Upload
  uploadImage: async (file: File) => {
    const token = localStorage.getItem('admin_token');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error('فشل رفع الصورة');
    return res.json();
  },

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data: any) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
