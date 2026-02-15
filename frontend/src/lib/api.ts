import axios from 'axios'
import { mockProperties } from './mockData'

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
  getProperties: async (params?: any) => {
    try {
      return await api.get('/properties', { params })
    } catch (error) {
      console.error('API call failed', error)
      throw error
    }
  },
  getProperty: async (id: string) => {
    try {
      return await api.get(`/properties/${id}`)
    } catch (error) {
      console.error('API call failed', error)
      throw error
    }
  },
  createProperty: (data: any) => api.post('/properties', data),
  updateProperty: (id: string, data: any) => api.put(`/properties/${id}`, data),
  deleteProperty: (id: string) => api.delete(`/properties/${id}`),
  getFeaturedProperties: () => api.get('/properties?featured=true'),
  searchProperties: (params: any) => api.get('/properties/search', { params }),
  getMyProperties: () => api.get('/properties/user/my-properties'),
  toggleFavorite: (propertyId: string) => api.post('/favorites', { propertyId }),
  getFavorites: () => api.get('/favorites'),
}

// Geocoding API endpoints
export const geocodingApi = {
  geocodeAddress: (address: string) => api.post('/geocoding/geocode', { address }),
  reverseGeocode: (lat: number, lng: number) => api.post('/geocoding/reverse', { lat, lng }),
  findNearbyAmenities: (lat: number, lng: number, type: string, radius?: number) => 
    api.post('/geocoding/nearby', { lat, lng, type, radius }),
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => 
    api.post('/geocoding/distance', { lat1, lng1, lat2, lng2 }),
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
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  setupTwoFactor: (data: { method: 'totp' | 'sms' }) => api.post('/auth/2fa/setup', data),
  verifyTwoFactor: (data: { method: 'totp' | 'sms'; code: string }) => 
    api.post('/auth/2fa/verify', data),
  disableTwoFactor: (code: string) => api.post('/auth/2fa/disable', { code }),
  generateBackupCodes: () => api.post('/auth/2fa/backup-codes'),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post('/auth/change-password', data),
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
  getInquiries: () => api.get('/inquiries'), // For agents/admins
  getUserInquiries: () => api.get('/inquiries/user/my-inquiries'), // For regular users
  getInquiry: (id: string) => api.get(`/inquiries/${id}`),
  updateInquiry: (id: string, data: any) => api.put(`/inquiries/${id}`, data),
  deleteInquiry: (id: string) => api.delete(`/inquiries/${id}`),
}

export default api
