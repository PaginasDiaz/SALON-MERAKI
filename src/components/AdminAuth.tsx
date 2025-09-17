import { useState, useEffect } from 'react'
import { LogIn, LogOut, User, Shield, Key, Eye, EyeOff } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { toast } from 'sonner@2.0.3'
import { useAuth } from '../hooks/useAuth'

interface AdminAuthProps {
  onLogin: () => void
  onLogout: () => void
  isAuthenticated: boolean
}

export function AdminAuth({ onLogin, onLogout, isAuthenticated }: AdminAuthProps) {
  const { user, login, logout, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estado para registro de admin
  const [showSignup, setShowSignup] = useState(false)
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    secretKey: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        toast.success('¡Bienvenido al panel de administración!')
        onLogin()
        
        // Limpiar formulario
        setEmail('')
        setPassword('')
      } else {
        toast.error(result.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      toast.error('Error de conexión. Verifica tu conexión a internet.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    onLogout()
    toast.success('Sesión cerrada correctamente')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.secretKey) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (signupData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-553e44d6/admin/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('¡Administrador creado exitosamente!', {
          description: 'Ya puedes iniciar sesión con tus credenciales'
        })
        
        // Cambiar a modo login
        setShowSignup(false)
        setEmail(signupData.email)
        setSignupData({ name: '', email: '', password: '', secretKey: '' })
      } else {
        toast.error(result.error || 'Error al crear administrador')
      }
    } catch (error) {
      toast.error('Error de conexión durante el registro')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Primer inicio de sesión'
    
    const date = new Date(lastLogin)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-accent rounded-full p-2">
                <Shield className="w-4 h-4 text-salon" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{user.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Último acceso: {formatLastLogin(user.lastLogin)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-yellow-accent" />
            Panel de Administración
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {!showSignup ? (
            // Formulario de Login
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Usuario</Label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usuario por defecto: <code className="bg-gray-100 px-1 rounded">admin</code>
                </p>
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin2025"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Contraseña por defecto: <code className="bg-gray-100 px-1 rounded">admin2025</code>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-accent hover:bg-yellow-accent-hover text-salon"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-salon mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>

              <Separator />
              
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmail('admin')
                    setPassword('admin2025')
                  }}
                  disabled={isSubmitting}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Usar Credenciales por Defecto
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSignup(true)}
                  disabled={isSubmitting}
                >
                  <User className="w-4 h-4 mr-2" />
                  Crear Cuenta Admin
                </Button>
              </div>
            </form>
          ) : (
            // Formulario de Registro
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Nombre Completo</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  placeholder="Tu nombre completo"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  placeholder="admin@salonmeraki.com"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="signup-password">Contraseña</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="secret-key" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Clave Secreta de Admin
                </Label>
                <Input
                  id="secret-key"
                  type="password"
                  value={signupData.secretKey}
                  onChange={(e) => setSignupData({...signupData, secretKey: e.target.value})}
                  placeholder="Clave proporcionada por el sistema"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa: <code className="bg-gray-100 px-1 rounded">salon-meraki-admin-2024</code>
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-accent hover:bg-yellow-accent-hover text-salon"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-salon mr-2" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Crear Admin
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSignup(false)
                    setSignupData({ name: '', email: '', password: '', secretKey: '' })
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    )
  }

  return null
}