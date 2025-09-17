import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { toast } from 'sonner@2.0.3';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: any;
}

export function BookingModal({ isOpen, onClose, selectedService }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceId: '',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addAppointment, isLoading } = useAppointments();

  useEffect(() => {
    if (isOpen) {
      loadServices();
      if (selectedService) {
        setFormData(prev => ({ ...prev, serviceId: selectedService.id }));
      }
    }
  }, [isOpen, selectedService]);

  useEffect(() => {
    if (formData.date) {
      loadAvailableSlots();
    }
  }, [formData.date]);

  const loadServices = async () => {
    // Usar servicios hardcodeados para mayor confiabilidad
    setServices([
      { id: '1', name: 'Corte de Cabello', price: 25, duration: 45, description: 'Corte personalizado según tu estilo' },
      { id: '2', name: 'Peinado Profesional', price: 20, duration: 30, description: 'Peinados para eventos especiales' },
      { id: '3', name: 'Tinte Completo', price: 45, duration: 120, description: 'Color uniforme y duradero' },
      { id: '4', name: 'Mechas & Balayage', price: 65, duration: 180, description: 'Técnicas modernas de iluminación' },
      { id: '5', name: 'Manicura Clásica', price: 15, duration: 30, description: 'Cuidado completo de uñas' },
      { id: '6', name: 'Pedicura Spa', price: 25, duration: 45, description: 'Relajación y cuidado de pies' }
    ]);
  };

  const loadAvailableSlots = async () => {
    // Usar horarios fijos para mayor confiabilidad
    setAvailableSlots([
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      console.log('🎯 Starting appointment submission...');
      
      // Preparar datos de la cita
      const selectedService = services.find(s => s.id === formData.serviceId);
      const appointmentData = {
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        service: selectedService?.name || 'Servicio seleccionado',
        date: formData.date,
        time: formData.time,
        status: 'pending' as const,
        notes: formData.message,
        totalPrice: selectedService?.price || 0
      };

      console.log('📝 Appointment data prepared:', appointmentData);

      // Usar el hook useAppointments para crear la cita
      const response = await addAppointment(appointmentData);
      console.log('📋 AddAppointment response:', response);
      
      if (response.success) {
        toast.success('¡Cita reservada exitosamente!', {
          description: 'Te contactaremos pronto para confirmar tu cita.',
        });
        
        console.log('✅ Appointment created successfully');
        handleClose();
      } else {
        throw new Error(response.error || 'Error al crear la cita');
      }
    } catch (error) {
      console.error('❌ Error submitting appointment:', error);
      
      toast.error('Error al crear la cita', {
        description: 'Por favor intenta nuevamente. Si el problema persiste, contacta al salón.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      serviceId: selectedService?.id || '',
      date: '',
      time: '',
      message: ''
    });
    setIsSubmitting(false);
    onClose();
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedServiceData = services.find(s => s.id === formData.serviceId);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Selecciona el servicio que necesitas para tu cita';
      case 2: return 'Elige la fecha y hora que mejor te convenga';
      case 3: return 'Completa tus datos personales para finalizar la reserva';
      default: return 'Proceso de reserva de cita en Salon Meraki';
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Seleccionar Servicio';
      case 2: return 'Fecha y Hora';
      case 3: return 'Información Personal';
      default: return 'Reservar Cita';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-salon">{getStepTitle()}</DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      num <= step
                        ? 'bg-yellow-accent text-salon'
                        : 'bg-neutral-medium text-neutral-dark'
                    }`}
                  >
                    {num}
                  </div>
                  {num < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        num < step ? 'bg-yellow-accent' : 'bg-neutral-medium'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg text-salon mb-2">Selecciona un Servicio</h3>
                  <p className="text-neutral-dark text-sm">Elige el servicio que necesitas</p>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {services.length > 0 ? (
                    services.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          formData.serviceId === service.id
                            ? 'border-yellow-accent bg-yellow-accent/10'
                            : 'border-neutral-medium hover:border-yellow-accent/50'
                        }`}
                        onClick={() => setFormData({ ...formData, serviceId: service.id })}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-salon">{service.name}</h4>
                            <p className="text-neutral-dark text-sm">{service.description}</p>
                            <p className="text-yellow-accent text-sm mt-1">{service.duration} minutos</p>
                          </div>
                          <span className="text-salon">${service.price}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-dark">Cargando servicios...</p>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.serviceId || services.length === 0}
                  className="w-full bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0"
                >
                  Continuar
                </Button>
              </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg text-salon mb-2">Fecha y Hora</h3>
                  <p className="text-neutral-dark text-sm">Selecciona cuando quieres tu cita</p>
                </div>

                <div>
                  <Label htmlFor="date" className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Fecha</span>
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {formData.date && (
                  <div>
                    <Label className="flex items-center space-x-2 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>Horario Disponible</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData({ ...formData, time: slot })}
                            className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                              formData.time === slot
                                ? 'border-yellow-accent bg-yellow-accent text-salon'
                                : 'border-neutral-medium hover:border-yellow-accent hover:bg-yellow-accent/10'
                            }`}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <p className="col-span-3 text-center text-neutral-dark text-sm py-4">
                          Cargando horarios disponibles...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedServiceData && (
                  <div className="bg-neutral-light p-4 rounded-lg">
                    <h4 className="text-salon mb-2">Resumen del Servicio</h4>
                    <div className="space-y-1 text-sm text-neutral-dark">
                      <p><span className="text-salon">Servicio:</span> {selectedServiceData.name}</p>
                      <p><span className="text-salon">Duración:</span> {selectedServiceData.duration} minutos</p>
                      <p><span className="text-salon">Precio:</span> ${selectedServiceData.price}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.date || !formData.time}
                    className="flex-1 bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Personal Information */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg text-salon mb-2">Información Personal</h3>
                  <p className="text-neutral-dark text-sm">Completa tus datos para finalizar la reserva</p>
                </div>

                <div>
                  <Label htmlFor="name" className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4" />
                    <span>Nombre Completo</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center space-x-2 mb-2">
                    <Phone className="w-4 h-4" />
                    <span>Teléfono</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Comentarios (Opcional)</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Cualquier comentario especial..."
                  />
                </div>

                <div className="bg-neutral-light p-4 rounded-lg">
                  <h4 className="text-salon mb-2">Resumen de tu Cita</h4>
                  <div className="space-y-1 text-sm text-neutral-dark">
                    <p><span className="text-salon">Servicio:</span> {selectedServiceData?.name}</p>
                    <p><span className="text-salon">Fecha:</span> {formData.date}</p>
                    <p><span className="text-salon">Hora:</span> {formData.time}</p>
                    <p><span className="text-salon">Duración:</span> {selectedServiceData?.duration} min</p>
                    <p><span className="text-salon">Precio:</span> ${selectedServiceData?.price}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || isSubmitting || !formData.name || !formData.email}
                    className="flex-1 bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0"
                  >
                    {isLoading || isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}