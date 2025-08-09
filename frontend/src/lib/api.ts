import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Property API endpoints
export const propertyApi = {
  getProperties: (params?: any) => api.get('/properties', { params }),
  getProperty: (id: string) => api.get(`/properties/${id}`),
  createProperty: (data: any) => api.post('/properties', data),
  updateProperty: (id: string, data: any) => api.put(`/properties/${id}`, data),
  deleteProperty: (id: string) => api.delete(`/properties/${id}`),
  getFeaturedProperties: () => api.get('/properties/featured'),
  searchProperties: (params: any) => api.get('/properties/search', { params }),
  getMyProperties: () => api.get('/properties/my-properties'),
  toggleFavorite: (propertyId: string) => api.post(`/properties/${propertyId}/favorite`),
  getFavorites: () => api.get('/properties/favorites'),
}

// Auth API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
}

// User API endpoints
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getUsers: (params?: any) => api.get('/users', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  uploadAvatar: (data: { avatarUrl: string }) => api.post('/users/avatar', data),
}

// Browsing session endpoints
export const browsingSessionApi = {
  trackView: (sessionId: string, propertyId: string) =>
    api.post('/browsing-session/track-view', { sessionId, propertyId }),
  
  markPromptShown: (sessionId: string) =>
    api.post('/browsing-session/mark-prompt-shown', { sessionId }),
  
  getSession: (sessionId: string) =>
    api.get(`/browsing-session/${sessionId}`),
  
  linkToUser: (sessionId: string, userId: string) =>
    api.post('/browsing-session/link-user', { sessionId, userId })
};

// Inquiry API endpoints
export const inquiryApi = {
  createInquiry: (data: any) => api.post('/inquiries', data),
  getInquiries: () => api.get('/inquiries'),
  getInquiry: (id: string) => api.get(`/inquiries/${id}`),
  updateInquiry: (id: string, data: any) => api.put(`/inquiries/${id}`, data),
  deleteInquiry: (id: string) => api.delete(`/inquiries/${id}`),
}

export default api