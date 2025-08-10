import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from './api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  avatar?: string
  phone?: string
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean
  login: (email: string, password: string) => Promise<any>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
  setUser: (user: User) => void
  clearAuth: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
  agreeToTerms: boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login({ email, password })
          const { user, tokens } = response.data
          
          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false
          })

          // Store token in localStorage for API interceptor
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', tokens.accessToken)
          }

          // Return the response data for 2FA handling
          return response.data
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(userData)
          const { user, tokens } = response.data
          
          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false
          })

          // Store token in localStorage for API interceptor
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', tokens.accessToken)
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        const { refreshToken } = get()
        
        // Call logout API if refresh token exists
        if (refreshToken) {
          authApi.logout().catch(console.error)
        }

        // Clear state and localStorage
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      },

      refreshAuth: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          get().clearAuth()
          return
        }

        try {
          const response = await authApi.refreshToken()
          const { tokens } = response.data
          
          set({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken
          })

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', tokens.accessToken)
          }
        } catch (error) {
          get().clearAuth()
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)

// Auth guard hook for protected routes
export const useAuthGuard = () => {
  const { isAuthenticated, user, isLoading, hasHydrated } = useAuth()
  
  return {
    isAuthenticated: hasHydrated ? isAuthenticated : false,
    user,
    isLoading,
    hasHydrated,
    isAgent: user?.role === 'AGENT',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  }
}
