import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // แยก client-side initialization
  useEffect(() => {
    setIsClient(true);
    checkAuth();
  }, []);

  // เพิ่ม effect สำหรับ redirect
  useEffect(() => {
    if (isClient && !loading && !admin && router.pathname.startsWith('/admin') && router.pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [admin, loading, router, isClient]);

  const checkAuth = async () => {
    try {
      setError(null);
      
      // ตรวจสอบว่าอยู่ฝั่ง client แล้วหรือยัง
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // ตรวจสอบ token กับ server
      const response = await fetch('/api/admin/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
      } else {
        localStorage.removeItem('adminToken');
        if (response.status === 401) {
          console.log('Token expired, redirecting to login');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminToken', data.token);
        }
        setAdmin(data.admin);
        router.push('/admin');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
    setAdmin(null);
    router.push('/admin/login');
  };

  const hasPermission = (permission) => {
    if (!admin) return false;
    return admin.permissions?.includes(permission) || admin.permissions?.includes('*');
  };

  // แสดง error state หากมีปัญหา
  if (error && isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            โหลดใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{
      admin,
      loading,
      login,
      logout,
      hasPermission,
      isAuthenticated: !!admin,
      isClient,
      error
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 