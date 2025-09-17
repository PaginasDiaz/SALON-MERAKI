import { useState, useEffect, useRef } from 'react'
import { Bell, X, Volume2, VolumeX, Check, AlertTriangle, Info, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader } from './ui/card'
import { Switch } from './ui/switch'
import { toast } from 'sonner@2.0.3'

interface Notification {
  id: string
  type: 'new_appointment' | 'reminder' | 'system' | 'manual'
  title: string
  message: string
  appointmentId?: string
  createdAt: string
  read: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

interface NotificationSystemProps {
  onNewNotification?: (notification: Notification) => void
}

export function NotificationSystem({ onNewNotification }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  // Sonidos para diferentes tipos de notificaciones
  const notificationSounds = {
    high: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMadkJPn+b96nBmCC8QLGvNGAoYAAAP',
    normal: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMadkJPn+b96nBmCC8QLGvNGAoYAAAP',
    urgent: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMadkJPn+b96nBmCC8QLGvNGAoYAAAP'
  }

  // Cargar notificaciones
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      
      // Verificar si tenemos las claves necesarias
      const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY
      if (!anonKey) {
        console.log('📱 No Supabase key, using local notifications only')
        loadLocalNotifications()
        return
      }

      // Intentar conectar con Supabase de forma silenciosa
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`https://sulsazdhkpawaibvvwwh.supabase.co/functions/v1/make-server-553e44d6/notifications`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const newNotifications = data.notifications || []
        
        // Verificar si hay nuevas notificaciones
        const previousIds = notifications.map(n => n.id)
        const reallyNewNotifications = newNotifications.filter(n => !previousIds.includes(n.id))
        
        // Reproducir sonido para nuevas notificaciones
        if (reallyNewNotifications.length > 0 && soundEnabled) {
          reallyNewNotifications.forEach(notification => {
            playNotificationSound(notification.priority)
            
            // Mostrar toast para notificaciones importantes
            if (notification.priority === 'high' || notification.priority === 'urgent') {
              toast(notification.title, {
                description: notification.message,
                action: {
                  label: 'Ver',
                  onClick: () => setIsOpen(true)
                }
              })
            }
            
            // Callback para nuevas notificaciones
            onNewNotification?.(notification)
          })
        }
        
        setNotifications(newNotifications)
        setUnreadCount(newNotifications.filter(n => !n.read).length)
        
        // Guardar en localStorage como backup
        localStorage.setItem('salon_notifications', JSON.stringify(newNotifications))
      } else {
        loadLocalNotifications()
      }
    } catch (error) {
      // Silenciar errores de red y usar localStorage
      loadLocalNotifications()
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar notificaciones desde localStorage
  const loadLocalNotifications = () => {
    const storedNotifications = localStorage.getItem('salon_notifications')
    if (storedNotifications) {
      const localNotifications = JSON.parse(storedNotifications)
      setNotifications(localNotifications)
      setUnreadCount(localNotifications.filter(n => !n.read).length)
    } else {
      // Crear algunas notificaciones de ejemplo si no hay nada
      const exampleNotifications: Notification[] = [
        {
          id: 'welcome',
          type: 'system',
          title: 'Bienvenido al Panel',
          message: 'Sistema de notificaciones activado. Las notificaciones aparecerán aquí.',
          createdAt: new Date().toISOString(),
          read: false,
          priority: 'low'
        }
      ]
      setNotifications(exampleNotifications)
      setUnreadCount(1)
      localStorage.setItem('salon_notifications', JSON.stringify(exampleNotifications))
    }
  }

  // Reproducir sonido de notificación
  const playNotificationSound = (priority: string) => {
    if (!soundEnabled || !audioRef.current) return
    
    const soundData = notificationSounds[priority as keyof typeof notificationSounds] || notificationSounds.normal
    audioRef.current.src = soundData
    audioRef.current.play().catch(e => console.log('Could not play notification sound:', e))
  }

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    // Actualizar inmediatamente en el estado local
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    setNotifications(updatedNotifications)
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    // Guardar en localStorage
    localStorage.setItem('salon_notifications', JSON.stringify(updatedNotifications))

    // Intentar actualizar en Supabase de forma silenciosa
    const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY
    if (anonKey) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        await fetch(`https://sulsazdhkpawaibvvwwh.supabase.co/functions/v1/make-server-553e44d6/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
      } catch (error) {
        // Silenciar errores de red - ya tenemos la actualización local
      }
    }
  }

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id)
    }
  }

  // Obtener icono por tipo
  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') return <AlertTriangle className="w-5 h-5 text-red-500" />
    
    switch (type) {
      case 'new_appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'reminder':
        return <Bell className="w-5 h-5 text-yellow-500" />
      case 'system':
        return <Info className="w-5 h-5 text-gray-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  // Obtener color del badge por prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'normal': return 'bg-blue-500 text-white'
      case 'low': return 'bg-gray-400 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'Ahora'
    if (diffMinutes < 60) return `${diffMinutes}m`
    if (diffHours < 24) return `${diffHours}h`
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    // Cargar notificaciones inmediatamente
    fetchNotifications()
    
    // Configurar polling menos agresivo - cada 30 segundos
    intervalRef.current = setInterval(fetchNotifications, 30000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [soundEnabled])

  useEffect(() => {
    // Configurar sonido inicial
    setSoundEnabled(localStorage.getItem('notification_sound') !== 'false')
  }, [])

  useEffect(() => {
    localStorage.setItem('notification_sound', String(soundEnabled))
  }, [soundEnabled])

  return (
    <div className="relative">
      {/* Audio element for notification sounds */}
      <audio ref={audioRef} preload="auto" />
      
      {/* Notification Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            className={`absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs ${getPriorityColor('high')}`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden shadow-lg border z-50 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notificaciones</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                    size="sm"
                  />
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="text-xs p-1 h-auto"
              >
                Marcar todas como leídas
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Cargando notificaciones...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-yellow-accent/10' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type, notification.priority)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-yellow-accent rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                          <Badge 
                            className={`text-xs px-1 py-0 ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}