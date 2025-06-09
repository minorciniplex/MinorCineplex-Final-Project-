import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import MovieTable from '@/components/admin/MovieTable';
import MovieForm from '@/components/admin/MovieForm';
import Button from '@/components/Button';

const MoviesContent = () => {
  const { admin, hasPermission } = useAdminAuth();
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

  useEffect(() => {
    if (admin && hasPermission('movies.read')) {
      fetchMovies();
    }
  }, [admin, pagination.page, filters]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/admin/movies?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMovies(data.movies);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      } else {
        console.error('Failed to fetch movies');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการหนัง</h1>
            <p className="text-gray-600 mt-1">เพิ่ม แก้ไข และจัดการข้อมูลหนัง</p>
          </div>
          
          {hasPermission('movies.write') && (
            <Button
              onClick={handleCreate}
              variant="primary"
              className="!w-auto !h-auto px-4 py-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มหนังใหม่
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
              <input
                type="text"
                placeholder="ชื่อหนัง หรือ คำอธิบาย"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="active">เปิดใช้งาน</option>
                <option value="inactive">ปิดใช้งาน</option>
                <option value="coming_soon">เร็วๆ นี้</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange({ genre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="Action">แอ็คชั่น</option>
                <option value="Comedy">ตลก</option>
                <option value="Drama">ดราม่า</option>
                <option value="Horror">สยองขวัญ</option>
                <option value="Romance">โรแมนติก</option>
                <option value="Sci-Fi">ไซไฟ</option>
                <option value="Thriller">ระทึกขวัญ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เรียงลำดับ</label>
              <select
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  handleFilterChange({ sort, order });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at-desc">วันที่สร้าง (ใหม่-เก่า)</option>
                <option value="created_at-asc">วันที่สร้าง (เก่า-ใหม่)</option>
                <option value="title-asc">ชื่อ (A-Z)</option>
                <option value="title-desc">ชื่อ (Z-A)</option>
                <option value="release_date-desc">วันที่เข้าฉาย (ใหม่-เก่า)</option>
                <option value="release_date-asc">วันที่เข้าฉาย (เก่า-ใหม่)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Movies Table */}
        <MovieTable
          movies={movies}
          loading={loading}
          pagination={pagination}
          onEdit={hasPermission('movies.write') ? handleEdit : null}
          onDelete={hasPermission('movies.write') ? handleDelete : null}
          onPageChange={handlePageChange}
        />

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