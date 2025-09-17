import { useState, useEffect } from "react";
import { Bell, Clock, Calendar, X, Check, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner@2.0.3";

interface Notification {
  id: string;
  type: 'upcoming' | 'reminder' | 'overdue' | 'confirmation';
  title: string;
  message: string;
  appointmentId: string;
  clientName: string;
  date: string;
  time: string;
  createdAt: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationCenterProps {
  appointments: any[];
}

export function NotificationCenter({ appointments }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    generateNotifications();
    const interval = setInterval(generateNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [appointments]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const generateNotifications = () => {
    const now = new Date();
    const newNotifications: Notification[] = [];

    appointments.forEach(appointment => {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Citas en las próximas 24 horas
      if (hoursDiff > 0 && hoursDiff <= 24 && appointment.status === 'confirmed') {
        newNotifications.push({
          id: `upcoming-${appointment.id}`,
          type: 'upcoming',
          title: 'Cita próxima',
          message: `${appointment.clientName} tiene cita en ${Math.ceil(hoursDiff)} horas`,
          appointmentId: appointment.id,
          clientName: appointment.clientName,
          date: appointment.date,
          time: appointment.time,
          createdAt: now,
          read: false,
          priority: hoursDiff <= 2 ? 'high' : 'medium'
        });
      }

      // Recordatorio 1 hora antes
      if (hoursDiff > 0 && hoursDiff <= 1 && appointment.status === 'confirmed') {
        newNotifications.push({
          id: `reminder-${appointment.id}`,
          type: 'reminder',
          title: 'Recordatorio inmediato',
          message: `${appointment.clientName} tiene cita en ${Math.ceil(hoursDiff * 60)} minutos`,
          appointmentId: appointment.id,
          clientName: appointment.clientName,
          date: appointment.date,
          time: appointment.time,
          createdAt: now,
          read: false,
          priority: 'high'
        });
      }

      // Citas atrasadas
      if (hoursDiff < 0 && appointment.status === 'confirmed') {
        newNotifications.push({
          id: `overdue-${appointment.id}`,
          type: 'overdue',
          title: 'Cita atrasada',
          message: `La cita de ${appointment.clientName} comenzó hace ${Math.ceil(Math.abs(hoursDiff))} horas`,
          appointmentId: appointment.id,
          clientName: appointment.clientName,
          date: appointment.date,
          time: appointment.time,
          createdAt: now,
          read: false,
          priority: 'high'
        });
      }

      // Citas pendientes de confirmación (más de 24 horas sin confirmar)
      if (appointment.status === 'pending') {
        const createdAt = new Date(appointment.createdAt);
        const pendingHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (pendingHours > 24) {
          newNotifications.push({
            id: `confirmation-${appointment.id}`,
            type: 'confirmation',
            title: 'Confirmar cita',
            message: `La cita de ${appointment.clientName} lleva ${Math.ceil(pendingHours)} horas sin confirmar`,
            appointmentId: appointment.id,
            clientName: appointment.clientName,
            date: appointment.date,
            time: appointment.time,
            createdAt: now,
            read: false,
            priority: 'medium'
          });
        }
      }
    });

    // Actualizar solo si hay cambios significativos
    const existingIds = new Set(notifications.map(n => n.id));
    const hasNewNotifications = newNotifications.some(n => !existingIds.has(n.id));
    
    if (hasNewNotifications) {
      setNotifications(prev => {
        const combined = [...prev, ...newNotifications.filter(n => !existingIds.has(n.id))];
        // Mantener solo las últimas 50 notificaciones
        return combined.slice(-50).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      });

      // Mostrar toast para notificaciones de alta prioridad
      newNotifications
        .filter(n => n.priority === 'high' && !existingIds.has(n.id))
        .forEach(notification => {
          toast.warning(notification.title, {
            description: notification.message,
          });
        });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'reminder': return <Bell className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'confirmation': return <Calendar className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'bg-red-100 border-red-200 text-red-800';
    if (type === 'upcoming') return 'bg-blue-100 border-blue-200 text-blue-800';
    if (type === 'reminder') return 'bg-yellow-100 border-yellow-200 text-yellow-800';
    if (type === 'overdue') return 'bg-red-100 border-red-200 text-red-800';
    if (type === 'confirmation') return 'bg-orange-100 border-orange-200 text-orange-800';
    return 'bg-gray-100 border-gray-200 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-green-500 text-white'
    };
    return (
      <Badge className={`text-xs ${colors[priority as keyof typeof colors]}`}>
        {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja'}
      </Badge>
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-salon">
                <Bell className="w-5 h-5" />
                Notificaciones ({notifications.length})
              </DialogTitle>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-neutral-dark">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-neutral-medium" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all ${
                      notification.read ? 'opacity-60' : 'opacity-100'
                    } ${getNotificationColor(notification.type, notification.priority)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-salon">
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-sm text-neutral-dark mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-neutral-dark">
                              <span>Cliente: {notification.clientName}</span>
                              <span>
                                {new Date(notification.date).toLocaleDateString('es-ES')} a las {notification.time}
                              </span>
                              <span>
                                {notification.createdAt.toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}