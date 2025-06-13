import { useAdminAuth } from '@/contexts/AdminAuthContext';

const AdminHeader = ({ onMenuClick }) => {
  const { admin, logout } = useAdminAuth();

  return (
    <header className="bg-white shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu button and title */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-900">
            Minor Cineplex Admin
          </h1>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            สวัสดี, {admin?.first_name || 'Admin'}
          </div>
          
          <div className="relative">
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 