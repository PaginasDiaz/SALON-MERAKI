import { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Mail, Filter, Search, Check, X, Edit2, Eye, List, CalendarDays, Trash2, AlertTriangle, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AppointmentCalendar } from "./AppointmentCalendar";
import { NotificationCenter } from "./NotificationCenter";
import { AutoReminders, ReminderSettings } from "./AutoReminders";
import { toast } from "sonner@2.0.3";
import { useAppointments, type Appointment } from "../hooks/useAppointments";

export function AdminPanel() {
  const { appointments, updateAppointment, deleteAppointment, isLoading, error } = useAppointments();
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(appointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  // Estadísticas
  const stats = {
    total: appointments.length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    today: appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length
  };

  // Filtrar citas
  useEffect(() => {
    let filtered = appointments;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filtro por fecha
    if (dateFilter !== "all") {
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === "today") {
        filtered = filtered.filter(apt => apt.date === today);
      } else if (dateFilter === "tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(apt => apt.date === tomorrow.toISOString().split('T')[0]);
      } else if (dateFilter === "week") {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        filtered = filtered.filter(apt => new Date(apt.date) <= nextWeek);
      }
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    const result = await updateAppointment(appointmentId, { status: newStatus });
    if (result.success) {
      toast.success(`Cita ${newStatus === 'confirmed' ? 'confirmada' : newStatus === 'cancelled' ? 'cancelada' : 'actualizada'} correctamente`);
    } else {
      toast.error(result.error || 'Error al actualizar la cita');
    }
  };

  const handleEditAppointment = async (updatedAppointment: Appointment) => {
    const result = await updateAppointment(updatedAppointment.id, updatedAppointment);
    if (result.success) {
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
      toast.success("Cita actualizada correctamente");
    } else {
      toast.error(result.error || 'Error al actualizar la cita');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    const appointmentToDelete = appointments.find(apt => apt.id === appointmentId);
    if (appointmentToDelete) {
      const result = await deleteAppointment(appointmentId);
      if (result.success) {
        toast.success(`Cita de ${appointmentToDelete.clientName} eliminada correctamente`);
      } else {
        toast.error(result.error || 'Error al eliminar la cita');
      }
    }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-salon mb-2">Panel de Administración - Salon Meraki</h1>
              <p className="text-neutral-dark">Gestiona las citas y reservas de tu salón</p>
            </div>
            <NotificationCenter appointments={appointments} />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-dark">Total de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-salon">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-dark">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-salon">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-dark">Confirmadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-salon">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-dark">Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-salon">{stats.today}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-salon">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-dark" />
                <Input
                  placeholder="Buscar por nombre, servicio o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="tomorrow">Mañana</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para alternar entre vista de lista y calendario */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Lista de Citas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {/* Lista de citas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-salon">
                  Citas ({filteredAppointments.length})
                  {isLoading && <span className="text-sm text-neutral-dark ml-2">(Cargando...)</span>}
                  {error && <span className="text-sm text-red-500 ml-2">({error})</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8 text-neutral-dark">
                      Cargando citas...
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-8 text-neutral-dark">
                      {appointments.length === 0 
                        ? "No hay citas registradas aún"
                        : "No se encontraron citas con los filtros aplicados"
                      }
                    </div>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-salon">{appointment.clientName}</h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusText(appointment.status)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-neutral-dark">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(appointment.date).toLocaleDateString('es-ES')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {appointment.service}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-salon">Q{appointment.totalPrice}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            {appointment.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            
                            {/* Botón de eliminar con confirmación */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2 text-salon">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    ¿Eliminar cita?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que deseas eliminar permanentemente la cita de{' '}
                                    <span className="font-semibold">{appointment.clientName}</span> programada para el{' '}
                                    <span className="font-semibold">
                                      {new Date(appointment.date).toLocaleDateString('es-ES')} a las {appointment.time}
                                    </span>?
                                    <br />
                                    <br />
                                    Esta acción no se puede deshacer y se perderán todos los datos asociados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar Cita
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <AppointmentCalendar appointments={appointments} />
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-salon">Recordatorios Automáticos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reminders-toggle" className="text-sm">
                        Activar recordatorios automáticos
                      </Label>
                      <Button
                        variant={remindersEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setRemindersEnabled(!remindersEnabled);
                          toast.success(
                            remindersEnabled 
                              ? "Recordatorios automáticos desactivados" 
                              : "Recordatorios automáticos activados"
                          );
                        }}
                      >
                        {remindersEnabled ? "Activado" : "Desactivado"}
                      </Button>
                    </div>
                    <ReminderSettings onSettingsChange={(settings) => console.log(settings)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-salon">Estadísticas del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-dark">Recordatorios enviados hoy:</span>
                      <Badge variant="secondary">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-dark">Citas próximas (24h):</span>
                      <Badge variant="secondary">
                        {appointments.filter(apt => {
                          const appointmentDate = new Date(`${apt.date}T${apt.time}`);
                          const now = new Date();
                          const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                          return hoursDiff > 0 && hoursDiff <= 24 && apt.status === 'confirmed';
                        }).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-dark">Citas pendientes:</span>
                      <Badge variant="secondary">
                        {appointments.filter(apt => apt.status === 'pending').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-dark">Última actualización:</span>
                      <span className="text-xs text-neutral-dark">
                        {new Date().toLocaleTimeString('es-ES')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Componente de recordatorios automáticos */}
        <AutoReminders 
          appointments={appointments} 
          isActive={remindersEnabled} 
        />

        {/* Modal de visualización */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-salon">Detalles de la Cita</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <div className="mt-1 text-salon">{selectedAppointment.clientName}</div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="mt-1 text-neutral-dark">{selectedAppointment.clientEmail}</div>
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <div className="mt-1 text-neutral-dark">{selectedAppointment.clientPhone}</div>
                </div>
                <div>
                  <Label>Servicio</Label>
                  <div className="mt-1 text-salon">{selectedAppointment.service}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha</Label>
                    <div className="mt-1 text-neutral-dark">
                      {new Date(selectedAppointment.date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div>
                    <Label>Hora</Label>
                    <div className="mt-1 text-neutral-dark">{selectedAppointment.time}</div>
                  </div>
                </div>
                <div>
                  <Label>Estado</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedAppointment.status)}>
                      {getStatusText(selectedAppointment.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Precio Total</Label>
                  <div className="mt-1 text-salon">Q{selectedAppointment.totalPrice}</div>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <Label>Notas</Label>
                    <div className="mt-1 text-neutral-dark">{selectedAppointment.notes}</div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edición */}
        <EditAppointmentDialog
          appointment={selectedAppointment}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedAppointment(null);
          }}
          onSave={handleEditAppointment}
        />
      </div>
    </div>
  );
}

// Componente para editar citas
function EditAppointmentDialog({
  appointment,
  isOpen,
  onClose,
  onSave
}: {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
}) {
  const [formData, setFormData] = useState<Appointment | null>(null);

  useEffect(() => {
    if (appointment) {
      setFormData({ ...appointment });
    }
  }, [appointment]);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-salon">Editar Cita</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientName">Nombre del Cliente</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="clientPhone">Teléfono</Label>
            <Input
              id="clientPhone"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="service">Servicio</Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Appointment['status']) => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="totalPrice">Precio Total</Label>
            <Input
              id="totalPrice"
              type="number"
              value={formData.totalPrice}
              onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-yellow-accent hover:bg-yellow-accent-hover text-salon">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}