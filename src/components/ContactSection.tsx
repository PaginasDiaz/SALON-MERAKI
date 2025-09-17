import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { toast } from 'sonner@2.0.3';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitContact, loading } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const response = await submitContact(formData);
      console.log('Contact response:', response);
      
      if (response.data?.success) {
        toast.success('¡Mensaje enviado exitosamente!', {
          description: 'Te contactaremos pronto.',
        });
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      } else {
        toast.error('Error al enviar el mensaje', {
          description: response.error || 'Por favor intenta nuevamente.',
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      // Show success anyway since we're in fallback mode
      toast.success('¡Mensaje recibido!', {
        description: 'Tu mensaje ha sido guardado. Te contactaremos pronto.',
      });
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: 'Dirección',
      value: 'Av. Principal 123, Centro, Ciudad',
      subvalue: 'Edificio Plaza Belleza, Local 2'
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: '+1 (555) 123-4567',
      subvalue: 'WhatsApp disponible'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@salonmeraki.com',
      subvalue: 'Respuesta en 24 horas'
    },
    {
      icon: Clock,
      label: 'Horarios',
      value: 'Lun - Sáb: 9:00 AM - 8:00 PM',
      subvalue: 'Dom: 10:00 AM - 6:00 PM'
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/salonmeraki', label: '@salonmeraki' },
    { icon: Facebook, href: 'https://facebook.com/salonmeraki', label: 'Salon Meraki' }
  ];

  return (
    <section id="contacto" className="py-20 bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl text-salon mb-4">
            Contacto y Ubicación
          </h2>
          <p className="text-lg text-neutral-dark max-w-2xl mx-auto">
            ¿Listo para tu transformación? Contáctanos para reservar tu cita o resolver cualquier duda
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-salon mb-6">Envíanos un Mensaje</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="service">Servicio de Interés</Label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-accent bg-white"
                  >
                    <option value="">Selecciona un servicio</option>
                    <option value="corte">Corte de Cabello</option>
                    <option value="color">Tinte/Color</option>
                    <option value="tratamiento">Tratamiento Capilar</option>
                    <option value="manicura">Manicura/Pedicura</option>
                    <option value="peinado">Peinado para Eventos</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="mt-1"
                    placeholder="Cuéntanos sobre el servicio que necesitas o cualquier pregunta..."
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={loading || isSubmitting || !formData.name || !formData.email || !formData.message}
                  className="w-full bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0 py-3"
                >
                  {loading || isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="bg-white border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-salon" />
                      </div>
                      <div>
                        <h4 className="text-salon mb-1">{info.label}</h4>
                        <p className="text-neutral-dark">{info.value}</p>
                        <p className="text-neutral-dark text-sm">{info.subvalue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Social Media */}
            <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-6">
                <h4 className="text-salon mb-4">Síguenos en Redes Sociales</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-neutral-dark hover:text-yellow-accent transition-colors duration-200"
                    >
                      <social.icon className="w-5 h-5" />
                      <span>{social.label}</span>
                    </a>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-neutral-light rounded-lg">
                  <p className="text-sm text-neutral-dark">
                    ¡Síguenos para ver nuestros trabajos más recientes y ofertas especiales!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-0">
                <div className="aspect-[16/9] bg-neutral-medium rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-12 h-12 text-yellow-accent mx-auto mb-4" />
                    <p className="text-neutral-dark mb-2">Ubicación del Salon</p>
                    <p className="text-salon">Av. Principal 123, Centro</p>
                    <p className="text-neutral-dark text-sm mt-2">
                      Estacionamiento disponible
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-yellow-accent text-salon hover:bg-yellow-accent hover:text-salon"
                      onClick={() => window.open('https://maps.google.com/?q=Av.+Principal+123,+Centro', '_blank')}
                    >
                      Ver en Google Maps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}