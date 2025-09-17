import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Configurar CORS y logging
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

// Cliente de Supabase con service role para operaciones del servidor
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

// Obtener todas las citas
app.get('/make-server-553e44d6/appointments', async (c) => {
  try {
    console.log('Fetching appointments...')
    
    // Obtener citas del KV store
    const appointments = await kv.getByPrefix('appointment:')
    console.log('Found appointments:', appointments)
    
    return c.json({ 
      success: true, 
      appointments: appointments || [] 
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return c.json({ 
      success: false, 
      error: 'Error al obtener las citas',
      appointments: [] 
    }, 500)
  }
})

// Crear una nueva cita
app.post('/make-server-553e44d6/appointments', async (c) => {
  try {
    const body = await c.req.json()
    console.log('Creating appointment with data:', body)
    
    const appointmentId = `appointment:${Date.now()}`
    const appointment = {
      id: appointmentId.replace('appointment:', ''),
      clientName: body.name || body.clientName,
      clientEmail: body.email || body.clientEmail,
      clientPhone: body.phone || body.clientPhone,
      service: body.serviceName || body.service,
      date: body.date,
      time: body.time,
      status: 'pending',
      notes: body.message || body.notes || '',
      totalPrice: body.price || body.totalPrice || 0,
      createdAt: new Date().toISOString(),
      reminderSent: false
    }
    
    // Guardar en KV store
    await kv.set(appointmentId, appointment)
    console.log('Appointment saved:', appointment)
    
    return c.json({ 
      success: true, 
      appointment,
      message: 'Cita creada exitosamente' 
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return c.json({ 
      success: false, 
      error: 'Error al crear la cita' 
    }, 500)
  }
})

// Actualizar una cita
app.put('/make-server-553e44d6/appointments/:id', async (c) => {
  try {
    const appointmentId = c.req.param('id')
    const updates = await c.req.json()
    console.log('Updating appointment:', appointmentId, 'with:', updates)
    
    // Obtener cita existente
    const existingAppointment = await kv.get(`appointment:${appointmentId}`)
    if (!existingAppointment) {
      return c.json({ 
        success: false, 
        error: 'Cita no encontrada' 
      }, 404)
    }
    
    // Actualizar cita
    const updatedAppointment = { ...existingAppointment, ...updates }
    await kv.set(`appointment:${appointmentId}`, updatedAppointment)
    
    console.log('Appointment updated:', updatedAppointment)
    
    return c.json({ 
      success: true, 
      appointment: updatedAppointment,
      message: 'Cita actualizada exitosamente' 
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return c.json({ 
      success: false, 
      error: 'Error al actualizar la cita' 
    }, 500)
  }
})

// Eliminar una cita
app.delete('/make-server-553e44d6/appointments/:id', async (c) => {
  try {
    const appointmentId = c.req.param('id')
    console.log('Deleting appointment:', appointmentId)
    
    // Verificar que existe
    const existingAppointment = await kv.get(`appointment:${appointmentId}`)
    if (!existingAppointment) {
      return c.json({ 
        success: false, 
        error: 'Cita no encontrada' 
      }, 404)
    }
    
    // Eliminar
    await kv.del(`appointment:${appointmentId}`)
    console.log('Appointment deleted:', appointmentId)
    
    return c.json({ 
      success: true, 
      message: 'Cita eliminada exitosamente' 
    })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return c.json({ 
      success: false, 
      error: 'Error al eliminar la cita' 
    }, 500)
  }
})

// Obtener servicios disponibles
app.get('/make-server-553e44d6/services', async (c) => {
  try {
    const services = [
      { id: '1', name: 'Corte de Cabello', price: 25, duration: 45, description: 'Corte personalizado según tu estilo' },
      { id: '2', name: 'Peinado Profesional', price: 20, duration: 30, description: 'Peinados para eventos especiales' },
      { id: '3', name: 'Tinte Completo', price: 45, duration: 120, description: 'Color uniforme y duradero' },
      { id: '4', name: 'Mechas & Balayage', price: 65, duration: 180, description: 'Técnicas modernas de iluminación' },
      { id: '5', name: 'Manicura Clásica', price: 15, duration: 30, description: 'Cuidado completo de uñas' },
      { id: '6', name: 'Pedicura Spa', price: 25, duration: 45, description: 'Relajación y cuidado de pies' }
    ]
    
    return c.json({ 
      success: true, 
      services 
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return c.json({ 
      success: false, 
      error: 'Error al obtener los servicios',
      services: [] 
    }, 500)
  }
})

// Obtener horarios disponibles
app.get('/make-server-553e44d6/available-slots/:date', async (c) => {
  try {
    const date = c.req.param('date')
    console.log('Fetching available slots for date:', date)
    
    // Obtener citas existentes para esa fecha
    const allAppointments = await kv.getByPrefix('appointment:')
    const appointmentsForDate = allAppointments.filter(apt => apt.date === date)
    
    // Horarios base disponibles
    const baseSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ]
    
    // Filtrar horarios ocupados
    const occupiedSlots = appointmentsForDate.map(apt => apt.time)
    const availableSlots = baseSlots.filter(slot => !occupiedSlots.includes(slot))
    
    return c.json({ 
      success: true, 
      availableSlots 
    })
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return c.json({ 
      success: false, 
      error: 'Error al obtener horarios disponibles',
      availableSlots: [] 
    }, 500)
  }
})

// Manejo de notificaciones
app.get('/make-server-553e44d6/notifications', async (c) => {
  try {
    const notifications = await kv.getByPrefix('notification:') || []
    return c.json({ 
      success: true, 
      notifications 
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return c.json({ 
      success: false, 
      error: 'Error al obtener notificaciones',
      notifications: [] 
    }, 500)
  }
})

// Marcar notificación como leída
app.put('/make-server-553e44d6/notifications/:id/read', async (c) => {
  try {
    const notificationId = c.req.param('id')
    const notification = await kv.get(`notification:${notificationId}`)
    
    if (notification) {
      await kv.set(`notification:${notificationId}`, { ...notification, read: true })
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return c.json({ success: false, error: 'Error al actualizar notificación' }, 500)
  }
})

// Health check
app.get('/make-server-553e44d6/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Salon Meraki API' 
  })
})

console.log('Salon Meraki server starting...')
console.log('Environment check:')
console.log('- SUPABASE_URL:', !!Deno.env.get('SUPABASE_URL'))
console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

Deno.serve(app.fetch)