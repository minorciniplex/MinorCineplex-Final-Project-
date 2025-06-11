import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import MovieTable from '@/components/admin/MovieTable';
import MovieForm from '@/components/admin/MovieForm';
import Button from '@/components/Button';

const MoviesContent = () => {
  const { admin, hasPermission, loading: authLoading, isClient } = useAdminAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    genre: '',
    sort: 'created_at',
    order: 'desc'
  });

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      
      // ตรวจสอบว่าอยู่ฝั่ง client และมี localStorage
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      console.log('Fetching movies with params:', queryParams.toString()); // Debug log

      const response = await fetch(`/api/admin/movies?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();
      console.log('Movies response:', data); // Debug log

      if (response.ok) {
        setMovies(data.movies || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0
        }));
      } else {
        console.error('API Error:', data);
        alert(data.error || data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลหนัง');
        setMovies([]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    if (isClient && admin && hasPermission('movies.read')) {
      fetchMovies();
    }
  }, [admin, isClient, hasPermission, fetchMovies]);

  const handleCreate = () => {
    setEditMovie(null);
    setShowForm(true);
  };

  const handleEdit = (movie) => {
    setEditMovie(movie);
    setShowForm(true);
  };

  const handleDelete = async (movieId) => {
    if (!confirm('คุณแน่ใจที่จะลบหนังเรื่องนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/movies?id=${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('ลบหนังเรียบร้อยแล้ว');
        fetchMovies();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditMovie(null);
    fetchMovies();
  };

  const handleStatusChange = async (movieId, newStatus) => {
    try {
      console.log(`Updating movie ${movieId} status to:`, newStatus);
      
      const response = await fetch(`/api/admin/movies`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          id: movieId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Status updated successfully');
        // อัปเดตข้อมูลในตาราง
        setMovies(prevMovies => 
          prevMovies.map(movie => 
            movie.id === movieId ? { ...movie, status: newStatus } : movie
          )
        );
        
        // แสดงข้อความสำเร็จ
        const statusText = {
          'active': 'เปิดใช้งาน',
          'inactive': 'ปิดใช้งาน', 
          'coming_soon': 'เร็วๆ นี้'
        };
        
        alert(`เปลี่ยนสถานะเป็น "${statusText[newStatus]}" เรียบร้อยแล้ว`);
      } else {
        console.error('API Error:', data);
        alert(data.error || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating movie status:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
      throw error;
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // แสดง loading screen ขณะรอ auth
  if (authLoading || !isClient) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ตรวจสอบสิทธิ์
  if (!hasPermission('movies.read')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-600 mt-2">คุณไม่มีสิทธิ์ในการดูข้อมูลหนัง</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                🎬 จัดการหนัง
                <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {pagination.total} เรื่อง
                </span>
              </h1>
              <p className="text-gray-600 mt-1">เพิ่ม แก้ไข และจัดการข้อมูลหนัง</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={fetchMovies}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center"
              >
                <svg className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                รีเฟรช
              </button>

              {hasPermission('movies.write') && (
                <Button
                  onClick={handleCreate}
                  variant="primary"
                  className="!w-auto !h-auto px-4 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มหนังใหม่
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">หนังทั้งหมด</p>
                <p className="text-xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">กำลังฉาย</p>
                <p className="text-xl font-bold text-green-600">
                  {movies.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100">
                <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">เร็วๆ นี้</p>
                <p className="text-xl font-bold text-yellow-600">
                  {movies.filter(m => m.status === 'coming_soon').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">ปิดใช้งาน</p>
                <p className="text-xl font-bold text-red-600">
                  {movies.filter(m => m.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">🔍 ตัวกรองและค้นหา</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  genre: '',
                  sort: 'created_at',
                  order: 'desc'
                })}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ล้างตัวกรอง
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => {
                  const csv = movies.map(movie => ({
                    title: movie.title,
                    genre: movie.genre,
                    duration: movie.duration,
                    rating: movie.rating,
                    status: movie.status,
                    release_date: movie.release_date
                  }));
                  
                  const csvContent = [
                    ['ชื่อหนัง', 'ประเภท', 'ระยะเวลา', 'เรทติ้ง', 'สถานะ', 'วันที่เข้าฉาย'],
                    ...csv.map(row => Object.values(row))
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `movies_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                📊 Export CSV
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 ค้นหา</label>
              <input
                type="text"
                placeholder="ชื่อหนัง หรือ คำอธิบาย"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📊 สถานะ</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="active">🟢 เปิดใช้งาน</option>
                <option value="inactive">🔴 ปิดใช้งาน</option>
                <option value="coming_soon">🔜 เร็วๆ นี้</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎭 ประเภท</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange({ genre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="Action">⚔️ แอ็คชั่น</option>
                <option value="Comedy">😂 ตลก</option>
                <option value="Drama">🎭 ดราม่า</option>
                <option value="Horror">👻 สยองขวัญ</option>
                <option value="Romance">💕 โรแมนติก</option>
                <option value="Sci-Fi">🚀 ไซไฟ</option>
                <option value="Thriller">😰 ระทึกขวัญ</option>
                <option value="Animation">🎨 การ์ตูน</option>
                <option value="Documentary">📋 สารคดี</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🔀 เรียงลำดับ</label>
              <select
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  handleFilterChange({ sort, order });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at-desc">🕐 วันที่สร้าง (ใหม่-เก่า)</option>
                <option value="created_at-asc">🕐 วันที่สร้าง (เก่า-ใหม่)</option>
                <option value="title-asc">🔤 ชื่อ (A-Z)</option>
                <option value="title-desc">🔤 ชื่อ (Z-A)</option>
                <option value="release_date-desc">📅 วันที่เข้าฉาย (ใหม่-เก่า)</option>
                <option value="release_date-asc">📅 วันที่เข้าฉาย (เก่า-ใหม่)</option>
                <option value="duration-desc">⏱️ ระยะเวลา (ยาว-สั้น)</option>
                <option value="duration-asc">⏱️ ระยะเวลา (สั้น-ยาว)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Movies Table or Empty State */}
        {!loading && movies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-4">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filters.search || filters.status || filters.genre ? 
                '🔍 ไม่พบหนังที่ตรงตามเงื่อนไข' : 
                '🎬 ยังไม่มีหนังในระบบ'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.status || filters.genre ? 
                'ลองปรับเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น' : 
                'เริ่มต้นด้วยการเพิ่มหนังเรื่องแรกของคุณ'
              }
            </p>
            <div className="flex justify-center space-x-3">
              {(filters.search || filters.status || filters.genre) && (
                <button
                  onClick={() => {
                    setFilters({
                      search: '',
                      status: '',
                      genre: '',
                      sort: 'created_at',
                      order: 'desc'
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ล้างตัวกรอง
                </button>
              )}
              {hasPermission('movies.write') && (
                <Button
                  onClick={handleCreate}
                  variant="primary"
                  className="!w-auto !h-auto px-4 py-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มหนังเรื่องแรก
                </Button>
              )}
            </div>
          </div>
        ) : (
          <MovieTable
            movies={movies}
            loading={loading}
            pagination={pagination}
            onEdit={hasPermission('movies.write') ? handleEdit : null}
            onDelete={hasPermission('movies.write') ? handleDelete : null}
            onStatusChange={hasPermission('movies.write') ? handleStatusChange : null}
            onPageChange={handlePageChange}
          />
        )}

        {/* Movie Form Modal */}
        {showForm && (
          <MovieForm
            movie={editMovie}
            onClose={() => {
              setShowForm(false);
              setEditMovie(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const MoviesPage = () => {
  return (
    <>
      <Head>
        <title>จัดการหนัง - Minor Cineplex Admin</title>
      </Head>
      <AdminAuthProvider>
        <MoviesContent />
      </AdminAuthProvider>
    </>
  );
};

export default MoviesPage;