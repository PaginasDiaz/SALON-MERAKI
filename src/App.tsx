import { useState, useEffect } from "react"
import { Header } from "./components/Header"
import { HeroSection } from "./components/HeroSection"
import { ServicesSection } from "./components/ServicesSection"
import { GallerySection } from "./components/GallerySection"
import { AboutSection } from "./components/AboutSection"
import { ContactSection } from "./components/ContactSection"
import { Footer } from "./components/Footer"
import { AdminPanel } from "./components/AdminPanel"
import { AdminAuth } from "./components/AdminAuth"
import { NotificationSystem } from "./components/NotificationSystem"
import { WhatsAppReminders } from "./components/WhatsAppReminders"
import { AuthProvider, useAuth } from "./hooks/useAuth"
import { AppointmentsProvider, useAppointments } from "./hooks/useAppointments"
import { Toaster } from "./components/ui/sonner"
import { Button } from "./components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Settings, Home, Calendar, MessageCircle, Bell, User, Clock, Check } from "lucide-react"
import { toast } from "sonner@2.0.3"

function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const { appointments, updateAppointment, refreshAppointments, isLoading } = useAppointments()
  const [isAdminView, setIsAdminView] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleNewNotification = (notification: any) => {
    // Aquí puedes agregar lógica adicional cuando llegue una nueva notificación
    console.log('Nueva notificación:', notification)
  }

  const handleReminderSent = (appointmentId: string) => {
    // Actualizar el estado de la cita para mostrar que se envió recordatorio
    updateAppointment(appointmentId, { reminderSent: true })
    
    toast.success('Recordatorio enviado', {
      description: 'El cliente recibirá la notificación por WhatsApp'
    })
  }

  const handleAppointmentUpdate = async (appointmentId: string, status: string) => {
    const result = await updateAppointment(appointmentId, { status })
    if (result.success) {
      toast.success(`Cita ${status === 'confirmed' ? 'confirmada' : 'actualizada'} correctamente`)
    } else {
      toast.error(result.error || 'Error al actualizar la cita')
    }
  }

  // Escuchar nuevas citas desde el BookingModal
  useEffect(() => {
    const handleNewAppointment = () => {
      refreshAppointments()
    }

    window.addEventListener('newAppointment', handleNewAppointment)
    return () => window.removeEventListener('newAppointment', handleNewAppointment)
  }, [refreshAppointments])

  // Estadísticas rápidas para el dashboard
  const quickStats = {
    totalToday: appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length,
    pendingConfirmation: appointments.filter(apt => apt.status === 'pending').length,
    confirmedToday: appointments.filter(apt => 
      apt.date === new Date().toISOString().split('T')[0] && apt.status === 'confirmed'
    ).length,
    revenueToday: appointments
      .filter(apt => apt.date === new Date().toISOString().split('T')[0] && apt.status !== 'cancelled')
      .reduce((sum, apt) => sum + apt.totalPrice, 0)
  }

  if (isAdminView) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <AdminAuth
          onLogin={() => {}}
          onLogout={() => {
            setIsAdminView(false)
          }}
          isAuthenticated={isAuthenticated}
        />
        
        {isAuthenticated && user && (
          <>
            {/* Admin Header */}
            <div className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-medium z-50 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-accent rounded-lg p-2">
                      <Settings className="w-6 h-6 text-salon" />
                    </div>
                    <div>
                      <h1 className="text-salon text-xl font-medium">
                        Panel de Administración
                      </h1>
                      <p className="text-sm text-neutral-dark">
                        <span className="text-yellow-accent font-medium">Salon</span> Meraki - Gestión Integral
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <NotificationSystem onNewNotification={handleNewNotification} />
                    <AdminAuth
                      onLogin={() => {}}
                      onLogout={() => {
                        setIsAdminView(false)
                      }}
                      isAuthenticated={isAuthenticated}
                    />
                    <Button
                      onClick={() => setIsAdminView(false)}
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-yellow-accent hover:text-salon"
                    >
                      <Home className="w-4 h-4" />
                      Volver al Sitio
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Content */}
            <div className="pt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Gestión de Citas
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notificaciones
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard">
                    <div className="space-y-6">
                      {/* Bienvenida */}
                      <div className="bg-gradient-to-r from-yellow-accent to-beige rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-medium text-salon">
                              ¡Bienvenido, {user.name}!
                            </h2>
                            <p className="text-neutral-dark mt-1">
                              Aquí tienes un resumen de las actividades de hoy
                            </p>
                          </div>
                          <div className="bg-white rounded-full p-3">
                            <User className="w-8 h-8 text-salon" />
                          </div>
                        </div>
                      </div>

                      {/* Estadísticas rápidas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg border border-neutral-medium p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-neutral-dark">Citas de Hoy</p>
                              <p className="text-2xl font-medium text-salon">{quickStats.totalToday}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                              <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-neutral-medium p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-neutral-dark">Pendientes</p>
                              <p className="text-2xl font-medium text-orange-600">{quickStats.pendingConfirmation}</p>
                            </div>
                            <div className="bg-orange-100 rounded-full p-3">
                              <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-neutral-medium p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-neutral-dark">Confirmadas Hoy</p>
                              <p className="text-2xl font-medium text-green-600">{quickStats.confirmedToday}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                              <Check className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-neutral-medium p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-neutral-dark">Ingresos Hoy</p>
                              <p className="text-2xl font-medium text-salon">Q{quickStats.revenueToday}</p>
                            </div>
                            <div className="bg-yellow-accent rounded-full p-3">
                              <span className="text-xl font-medium text-salon">Q</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones rápidas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border border-neutral-medium p-6">
                          <h3 className="text-lg font-medium text-salon mb-4">Acciones Rápidas</h3>
                          <div className="space-y-3">
                            <Button
                              onClick={() => setActiveTab("appointments")}
                              className="w-full justify-start bg-yellow-accent hover:bg-yellow-accent-hover text-salon"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Ver Todas las Citas
                            </Button>
                            <Button
                              onClick={() => setActiveTab("whatsapp")}
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Enviar Recordatorios
                            </Button>
                            <Button
                              onClick={() => setActiveTab("notifications")}
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              Centro de Notificaciones
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-neutral-medium p-6">
                          <h3 className="text-lg font-medium text-salon mb-4">Citas Próximas</h3>
                          <div className="space-y-3">
                            {appointments
                              .filter(apt => apt.status === 'confirmed')
                              .slice(0, 3)
                              .map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
                                  <div>
                                    <p className="font-medium text-salon">{apt.clientName}</p>
                                    <p className="text-sm text-neutral-dark">{apt.service}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-salon">{apt.time}</p>
                                    <p className="text-xs text-neutral-dark">{new Date(apt.date).toLocaleDateString('es-ES')}</p>
                                  </div>
                                </div>
                              ))}
                            {appointments.filter(apt => apt.status === 'confirmed').length === 0 && (
                              <p className="text-neutral-dark text-center py-4">No hay citas confirmadas</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="appointments">
                    <AdminPanel />
                  </TabsContent>

                  <TabsContent value="whatsapp">
                    <WhatsAppReminders
                      appointments={appointments}
                      onReminderSent={handleReminderSent}
                      onAppointmentUpdate={handleAppointmentUpdate}
                    />
                  </TabsContent>

                  <TabsContent value="notifications">
                    <div className="bg-white rounded-lg border border-neutral-medium p-6">
                      <h2 className="text-xl font-medium text-salon mb-6">Centro de Notificaciones</h2>
                      <p className="text-gray-600 mb-4">
                        Las notificaciones aparecen automáticamente en el panel superior. 
                        Puedes activar/desactivar los sonidos y gestionar todas las alertas desde allí.
                      </p>
                      <div className="flex justify-center">
                        <NotificationSystem onNewNotification={handleNewNotification} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
        
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              border: "1px solid var(--color-yellow-accent)",
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Admin Access Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <Button
            onClick={() => setIsAdminView(true)}
            className="bg-yellow-accent hover:bg-yellow-accent-hover text-salon rounded-full w-16 h-16 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
            size="icon"
          >
            <Settings className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
          </Button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-salon text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
              Panel de Administración
              <div className="absolute top-full right-4 border-4 border-transparent border-t-salon"></div>
            </div>
          </div>
          
          {/* Notification indicator */}
          {quickStats.pendingConfirmation > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium animate-pulse">
              {quickStats.pendingConfirmation}
            </div>
          )}
        </div>
      </div>
      
      <main>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid var(--color-yellow-accent)",
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppointmentsProvider>
        <AdminDashboard />
      </AppointmentsProvider>
    </AuthProvider>
  )
}