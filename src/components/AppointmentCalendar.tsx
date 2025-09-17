import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface CalendarAppointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  duration: number; // duración en minutos
}

interface DayAppointments {
  [date: string]: CalendarAppointment[];
}

// Mock data para el calendario
const mockCalendarData: DayAppointments = {
  '2025-08-15': [
    {
      id: "1",
      clientName: "María García",
      service: "Corte y Peinado",
      time: "10:00",
      status: "pending",
      duration: 60
    },
    {
      id: "2",
      clientName: "Ana López",
      service: "Tinte y Mechas",
      time: "14:30",
      status: "confirmed",
      duration: 120
    }
  ],
  '2025-08-16': [
    {
      id: "3",
      clientName: "Carmen Ruiz",
      service: "Manicura Francesa",
      time: "11:15",
      status: "pending",
      duration: 45
    }
  ],
  '2025-08-14': [
    {
      id: "4",
      clientName: "Laura Fernández",
      service: "Masaje Relajante",
      time: "16:00",
      status: "completed",
      duration: 60
    }
  ]
};

interface AppointmentCalendarProps {
  appointments: any[];
}

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateCalc = new Date(startDate);
    
    while (currentDateCalc <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(currentDateCalc));
      currentDateCalc.setDate(currentDateCalc.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(formatDate(new Date()));
  };

  const getDayAppointments = (date: Date) => {
    const dateKey = formatDate(date);
    return appointments.filter(apt => apt.date === dateKey) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-accent text-black';
      case 'confirmed': return 'bg-green-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const monthData = getMonthData();
  const selectedDateAppointments = selectedDate ? appointments.filter(apt => apt.date === selectedDate) || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-salon">
                <Calendar className="w-5 h-5" />
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoy
                </Button>
                <Button variant="outline" size="sm" onClick={goToPrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center text-sm text-neutral-dark">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {monthData.map((date, index) => {
                const dateKey = formatDate(date);
                const appointments = getDayAppointments(date);
                const isSelected = selectedDate === dateKey;
                const todayClass = isToday(date) ? 'bg-yellow-accent text-black' : '';
                const currentMonthClass = isCurrentMonth(date) ? 'text-salon' : 'text-neutral-dark';
                
                return (
                  <div
                    key={index}
                    className={`
                      p-2 h-20 border border-gray-200 rounded cursor-pointer hover:bg-neutral-light transition-colors
                      ${todayClass}
                      ${isSelected ? 'ring-2 ring-yellow-accent' : ''}
                    `}
                    onClick={() => setSelectedDate(dateKey)}
                  >
                    <div className={`text-sm ${currentMonthClass} mb-1`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {appointments.slice(0, 2).map((apt, i) => (
                        <div
                          key={i}
                          className="text-xs p-1 rounded bg-yellow-accent text-black truncate"
                        >
                          {apt.time} - {apt.clientName}
                        </div>
                      ))}
                      {appointments.length > 2 && (
                        <div className="text-xs text-neutral-dark">
                          +{appointments.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalles del día seleccionado */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-salon">
              {selectedDate ? formatDisplayDate(new Date(selectedDate)) : 'Selecciona una fecha'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                {selectedDateAppointments.length > 0 ? (
                  selectedDateAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-neutral-dark" />
                            <span className="text-salon">{appointment.time}</span>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status === 'pending' ? 'Pendiente' :
                             appointment.status === 'confirmed' ? 'Confirmada' :
                             appointment.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-neutral-dark" />
                          <span className="text-salon">{appointment.clientName}</span>
                        </div>
                        <div className="text-sm text-neutral-dark">
                          {appointment.service} ({appointment.duration} min)
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-neutral-dark">
                    No hay citas programadas para este día
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-dark">
                Selecciona una fecha en el calendario para ver las citas
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}