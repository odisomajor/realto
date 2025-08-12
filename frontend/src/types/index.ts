export interface Agent {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  bio?: string
  company: {
    name: string
    address: string
    phone: string
    location: string
    website?: string
    logo?: string
  }
  specializations: string[]
  experience: number // years of experience
  propertiesListed: number
  propertiesSold: number
  rating: number
  reviews: number
  featured?: boolean
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  type: 'sale' | 'rent'
  category: 'residential' | 'commercial' | 'land'
  status: 'available' | 'sold' | 'rented' | 'pending' | 'under-construction'
  images: string[]
  features: string[]
  coordinates?: {
    lat: number
    lng: number
  }
  agent: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  featured?: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: 'user' | 'agent' | 'admin'
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface SearchFilters {
  type?: 'sale' | 'rent'
  category?: 'residential' | 'commercial' | 'land'
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minArea?: number
  maxArea?: number
  features?: string[]
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PropertyFormData {
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  type: 'sale' | 'rent'
  category: 'residential' | 'commercial' | 'land'
  features: string[]
  images: File[]
}
