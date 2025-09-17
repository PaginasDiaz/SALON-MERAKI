import { useState } from 'react'
import { Send, MessageCircle, Clock, Check, X, AlertCircle, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { toast } from 'sonner@2.0.3'

interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  service: string
  date: string
  time: string
  status: string
}

interface WhatsAppRemindersProps {
  appointments: Appointment[]
  onReminderSent?: (appointmentId: string) => void
  onAppointmentUpdate?: (appointmentId: string, status: string) => void
}

export function WhatsAppReminders({ appointments, onReminderSent, onAppointmentUpdate }: WhatsAppRemindersProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('confirmation')
  const [isLoading, setIsLoading] = useState(false)
  const [sentReminders, setSentReminders] = useState<string[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [alternativeTime, setAlternativeTime] = useState('')
  const [alternativeDate, setAlternativeDate] = useState('')

  // Templates de mensajes predefinidos
  const messageTemplates = {
    confirmation: {
      name: 'Confirmación de Cita',
      template: '¡Hola {{clientName}}! 🌟\n\nTe confirmamos tu cita para {{service}} el {{date}} a las {{time}} en Salon Meraki.\n\n📍 Ubicación: [Dirección del salón]\n💰 Precio: Q{{price}}\n\n¡Te esperamos! Si necesitas reagendar, responde a este mensaje.\n\nSalon Meraki ✨'
    },
    reminder_24h: {
      name: 'Recordatorio 24h',
      template: '¡Hola {{clientName}}! ⏰\n\nTe recordamos que mañana tienes tu cita para {{service}} a las {{time}} en Salon Meraki.\n\n¿Todo listo para tu momento de relajación? Si necesitas hacer algún cambio, contáctanos cuanto antes.\n\n¡Nos vemos mañana! 💫\nSalon Meraki'
    },
    reminder_2h: {
      name: 'Recordatorio 2h',
      template: '¡Hola {{clientName}}! 🕐\n\nTu cita para {{service}} es en 2 horas ({{time}}).\n\nRecuerda:\n• Llegar 10 min antes\n• Traer cabello limpio (si aplica)\n• Relajarte y disfrutar\n\n¡Te esperamos en Salon Meraki! ✨'
    },
    confirm_appointment: {
      name: 'Confirmar Cita',
      template: '¡Hola {{clientName}}! 📅\n\nTu cita para {{service}} ha sido CONFIRMADA para el {{date}} a las {{time}} en Salon Meraki.\n\n✅ Estado: CONFIRMADO\n💰 Precio: Q{{price}}\n📍 Ubicación: [Dirección del salón]\n\n¡Esperamos verte pronto! 💫\nSalon Meraki'
    },
    reject_appointment: {
      name: 'Reagendar Cita',
      template: '¡Hola {{clientName}}! 📅\n\nLamentamos que no puedas asistir a tu cita del {{date}} a las {{time}}.\n\n¿Te gustaría reagendar? Tenemos disponibilidad:\n📅 {{alternativeDate}} a las {{alternativeTime}}\n\nResponde a este mensaje para confirmar el nuevo horario.\n\nSalon Meraki ✨'
    },
    custom: {
      name: 'Mensaje Personalizado',
      template: ''
    }
  }

  // Generar mensaje desde template
  const generateMessage = (template: string, appointment: Appointment, options?: { alternativeDate?: string, alternativeTime?: string }) => {
    return template
      .replace(/{{clientName}}/g, appointment.clientName)
      .replace(/{{service}}/g, appointment.service)
      .replace(/{{date}}/g, new Date(appointment.date).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
      .replace(/{{time}}/g, appointment.time)
      .replace(/{{price}}/g, '450') // Precio por defecto en quetzales
      .replace(/{{alternativeDate}}/g, options?.alternativeDate || '')
      .replace(/{{alternativeTime}}/g, options?.alternativeTime || '')
  }

  // Crear enlace de WhatsApp
  const createWhatsAppLink = (phoneNumber: string, message: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/502${cleanPhone}?text=${encodedMessage}`
  }

  // Enviar recordatorio por WhatsApp (enlace directo)
  const sendWhatsAppReminder = () => {
    if (!selectedAppointment) return

    try {
      setIsLoading(true)

      const message = messageTemplate === 'custom' 
        ? customMessage 
        : generateMessage(messageTemplates[messageTemplate].template, selectedAppointment)

      if (!message.trim()) {
        toast.error('El mensaje no puede estar vacío')
        return
      }

      // Validar número de teléfono
      const phoneNumber = selectedAppointment.clientPhone.replace(/\D/g, '')
      if (phoneNumber.length < 8) {
        toast.error('Número de teléfono inválido')
        return
      }

      // Crear enlace de WhatsApp y abrirlo
      const whatsappLink = createWhatsAppLink(phoneNumber, message)
      window.open(whatsappLink, '_blank')

      toast.success('¡Enlace de WhatsApp abierto!', {
        description: `Mensaje listo para ${selectedAppointment.clientName}`
      })
      
      setSentReminders(prev => [...prev, selectedAppointment.id])
      onReminderSent?.(selectedAppointment.id)
      
      // Limpiar formulario
      setSelectedAppointment(null)
      setCustomMessage('')
      setMessageTemplate('confirmation')
    } catch (error) {
      console.error('WhatsApp link error:', error)
      toast.error('Error al abrir WhatsApp')
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmar cita
  const confirmAppointment = () => {
    if (!selectedAppointment) return

    const message = generateMessage(messageTemplates.confirm_appointment.template, selectedAppointment)
    const whatsappLink = createWhatsAppLink(selectedAppointment.clientPhone, message)
    
    // Actualizar estado de la cita
    onAppointmentUpdate?.(selectedAppointment.id, 'confirmed')
    
    // Abrir WhatsApp
    window.open(whatsappLink, '_blank')
    
    toast.success('Cita confirmada y mensaje enviado por WhatsApp')
    setShowConfirmDialog(false)
    setSelectedAppointment(null)
  }

  // Rechazar cita y sugerir nuevo horario
  const rejectAppointment = () => {
    if (!selectedAppointment || !alternativeDate || !alternativeTime) {
      toast.error('Por favor completa la fecha y hora alternativa')
      return
    }

    const message = generateMessage(
      messageTemplates.reject_appointment.template, 
      selectedAppointment,
      { alternativeDate, alternativeTime }
    )
    const whatsappLink = createWhatsAppLink(selectedAppointment.clientPhone, message)
    
    // Actualizar estado de la cita
    onAppointmentUpdate?.(selectedAppointment.id, 'cancelled')
    
    // Abrir WhatsApp
    window.open(whatsappLink, '_blank')
    
    toast.success('Respuesta enviada por WhatsApp con horario alternativo')
    setShowRejectDialog(false)
    setSelectedAppointment(null)
    setAlternativeDate('')
    setAlternativeTime('')
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 8) {
      return `+502 ${cleaned.slice(-8).replace(/(\d{4})(\d{4})/, '$1 $2')}`
    }
    return phone
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            Gestión de Citas por WhatsApp
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Selector de cita */}
          <div>
            <Label htmlFor="appointment-select">Seleccionar Cita</Label>
            <Select onValueChange={(value) => {
              const appointment = appointments.find(a => a.id === value)
              setSelectedAppointment(appointment || null)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una cita..." />
              </SelectTrigger>
              <SelectContent>
                {appointments
                  .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
                  .map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{appointment.clientName} - {appointment.service}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString('es-ES')} {appointment.time}
                          </span>
                          {sentReminders.includes(appointment.id) && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Enviado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAppointment && (
            <>
              <Card className="bg-neutral-light">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Cliente:</strong> {selectedAppointment.clientName}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {formatPhone(selectedAppointment.clientPhone)}
                    </div>
                    <div>
                      <strong>Servicio:</strong> {selectedAppointment.service}
                    </div>
                    <div>
                      <strong>Fecha/Hora:</strong> {new Date(selectedAppointment.date).toLocaleDateString('es-ES')} - {selectedAppointment.time}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de acción para citas pendientes */}
              {selectedAppointment.status === 'pending' && (
                <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Cita
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    No Aceptar
                  </Button>
                </div>
              )}

              {/* Selector de template para recordatorios regulares */}
              <div>
                <Label htmlFor="template-select">Template de Mensaje</Label>
                <Select value={messageTemplate} onValueChange={setMessageTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(messageTemplates)
                      .filter(([key]) => !['confirm_appointment', 'reject_appointment'].includes(key))
                      .map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vista previa o mensaje personalizado */}
              <div>
                <Label htmlFor="message-content">
                  {messageTemplate === 'custom' ? 'Mensaje Personalizado' : 'Vista Previa del Mensaje'}
                </Label>
                {messageTemplate === 'custom' ? (
                  <Textarea
                    id="message-content"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Escribe tu mensaje personalizado..."
                    rows={6}
                  />
                ) : (
                  <Textarea
                    id="message-content"
                    value={generateMessage(messageTemplates[messageTemplate].template, selectedAppointment)}
                    readOnly
                    rows={6}
                    className="bg-gray-50"
                  />
                )}
              </div>

              {/* Botón de enviar */}
              <div className="flex gap-3">
                <Button
                  onClick={sendWhatsAppReminder}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar por WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Configuración de WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-500" />
            Sistema de Enlaces WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Recordatorios por WhatsApp</h4>
            <p className="text-sm text-green-700 mb-3">
              Los recordatorios funcionan mediante enlaces directos de WhatsApp que abren la aplicación con un mensaje predefinido.
            </p>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>✅ No requiere configuración de APIs</li>
              <li>✅ Compatible con WhatsApp Web y móvil</li>
              <li>✅ Mensajes personalizados automáticos</li>
              <li>✅ Confirmación y rechazo de citas</li>
            </ul>
            <p className="text-xs text-green-600 mt-3">
              Solo necesitas el número de teléfono del cliente para enviar el recordatorio.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal para confirmar cita */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              Confirmar Cita
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>¿Confirmar la cita de <strong>{selectedAppointment?.clientName}</strong> para {selectedAppointment?.service}?</p>
            <p className="text-sm text-gray-600">
              Se enviará un mensaje de confirmación por WhatsApp y se actualizará el estado de la cita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmAppointment} className="bg-green-500 hover:bg-green-600 text-white">
              Confirmar y Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para rechazar cita */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Reagendar Cita
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Proponer nuevo horario para <strong>{selectedAppointment?.clientName}</strong>:</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alt-date">Fecha Alternativa</Label>
                <Input
                  id="alt-date"
                  type="date"
                  value={alternativeDate}
                  onChange={(e) => setAlternativeDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="alt-time">Hora Alternativa</Label>
                <Input
                  id="alt-time"
                  type="time"
                  value={alternativeTime}
                  onChange={(e) => setAlternativeTime(e.target.value)}
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Se enviará un mensaje por WhatsApp con el horario alternativo y se cancelará la cita original.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={rejectAppointment} variant="destructive">
              Enviar Propuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}