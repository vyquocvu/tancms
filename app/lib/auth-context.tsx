import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { StandardApiResponse } from '~/lib/api-response'

type AuthResponseData = {
  user: AuthUser | null
  tokens?: unknown
}

const extractUserFromResponse = (data: StandardApiResponse<AuthResponseData>): AuthUser | null => {
  return data?.data?.user ?? null
}

const extractErrorMessage = (data: StandardApiResponse<unknown>, fallback: string): string => {
  return data.error?.details?.[0] ?? data.error?.message ?? data.message ?? fallback
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth?action=me', {
        credentials: 'include',
      })
      const data: StandardApiResponse<AuthResponseData> = await response.json()

      if (data.success) {
        setUser(extractUserFromResponse(data))
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data: StandardApiResponse<AuthResponseData> = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: extractErrorMessage(data, 'Login failed') }
      }

      const user = extractUserFromResponse(data)
      setUser(user)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, confirmPassword: password }),
        credentials: 'include',
      })

      const data: StandardApiResponse<AuthResponseData> = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: extractErrorMessage(data, 'Registration failed') }
      }

      const user = extractUserFromResponse(data)
      setUser(user)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth?action=logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Role checking hooks
export function useRequireAuth(redirectTo?: string) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user && redirectTo) {
      window.location.href = redirectTo
    }
  }, [user, loading, redirectTo])

  return { user, loading }
}

export function useRequireRole(requiredRole: AuthUser['role']) {
  const { user } = useAuth()

  const roleHierarchy: Record<AuthUser['role'], number> = {
    VIEWER: 1,
    AUTHOR: 2,
    EDITOR: 3,
    ADMIN: 4,
  }

  const hasPermission = user && roleHierarchy[user.role] >= roleHierarchy[requiredRole]

  return { hasPermission, user }
}
