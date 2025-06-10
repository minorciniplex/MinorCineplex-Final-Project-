import { useState, useEffect } from 'react';
import Button from '@/components/Button';

const MovieForm = ({ movie, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    description: '',
    genre: '',
    duration: '',
    rating: '',
    release_date: '',
    poster_url: '',
    trailer_url: '',
    director: '',
    cast: '',
    language: '',
    subtitle: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        title_en: movie.title_en || '',
        description: movie.description || '',
        genre: movie.genre || '',
        duration: movie.duration || '',
        rating: movie.rating || '',
        release_date: movie.release_date ? movie.release_date.split('T')[0] : '',
        poster_url: movie.poster_url || '',
        trailer_url: movie.trailer_url || '',
        director: movie.director || '',
        cast: movie.cast || '',
        language: movie.language || '',
        subtitle: movie.subtitle || '',
        status: movie.status || 'active'
      });
    }
  }, [movie]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'ชื่อหนังเป็นข้อมูลที่จำเป็น';
    }

    if (!formData.genre.trim()) {
      newErrors.genre = 'ประเภทหนังเป็นข้อมูลที่จำเป็น';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'ระยะเวลาต้องมากกว่า 0 นาที';
    }

    if (!formData.rating.trim()) {
      newErrors.rating = 'เรทติ้งเป็นข้อมูลที่จำเป็น';
    }

    if (!formData.release_date) {
      newErrors.release_date = 'วันที่เข้าฉายเป็นข้อมูลที่จำเป็น';
    }

    if (formData.poster_url) {
      const cleanPosterUrl = formData.poster_url.trim();
      if (cleanPosterUrl && !isValidUrl(cleanPosterUrl)) {
        newErrors.poster_url = 'URL รูปโปสเตอร์ไม่ถูกต้อง';
      }
    }

    if (formData.trailer_url) {
      const cleanTrailerUrl = formData.trailer_url.trim();
      if (cleanTrailerUrl && !isValidUrl(cleanTrailerUrl)) {
        newErrors.trailer_url = 'URL ตัวอย่างหนังไม่ถูกต้อง';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = movie 
        ? `/api/admin/movies?id=${movie.id}`
        : '/api/admin/movies';

      const method = movie ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          cast: formData.cast.split(',').map(c => c.trim()).filter(c => c),
          poster_url: formData.poster_url.trim(),
          trailer_url: formData.trailer_url.trim(),
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(movie ? 'แก้ไขหนังเรียบร้อยแล้ว' : 'เพิ่มหนังเรียบร้อยแล้ว');
        onSuccess();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {movie ? 'แก้ไขข้อมูลหนัง' : 'เพิ่มหนังใหม่'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อหนัง (ไทย) *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ชื่อหนังภาษาไทย"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Title EN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อหนัง (อังกฤษ)
                </label>
                <input
                  type="text"
                  name="title_en"
                  value={formData.title_en}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="English Title"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภท *
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.genre ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกประเภท</option>
                  <option value="Action">แอ็คชั่น</option>
                  <option value="Adventure">ผจญภัย</option>
                  <option value="Comedy">ตลก</option>
                  <option value="Drama">ดราม่า</option>
                  <option value="Fantasy">แฟนตาซี</option>
                  <option value="Horror">สยองขวัญ</option>
                  <option value="Romance">โรแมนติก</option>
                  <option value="Sci-Fi">ไซไฟ</option>
                  <option value="Thriller">ระทึกขวัญ</option>
                  <option value="Animation">อนิเมชั่น</option>
                  <option value="Documentary">สารคดี</option>
                </select>
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600">{errors.genre}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ระยะเวลา (นาที) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="120"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เรทติ้ง *
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.rating ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกเรทติ้ง</option>
                  <option value="G">G - ทุกเพศทุกวัย</option>
                  <option value="PG">PG - แนะนำให้ผู้ปกครองดู</option>
                  <option value="PG-13">PG-13 - ไม่เหมาะสำหรับเด็กอายุต่ำกว่า 13 ปี</option>
                  <option value="R">R - ห้ามเด็กอายุต่ำกว่า 17 ปี</option>
                  <option value="NC-17">NC-17 - ผู้ใหญ่เท่านั้น</option>
                </select>
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                )}
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เข้าฉาย *
                </label>
                <input
                  type="date"
                  name="release_date"
                  value={formData.release_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.release_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.release_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.release_date}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เรื่องย่อ
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เรื่องย่อของหนัง..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Director */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ผู้กำกับ
                </label>
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ชื่อผู้กำกับ"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ภาษา
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ไทย, อังกฤษ"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำบรรยาย
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ไทย, อังกฤษ"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">เปิดใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
                  <option value="coming_soon">เร็วๆ นี้</option>
                </select>
              </div>
            </div>

            {/* Cast */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                นักแสดง
              </label>
              <input
                type="text"
                name="cast"
                value={formData.cast}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="นักแสดงคนที่ 1, นักแสดงคนที่ 2, นักแสดงคนที่ 3"
              />
              <p className="mt-1 text-sm text-gray-500">แยกชื่อนักแสดงด้วยเครื่องหมายจุลภาค</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Poster URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL รูปโปสเตอร์
                </label>
                <input
                  type="url"
                  name="poster_url"
                  value={formData.poster_url}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.poster_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/poster.jpg"
                />
                {errors.poster_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.poster_url}</p>
                )}
              </div>

              {/* Trailer URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL ตัวอย่างหนัง
                </label>
                <input
                  type="url"
                  name="trailer_url"
                  value={formData.trailer_url}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.trailer_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {errors.trailer_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.trailer_url}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="!w-auto !h-auto px-4 py-2"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="!w-auto !h-auto px-6 py-2"
              >
                {loading ? 'กำลังบันทึก...' : (movie ? 'บันทึกการแก้ไข' : 'เพิ่มหนัง')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MovieForm; 