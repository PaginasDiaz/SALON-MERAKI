import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

export interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  service: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  totalPrice: number
  createdAt: string
  reminderSent?: boolean
}

interface AppointmentsContextType {
  appointments: Appointment[]
  isLoading: boolean
  error: string | null
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string; data?: Appointment }>
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<{ success: boolean; error?: string }>
  deleteAppointment: (id: string) => Promise<{ success: boolean; error?: string }>
  refreshAppointments: () => Promise<void>
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined)

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasSupabaseConfig = () => {
    const anonKey = getSupabaseAnonKey()
    return !!anonKey && anonKey.length > 10
  }

  const getSupabaseUrl = () => {
    return 'https://sulsazdhkpawaibvvwwh.supabase.co'
  }

  const getSupabaseAnonKey = () => {
    return import.meta.env?.VITE_SUPABASE_ANON_KEY || ''
  }

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const anonKey = getSupabaseAnonKey()
      
      if (!anonKey || anonKey.length < 10) {
        // Modo offline - usar localStorage
        const stored = localStorage.getItem('salon_appointments')
        if (stored) {
          const localAppointments = JSON.parse(stored)
          setAppointments(localAppointments)
        } else {
          // Crear algunas citas de ejemplo para demostración
          const exampleAppointments: Appointment[] = [
            {
              id: 'demo-1',
              clientName: 'María García',
              clientEmail: 'maria@example.com',
              clientPhone: '12345678',
              service: 'Corte + Color',
              date: new Date().toISOString().split('T')[0],
              time: '10:00',
              status: 'pending',
              totalPrice: 500,
              createdAt: new Date().toISOString(),
              notes: 'Primera cita de demostración'
            },
            {
              id: 'demo-2',
              clientName: 'Ana López',
              clientEmail: 'ana@example.com',
              clientPhone: '87654321',
              service: 'Manicura Premium',
              date: new Date().toISOString().split('T')[0],
              time: '14:30',
              status: 'confirmed',
              totalPrice: 200,
              createdAt: new Date().toISOString(),
              notes: 'Cliente frecuente'
            }
          ]
          setAppointments(exampleAppointments)
          localStorage.setItem('salon_appointments', JSON.stringify(exampleAppointments))
        }
        setIsLoading(false)
        return
      }

      // Intentar conectar con Supabase con timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const url = `${getSupabaseUrl()}/functions/v1/make-server-553e44d6/appointments`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        const fetchedAppointments = data.appointments || []
        setAppointments(fetchedAppointments)
        // Guardar en localStorage como backup
        localStorage.setItem('salon_appointments', JSON.stringify(fetchedAppointments))
      } else {
        throw new Error(data.error || 'Error del servidor')
      }
    } catch (err) {
      // Fallback silencioso a localStorage
      const stored = localStorage.getItem('salon_appointments')
      if (stored) {
        const localAppointments = JSON.parse(stored)
        setAppointments(localAppointments)
      } else {
        setAppointments([])
      }
      
      // Solo mostrar error si no hay datos locales y no tenemos configuración
      if (!stored && !hasSupabaseConfig()) {
        setError('Modo offline - Los datos se guardan localmente')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      const newAppointment: Appointment = {
        ...appointmentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }

      // Siempre agregar localmente primero (optimistic update)
      const updatedAppointments = [...appointments, newAppointment]
      setAppointments(updatedAppointments)
      localStorage.setItem('salon_appointments', JSON.stringify(updatedAppointments))

      const anonKey = getSupabaseAnonKey()
      
      if (!anonKey || anonKey.length < 10) {
        // Modo offline puro
        return { success: true, data: newAppointment }
      }

      // Intentar sincronizar con Supabase en background
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/make-server-553e44d6/appointments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData),
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.appointment) {
            // Actualizar con la respuesta del servidor si es diferente
            const serverAppointment = data.appointment
            const finalAppointments = updatedAppointments.map(apt => 
              apt.id === newAppointment.id ? serverAppointment : apt
            )
            setAppointments(finalAppointments)
            localStorage.setItem('salon_appointments', JSON.stringify(finalAppointments))
            return { success: true, data: serverAppointment }
          }
        }
      } catch (error) {
        // Error silencioso - ya tenemos la cita guardada localmente
      }
      
      return { success: true, data: newAppointment }
    } catch (err) {
      console.error('❌ Critical error adding appointment:', err)
      return { success: false, error: 'Error al crear la cita' }
    }
  }

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      console.log('🔄 Updating appointment:', id, updates)
      
      const anonKey = getSupabaseAnonKey()
      
      // Actualizar inmediatamente en el estado local
      const updatedAppointments = appointments.map(apt => 
        apt.id === id ? { ...apt, ...updates } : apt
      )
      setAppointments(updatedAppointments)
      localStorage.setItem('salon_appointments', JSON.stringify(updatedAppointments))

      // Si no hay clave de API, solo usar localStorage (modo offline)
      if (!anonKey) {
        console.log('📱 No API key, using localStorage only')
        return { success: true }
      }

      // Intentar actualizar en Supabase
      try {
        console.log('🚀 Attempting to update in Supabase...')
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/make-server-553e44d6/appointments/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        })

        if (!response.ok) {
          console.log('⚠️ Supabase update failed, but localStorage already updated')
        } else {
          console.log('✅ Supabase update successful')
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update error (using localStorage fallback):', supabaseError)
      }
      
      return { success: true }
    } catch (err) {
      console.error('❌ Critical error updating appointment:', err)
      return { success: false, error: 'Error al actualizar la cita' }
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      console.log('🗑️ Deleting appointment:', id)
      
      const anonKey = getSupabaseAnonKey()
      
      // Actualizar inmediatamente en el estado local
      const updatedAppointments = appointments.filter(apt => apt.id !== id)
      setAppointments(updatedAppointments)
      localStorage.setItem('salon_appointments', JSON.stringify(updatedAppointments))

      // Si no hay clave de API, solo usar localStorage (modo offline)
      if (!anonKey) {
        console.log('📱 No API key, using localStorage only')
        return { success: true }
      }

      // Intentar eliminar en Supabase
      try {
        console.log('🚀 Attempting to delete in Supabase...')
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/make-server-553e44d6/appointments/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.log('⚠️ Supabase delete failed, but localStorage already updated')
        } else {
          console.log('✅ Supabase delete successful')
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete error (using localStorage fallback):', supabaseError)
      }
      
      return { success: true }
    } catch (err) {
      console.error('❌ Critical error deleting appointment:', err)
      return { success: false, error: 'Error al eliminar la cita' }
    }
  }

  const refreshAppointments = async () => {
    await fetchAppointments()
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  return (
    <AppointmentsContext.Provider value={{
      appointments,
      isLoading,
      error,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      refreshAppointments
    }}>
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointments() {
  const context = useContext(AppointmentsContext)
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider')
  }
  return context
}