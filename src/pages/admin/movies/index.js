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
        alert(data.error || data.message || 'Error loading movie data');
        setMovies([]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      alert('Connection error: ' + error.message);
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
    if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
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
        alert('Movie deleted successfully');
        fetchMovies();
      } else {
        alert(data.error || 'Error deleting movie');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Error deleting movie');
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
          'active': 'Active',
          'inactive': 'Inactive', 
          'coming_soon': 'Coming Soon'
        };
        
        alert(`Status changed to "${statusText[newStatus]}" successfully`);
      } else {
        console.error('API Error:', data);
        alert(data.error || 'Error updating status');
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating movie status:', error);
      alert('Connection error: ' + error.message);
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
            <p className="mt-4 text-gray-600">Loading...</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You dont have permission to view movie data</p>
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
                🎬 Movie Management
                <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {pagination.total} movies
                </span>
              </h1>
              <p className="text-gray-600 mt-1">Add, edit and manage movie data</p>
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
                Refresh
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
                  Add New Movie
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
                <p className="text-sm font-medium text-gray-600">Total Movies</p>
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
                <p className="text-sm font-medium text-gray-600">Now Showing</p>
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
                <p className="text-sm font-medium text-gray-600">Coming Soon</p>
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
                <p className="text-sm font-medium text-gray-600">Inactive</p>
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
            <h3 className="text-lg font-medium text-gray-900">🔍 Filters and Search</h3>
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
                Clear Filters
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
                    ['Movie Title', 'Genre', 'Duration', 'Rating', 'Status', 'Release Date'],
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
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Search</label>
              <input
                type="text"
                placeholder="Movie title or description"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📊 Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="active">🟢 Active</option>
                <option value="inactive">🔴 Inactive</option>
                <option value="coming_soon">🔜 Coming Soon</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎭 Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange({ genre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="Action">⚔️ Action</option>
                <option value="Comedy">😂 Comedy</option>
                <option value="Drama">🎭 Drama</option>
                <option value="Horror">👻 Horror</option>
                <option value="Romance">💕 Romance</option>
                <option value="Sci-Fi">🚀 Sci-Fi</option>
                <option value="Thriller">😰 Thriller</option>
                <option value="Animation">🎨 Animation</option>
                <option value="Documentary">📋 Documentary</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🔀 Sort By</label>
              <select
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  handleFilterChange({ sort, order });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at-desc">🕐 Created Date (New-Old)</option>
                <option value="created_at-asc">🕐 Created Date (Old-New)</option>
                <option value="title-asc">🔤 Title (A-Z)</option>
                <option value="title-desc">🔤 Title (Z-A)</option>
                <option value="release_date-desc">📅 Release Date (New-Old)</option>
                <option value="release_date-asc">📅 Release Date (Old-New)</option>
                <option value="duration-desc">⏱️ Duration (Long-Short)</option>
                <option value="duration-asc">⏱️ Duration (Short-Long)</option>
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
                '🔍 No movies found matching criteria' : 
                '🎬 No movies in system yet'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.status || filters.genre ? 
                'Try adjusting filters or search with different terms' : 
                'Start by adding your first movie'
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
                  Clear Filters
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
                  Add First Movie
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
        <title>Movie Management - Minor Cineplex Admin</title>
      </Head>
      <AdminAuthProvider>
        <MoviesContent />
      </AdminAuthProvider>
    </>
  );
};

export default MoviesPage;