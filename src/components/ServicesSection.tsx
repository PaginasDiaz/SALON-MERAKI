import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { BookingModal } from './BookingModal';

export function ServicesSection() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const serviceCategories = [
    {
      title: 'Corte & Peinado',
      services: [
        { id: '1', name: 'Corte de Cabello', price: 'Desde Q200', description: 'Corte personalizado según tu estilo' },
        { id: '2', name: 'Peinado Profesional', price: 'Desde Q150', description: 'Peinados para eventos especiales' },
        { id: '7', name: 'Tratamiento Capilar', price: 'Desde Q280', description: 'Hidratación y reparación profunda' },
      ]
    },
    {
      title: 'Color',
      services: [
        { id: '3', name: 'Tinte Completo', price: 'Desde Q350', description: 'Color uniforme y duradero' },
        { id: '4', name: 'Mechas & Balayage', price: 'Desde Q500', description: 'Técnicas modernas de iluminación' },
        { id: '8', name: 'Retoque de Raíces', price: 'Desde Q240', description: 'Mantenimiento de tu color' },
      ]
    },
    {
      title: 'Manicura & Pedicura',
      services: [
        { id: '5', name: 'Manicura Clásica', price: 'Desde Q120', description: 'Cuidado completo de uñas' },
        { id: '6', name: 'Pedicura Spa', price: 'Desde Q200', description: 'Relajación y cuidado de pies' },
        { id: '9', name: 'Uñas Decoradas', price: 'Desde Q160', description: 'Diseños personalizados' },
      ]
    }
  ];

  const popularServices = [
    {
      id: 'combo1',
      name: 'Corte + Color',
      price: 'Q500',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Transformación completa con nuestro servicio más popular'
    },
    {
      id: 'treatment1',
      name: 'Tratamiento Keratin',
      price: 'Q620',
      image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Alisado y nutrición profunda para cabello saludable'
    },
    {
      id: '5',
      name: 'Manicura Premium',
      price: 'Q200',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Cuidado luxury para uñas perfectas'
    }
  ];

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  return (
    <section id="servicios" className="py-20 bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl text-salon mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-neutral-dark max-w-2xl mx-auto">
            Descubre nuestra amplia gama de servicios profesionales diseñados para realzar tu belleza natural
          </p>
        </div>

        {/* Popular Services */}
        <div className="mb-16">
          <h3 className="text-2xl text-salon mb-8 text-center">Servicios Populares</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {popularServices.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-salon">{service.name}</h4>
                      <span className="text-yellow-accent text-lg">{service.price}</span>
                    </div>
                    <p className="text-neutral-dark text-sm mb-4">{service.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBookService(service)}
                      className="w-full border-yellow-accent text-salon hover:bg-yellow-accent hover:text-salon"
                    >
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Complete Services List */}
        <div className="grid lg:grid-cols-3 gap-8">
          {serviceCategories.map((category, index) => (
            <Card key={index} className="bg-white border-0 shadow-md">
              <CardContent className="p-8">
                <h3 className="text-salon mb-6 text-center">{category.title}</h3>
                <div className="space-y-4">
                  {category.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="border-b border-neutral-medium pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-salon">{service.name}</h4>
                        <span className="text-yellow-accent">{service.price}</span>
                      </div>
                      <p className="text-neutral-dark text-sm">{service.description}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-6 bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Ver Todos los Servicios
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Booking Button */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => setIsBookingOpen(true)}
            className="bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Reservar Cita Ahora
          </Button>
          <p className="text-neutral-dark text-sm mt-3">
            También puedes llamarnos directamente al (555) 123-4567
          </p>
        </div>

        {/* Booking Modal */}
        <BookingModal 
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          selectedService={selectedService}
        />
      </div>
    </section>
  );
}