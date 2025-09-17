import { useState } from 'react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Scissors, Sparkles, Heart } from 'lucide-react';
import { BookingModal } from './BookingModal';

export function HeroSection() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const scrollToServices = () => {
    const element = document.querySelector('#servicios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section id="inicio" className="relative min-h-screen flex items-center bg-gradient-to-br from-neutral-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-salon leading-tight">
                  Transforma tu 
                  <span className="text-yellow-accent block">belleza natural</span>
                </h1>
                <p className="text-lg text-neutral-dark max-w-lg">
                  En Salon Meraki, cada corte, cada color y cada tratamiento es una obra de arte. 
                  Descubre tu mejor versión con nuestro equipo de expertos estilistas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => setIsBookingOpen(true)}
                  className="bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0 px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Reservar Cita Ahora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={scrollToServices}
                  className="border-2 border-yellow-accent text-salon hover:bg-yellow-accent hover:text-salon px-8 py-3 rounded-full transition-all duration-200"
                >
                  Ver Servicios
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-accent rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Scissors className="w-6 h-6 text-salon" />
                  </div>
                  <p className="text-sm text-neutral-dark">Cortes Profesionales</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-accent rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Sparkles className="w-6 h-6 text-salon" />
                  </div>
                  <p className="text-sm text-neutral-dark">Tratamientos Premium</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-accent rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Heart className="w-6 h-6 text-salon" />
                  </div>
                  <p className="text-sm text-neutral-dark">Atención Personalizada</p>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-accent rounded-full"></div>
                  <span className="text-neutral-dark text-sm">15+ años de experiencia</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-accent rounded-full"></div>
                  <span className="text-neutral-dark text-sm">5000+ clientes satisfechos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-accent rounded-full"></div>
                  <span className="text-neutral-dark text-sm">Productos premium</span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Salon Meraki - Interior elegante del salón"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-accent rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-beige rounded-full opacity-30"></div>
              
              {/* Floating card with quick stats */}
              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl text-yellow-accent mb-1">4.9★</div>
                  <div className="text-xs text-neutral-dark">+200 reseñas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}