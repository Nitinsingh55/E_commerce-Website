import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on a login page
      const path = window.location.pathname
      if (!path.includes('/login')) {
        localStorage.removeItem('token')
        window.location.href = path.startsWith('/admin') ? '/admin/login' : '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const getImageUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  // Remove /api from base URL to get backend root
  const base = import.meta.env.VITE_API_URL.replace('/api', '');
  return `${base}${path}`;
};

export default api