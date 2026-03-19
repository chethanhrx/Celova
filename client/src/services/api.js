import axios from 'axios';
import useAuthStore from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies (refresh token)
  timeout: 30000,
});

// Request Interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor — handle token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry &&
        error.response?.data?.code === 'TOKEN_EXPIRED') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ─── User API ─────────────────────────────────────────────────
export const userAPI = {
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  follow: (id) => api.post(`/users/follow/${id}`),
  unfollow: (id) => api.delete(`/users/follow/${id}`),
  getMyList: () => api.get('/users/my-list'),
  addToMyList: (seriesId) => api.post(`/users/my-list/${seriesId}`),
  removeFromMyList: (seriesId) => api.delete(`/users/my-list/${seriesId}`),
  updateWatchProgress: (data) => api.put('/users/watch-progress', data),
  getWatchHistory: () => api.get('/users/watch-history'),
  getNotifications: (page) => api.get(`/users/notifications?page=${page}`),
  markAllRead: () => api.put('/users/notifications/read-all'),
};

// ─── Series API ───────────────────────────────────────────────
export const seriesAPI = {
  getAll: (params) => api.get('/series', { params }),
  getFeatured: () => api.get('/series/featured'),
  getTop10: () => api.get('/series/top10'),
  getTrending: () => api.get('/series/trending'),
  getById: (id) => api.get(`/series/${id}`),
  getByCreator: (creatorId, params) => api.get(`/series/creator/${creatorId}`, { params }),
  create: (data) => api.post('/series', data),
  update: (id, data) => api.put(`/series/${id}`, data),
  delete: (id) => api.delete(`/series/${id}`),
  search: (query, params) => api.get('/series', { params: { search: query, ...params } }),
};

// ─── Episode API ──────────────────────────────────────────────
export const episodeAPI = {
  getBySeries: (seriesId, params) => api.get(`/episodes/series/${seriesId}`, { params }),
  getById: (id) => api.get(`/episodes/${id}`),
  create: (data) => api.post('/episodes', data),
  update: (id, data) => api.put(`/episodes/${id}`, data),
  delete: (id) => api.delete(`/episodes/${id}`),
  incrementView: (id, seriesId) => api.post(`/episodes/${id}/view`, { seriesId }),
};

// ─── Rating API ───────────────────────────────────────────────
export const ratingAPI = {
  upsert: (data) => api.post('/ratings', data),
  getSeriesRatings: (seriesId, page) => api.get(`/ratings/series/${seriesId}?page=${page}`),
  getEpisodeRatings: (episodeId) => api.get(`/ratings/episode/${episodeId}`),
};

// ─── Comment API ──────────────────────────────────────────────
export const commentAPI = {
  getByEpisode: (episodeId, page) => api.get(`/comments/episode/${episodeId}?page=${page}`),
  post: (data) => api.post('/comments', data),
  edit: (id, text) => api.put(`/comments/${id}`, { text }),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`),
};

// ─── Creator API ──────────────────────────────────────────────
export const creatorAPI = {
  getDashboard: () => api.get('/creator/dashboard'),
  getAnalytics: (period) => api.get(`/creator/analytics?period=${period}`),
  getEarnings: () => api.get('/creator/earnings'),
  requestWithdrawal: () => api.post('/creator/earnings/withdraw'),
  getFollowers: (page) => api.get(`/creator/followers?page=${page}`),
};

// ─── Admin API ────────────────────────────────────────────────
export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  verifyCreator: (id) => api.put(`/admin/users/${id}/verify-creator`),
  getAllSeries: (params) => api.get('/admin/series', { params }),
  featureSeries: (id, data) => api.put(`/admin/series/${id}/feature`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getAllEarnings: (params) => api.get('/admin/earnings', { params }),
  markEarningPaid: (id, txId) => api.post(`/admin/earnings/${id}/pay`, { transactionId: txId }),
  getRevenue: () => api.get('/admin/revenue'),
};

// ─── Payment API ──────────────────────────────────────────────
export const paymentAPI = {
  getPlans: () => api.get('/payments/plans'),
  createCheckout: (planId) => api.post('/payments/checkout', { planId }),
  getSubscription: () => api.get('/payments/subscription'),
};

// ─── YouTube API ──────────────────────────────────────────────
export const youtubeAPI = {
  getVideoInfo: (videoId) => api.get(`/youtube/video/${videoId}`),
  upload: (formData, onProgress) =>
    api.post('/youtube/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0, // No timeout for large uploads
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded / e.total) * 100)),
    }),
};

export default api;
