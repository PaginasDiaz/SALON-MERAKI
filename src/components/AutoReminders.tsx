import { useEffect } from "react";
import { toast } from "sonner@2.0.3";
import { Clock, Bell, AlertTriangle } from "lucide-react";

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
}

interface AutoRemindersProps {
  appointments: Appointment[];
  isActive: boolean;
}

export function AutoReminders({ appointments, isActive }: AutoRemindersProps) {
  useEffect(() => {
    if (!isActive) return;

    const checkReminders = () => {
      const now = new Date();
      
      appointments.forEach(appointment => {
        if (appointment.status !== 'confirmed') return;
        
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Recordatorio 24 horas antes
        if (hoursDiff > 23.9 && hoursDiff <= 24.1) {
          toast.info("Recordatorio: Cita en 24 horas", {
            description: `${appointment.clientName} - ${appointment.service} a las ${appointment.time}`,
            icon: <Clock className="w-4 h-4" />,
            duration: 8000,
          });
        }

        // Recordatorio 2 horas antes
        if (hoursDiff > 1.9 && hoursDiff <= 2.1) {
          toast.warning("Recordatorio: Cita en 2 horas", {
            description: `${appointment.clientName} - ${appointment.service} a las ${appointment.time}`,
            icon: <Bell className="w-4 h-4" />,
            duration: 10000,
          });
        }

        // Recordatorio 30 minutos antes
        if (minutesDiff > 29 && minutesDiff <= 31) {
          toast.warning("¡Cita próxima!", {
            description: `${appointment.clientName} tiene cita en 30 minutos - ${appointment.service}`,
            icon: <AlertTriangle className="w-4 h-4" />,
            duration: 15000,
            action: {
              label: "Preparar",
              onClick: () => console.log("Preparando para la cita...")
            }
          });
        }

        // Alerta: Cita comenzando ahora
        if (minutesDiff >= -1 && minutesDiff <= 1) {
          toast.error("¡Cita comenzando ahora!", {
            description: `${appointment.clientName} - ${appointment.service}`,
            icon: <AlertTriangle className="w-4 h-4" />,
            duration: 20000,
            action: {
              label: "Marcar como iniciada",
              onClick: () => {
                // En una app real, actualizaríamos el estado de la cita
                toast.success("Cita marcada como iniciada");
              }
            }
          });
        }

        // Alerta: Cita atrasada
        if (minutesDiff < -15) {
          const minutesLate = Math.abs(Math.floor(minutesDiff));
          toast.error(`Cita atrasada ${minutesLate} minutos`, {
            description: `${appointment.clientName} - ${appointment.service}`,
            icon: <AlertTriangle className="w-4 h-4" />,
            duration: 25000,
            action: {
              label: "Contactar cliente",
              onClick: () => {
                // En una app real, podríamos abrir WhatsApp o el dialer
                toast.info(`Contactando a ${appointment.clientName}`);
              }
            }
          });
        }
      });
    };

    // Verificar recordatorios cada minuto
    const interval = setInterval(checkReminders, 60000);
    
    // Verificar inmediatamente al cargar
    checkReminders();

    return () => clearInterval(interval);
  }, [appointments, isActive]);

  // Este componente no renderiza nada visible
  return null;
}

// Hook personalizado para gestionar recordatorios de manera más avanzada
export function useAppointmentReminders(appointments: Appointment[]) {
  useEffect(() => {
    // Configurar notificaciones del navegador si están disponibles
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast.success("Notificaciones del navegador activadas");
        }
      });
    }
  }, []);

  const sendBrowserNotification = (title: string, body: string, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico', // Asegúrate de tener un favicon
        badge: '/favicon.ico',
        tag: 'salon-reminder',
        requireInteraction: true,
        ...options
      });
    }
  };

  const scheduleReminder = (appointment: Appointment, minutesBefore: number) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const reminderTime = new Date(appointmentDateTime.getTime() - (minutesBefore * 60 * 1000));
    const now = new Date();

    if (reminderTime > now) {
      const timeoutMs = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        const title = `Cita en ${minutesBefore} minutos`;
        const body = `${appointment.clientName} - ${appointment.service}`;
        
        sendBrowserNotification(title, body);
        toast.warning(title, {
          description: body,
          duration: 10000,
        });
      }, timeoutMs);
    }
  };

  return {
    sendBrowserNotification,
    scheduleReminder
  };
}

// Componente para configurar recordatorios personalizados
export function ReminderSettings({ onSettingsChange }: { onSettingsChange: (settings: any) => void }) {
  const defaultSettings = {
    enabled: true,
    browserNotifications: true,
    reminderTimes: [24 * 60, 2 * 60, 30, 0], // en minutos antes de la cita
    emailReminders: false,
    smsReminders: false
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h4 className="text-salon">Configuración de Recordatorios</h4>
      <div className="space-y-2 text-sm text-neutral-dark">
        <p>• 24 horas antes: Recordatorio informativo</p>
        <p>• 2 horas antes: Recordatorio de preparación</p>
        <p>• 30 minutos antes: Alerta próxima</p>
        <p>• Al comenzar: Notificación inmediata</p>
        <p>• Retraso: Alertas de seguimiento</p>
      </div>
      <p className="text-xs text-neutral-dark">
        Los recordatorios se activarán automáticamente según estos intervalos para ayudarte a gestionar mejor tu agenda.
      </p>
    </div>
  );
}