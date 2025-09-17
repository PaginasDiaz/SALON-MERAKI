import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  verifySession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Admin por defecto local
      if (email === 'admin' && password === 'admin2025') {
        const defaultAdmin: User = {
          id: 'default-admin-001',
          email: 'admin',
          name: 'Administrador Principal',
          role: 'super_admin',
          permissions: ['all'],
          lastLogin: new Date().toISOString()
        }
        
        // Guardar token local
        localStorage.setItem('salon_access_token', 'local-admin-token')
        localStorage.setItem('salon_user_data', JSON.stringify(defaultAdmin))
        setUser(defaultAdmin)
        
        return { success: true }
      }
      
      // Intentar login con Supabase si no es el admin por defecto
      if (import.meta.env.VITE_SUPABASE_PROJECT_ID && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-553e44d6/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (!response.ok) {
          console.error('Login failed:', data)
          return { success: false, error: data.error || 'Credenciales incorrectas' }
        }

        // Guardar token en localStorage
        localStorage.setItem('salon_access_token', data.access_token)
        localStorage.setItem('salon_user_data', JSON.stringify(data.user))
        setUser(data.user)
        
        return { success: true }
      } else {
        // No hay configuración de Supabase y no son las credenciales del admin por defecto
        return { success: false, error: 'Credenciales incorrectas. Usa: admin / admin2025' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Error de conexión. Usa admin / admin2025 para acceso local' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('salon_access_token')
    localStorage.removeItem('salon_user_data')
    setUser(null)
  }

  const verifySession = async () => {
    try {
      const token = localStorage.getItem('salon_access_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      // Si es el token local del admin por defecto
      if (token === 'local-admin-token') {
        const userData = localStorage.getItem('salon_user_data')
        if (userData) {
          const user = JSON.parse(userData)
          setUser(user)
          setIsLoading(false)
          return
        }
      }

      // Verificar con Supabase si hay configuración
      if (import.meta.env.VITE_SUPABASE_PROJECT_ID && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-553e44d6/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          localStorage.setItem('salon_user_data', JSON.stringify(data.user))
        } else {
          // Si falla la verificación, limpiar tokens
          localStorage.removeItem('salon_access_token')
          localStorage.removeItem('salon_user_data')
        }
      } else {
        // Sin configuración de Supabase, limpiar tokens
        localStorage.removeItem('salon_access_token')
        localStorage.removeItem('salon_user_data')
      }
    } catch (error) {
      console.error('Session verification error:', error)
      // En caso de error, mantener la sesión local si existe
      const userData = localStorage.getItem('salon_user_data')
      const token = localStorage.getItem('salon_access_token')
      
      if (token === 'local-admin-token' && userData) {
        const user = JSON.parse(userData)
        setUser(user)
      } else {
        localStorage.removeItem('salon_access_token')
        localStorage.removeItem('salon_user_data')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    verifySession()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      verifySession
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}