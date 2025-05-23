import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const movieApi = {
  getNowShowing: (filters) => api.get('/movies', { params: { type: 'now-showing', filters: JSON.stringify(filters) } }),
  getComingSoon: (filters) => api.get('/movies', { params: { type: 'coming-soon', filters: JSON.stringify(filters) } }),
  getMovieGenres: (movieIds) => api.get('/movies/genres', { params: { movieIds: movieIds.join(',') } }),
  getMovieLanguages: (movieIds) => api.get('/movies/languages', { params: { movieIds: movieIds.join(',') } })
};

export const cinemaApi = {
  getAll: () => api.get('/cinemas'),
  getByProvince: (province) => api.get('/cinemas', { params: { province } })
};

export const couponApi = {
  getActive: () => api.get('/coupons'),
  updateStatus: (couponId, status) => api.patch(`/coupons?coupon_id=${couponId}`, { status })
};