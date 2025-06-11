import Image from 'next/image';
import Button from '@/components/Button';
import { useState } from 'react';

const MovieTable = ({ movies, loading, pagination, onEdit, onDelete, onPageChange, onStatusChange }) => {
  const [statusLoading, setStatusLoading] = useState({});
  
  // Debug logging
  console.log('MovieTable movies:', movies);
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ชม. ${mins}นาที`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'bg-green-100 text-green-800', text: 'เปิดใช้งาน' },
      'inactive': { color: 'bg-red-100 text-red-800', text: 'ปิดใช้งาน' },
      'coming_soon': { color: 'bg-yellow-100 text-yellow-800', text: 'เร็วๆ นี้' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleStatusChange = async (movieId, newStatus) => {
    if (!onStatusChange) return;
    
    setStatusLoading(prev => ({ ...prev, [movieId]: true }));
    
    try {
      await onStatusChange(movieId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setStatusLoading(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const StatusDropdown = ({ movie }) => {
    const statusOptions = [
      { 
        value: 'active', 
        label: 'เปิดใช้งาน', 
        icon: '🟢',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        hoverBg: 'hover:bg-green-100'
      },
      { 
        value: 'inactive', 
        label: 'ปิดใช้งาน', 
        icon: '🔴',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        hoverBg: 'hover:bg-red-100'
      },
      { 
        value: 'coming_soon', 
        label: 'เร็วๆ นี้', 
        icon: '🟡',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        hoverBg: 'hover:bg-yellow-100'
      }
    ];

    const currentStatus = statusOptions.find(option => option.value === movie.status);
    const isLoading = statusLoading[movie.id];

    if (!onStatusChange) {
      // ถ้าไม่มี onStatusChange แสดงเป็น badge ที่สวยกว่า
      return (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${currentStatus?.bgColor} ${currentStatus?.color} ${currentStatus?.borderColor} border`}>
          <span className="mr-1.5">{currentStatus?.icon}</span>
          {currentStatus?.label || movie.status}
        </div>
      );
    }

    return (
      <div className="relative group">
        <div className={`
          relative inline-flex items-center rounded-lg border transition-all duration-200 shadow-sm
          ${currentStatus?.bgColor || 'bg-gray-50'} 
          ${currentStatus?.borderColor || 'border-gray-200'}
          ${isLoading ? 'opacity-60' : `${currentStatus?.hoverBg || 'hover:bg-gray-100'} hover:shadow-md hover:scale-105`}
        `}>
          <select
            value={movie.status}
            onChange={(e) => handleStatusChange(movie.id, e.target.value)}
            disabled={isLoading}
            className={`
              appearance-none bg-transparent border-none rounded-lg pl-4 pr-10 py-3
              text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${currentStatus?.color || 'text-gray-700'}
              ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
              min-w-[150px] transition-all duration-200
            `}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
          
          {/* Dropdown arrow */}
          {!isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className={`w-4 h-4 transition-all duration-200 group-hover:rotate-180 ${currentStatus?.color || 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
          
          {/* Status indicator dot */}
          <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
            movie.status === 'active' ? 'bg-green-400' :
            movie.status === 'inactive' ? 'bg-red-400' :
            movie.status === 'coming_soon' ? 'bg-yellow-400' : 'bg-gray-400'
          } ${isLoading ? 'animate-pulse' : 'animate-bounce'}`}></div>
        </div>
        
        {/* Tooltip แสดงเมื่อ hover */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            คลิกเพื่อเปลี่ยนสถานะ
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                🎬 หนัง
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                📋 ข้อมูลพื้นฐาน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                📊 สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                📅 วันที่สร้าง
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ⚙️ จัดการ
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading state
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded"></div>
                      <div className="ml-4">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-28"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-12"></div>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : movies.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีข้อมูลหนัง</h3>
                    <p className="mt-1 text-sm text-gray-500">เริ่มต้นด้วยการเพิ่มหนังเรื่องแรกของคุณ</p>
                  </div>
                </td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-12 relative">
                        {movie.poster_url && movie.poster_url.trim() ? (
                          <>
                            <Image
                              src={movie.poster_url.trim()}
                              alt={movie.title || 'Movie poster'}
                              width={48}
                              height={64}
                              className="h-16 w-12 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.parentNode.querySelector('.fallback-poster');
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="fallback-poster h-16 w-12 bg-gray-200 rounded flex items-center justify-center absolute top-0 left-0" style={{ display: 'none' }}>
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </>
                        ) : (
                          <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {movie.title}
                        </div>
                        {movie.title_en && (
                          <div className="text-sm text-gray-500">
                            {movie.title_en}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center flex-wrap">
                        <span className="text-gray-600 font-medium">🎭 ประเภท:</span>
                        <div className="ml-2 flex flex-wrap gap-1">
                          {movie.movie_genre_mapping && movie.movie_genre_mapping.length > 0 ? (
                            movie.movie_genre_mapping.map((mapping, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {mapping.movie_genres?.name || 'ไม่ระบุ'}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              ไม่ระบุ
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 font-medium">⏱️ ระยะเวลา:</span>
                        <span className="ml-2">{formatDuration(movie.duration)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 font-medium">⭐ เรทติ้ง:</span>
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          {movie.rating || 'ไม่ระบุ'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 font-medium">📅 เข้าฉาย:</span>
                        <span className="ml-2">{formatDate(movie.release_date)}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusDropdown movie={movie} />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(movie.created_at)}</div>
                    {movie.created_by_admin && (
                      <div className="text-xs text-gray-400">
                        โดย {movie.created_by_admin.first_name} {movie.created_by_admin.last_name}
                      </div>
                    )}
                  </td>
                  
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(movie)}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm leading-4 font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            title="แก้ไขหนัง"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            แก้ไข
                          </button>
                        )}
                        
                        {onDelete && (
                          <button
                            onClick={() => onDelete(movie.id)}
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm leading-4 font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            title="ลบหนัง"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            ลบ
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                แสดง{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                ถึง{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                จาก{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                รายการ
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieTable; 