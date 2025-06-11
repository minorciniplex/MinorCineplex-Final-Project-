import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';

const TestContent = () => {
  const { admin, loading, isAuthenticated, isClient, error } = useAdminAuth();

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🧪 Admin Test Page</h1>
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🧪 Admin Test Page</h1>
          <p className="text-gray-600 mb-4">หน้าทดสอบระบบ Admin</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-800">Client Status</h3>
                <p className="text-sm text-gray-600">
                  isClient: {isClient ? '✅ true' : '❌ false'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-800">Auth Status</h3>
                <p className="text-sm text-gray-600">
                  isAuthenticated: {isAuthenticated ? '✅ true' : '❌ false'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-800">Loading Status</h3>
                <p className="text-sm text-gray-600">
                  loading: {loading ? '⏳ true' : '✅ false'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-800">Error Status</h3>
                <p className="text-sm text-gray-600">
                  error: {error ? `❌ ${error}` : '✅ null'}
                </p>
              </div>
            </div>
            
            {admin && (
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold text-green-800">Admin Info</h3>
                <div className="text-sm text-green-600 space-y-1">
                  <p>Name: {admin.first_name} {admin.last_name}</p>
                  <p>Email: {admin.email}</p>
                  <p>Role: {admin.role}</p>
                  <p>Permissions: {admin.permissions?.join(', ') || 'None'}</p>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-800">Browser Info</h3>
              <div className="text-sm text-blue-600 space-y-1">
                <p>User Agent: {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'Server Side'}</p>
                <p>localStorage Available: {typeof window !== 'undefined' && window.localStorage ? '✅ Yes' : '❌ No'}</p>
                <p>Window Defined: {typeof window !== 'undefined' ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔄 Reload Page
              </button>
              
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.clear();
                    window.location.href = '/admin/login';
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🚪 Clear & Logout
              </button>
              
              <a 
                href="/admin/movies" 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
              >
                🎬 Go to Movies
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminTestPage = () => {
  return (
    <>
      <Head>
        <title>Admin Test - Minor Cineplex</title>
      </Head>
      <AdminAuthProvider>
        <TestContent />
      </AdminAuthProvider>
    </>
  );
};

export default AdminTestPage; 