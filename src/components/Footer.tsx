import { MapPin, Phone, Mail, Instagram, Facebook, Heart } from 'lucide-react';

export function Footer() {
  const quickLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Acerca de', href: '#acerca' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const services = [
    'Corte de Cabello',
    'Tinte y Color',
    'Tratamientos Capilares',
    'Manicura y Pedicura',
    'Peinados para Eventos',
    'Maquillaje Profesional'
  ];

  return (
    <footer className="bg-salon-text text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl">
              <span className="text-yellow-accent">Salon</span> Meraki
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Transformamos tu belleza natural con pasión, creatividad y amor. 
              Más de 15 años creando experiencias únicas de belleza y bienestar.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-yellow-accent rounded-full flex items-center justify-center text-salon hover:bg-yellow-accent-hover transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-yellow-accent rounded-full flex items-center justify-center text-salon hover:bg-yellow-accent-hover transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg mb-4 text-yellow-accent">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-yellow-accent transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg mb-4 text-yellow-accent">Servicios</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="text-gray-300">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg mb-4 text-yellow-accent">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-yellow-accent mt-0.5 flex-shrink-0" />
                <div className="text-gray-300">
                  <p>Av. Principal 123</p>
                  <p>Centro, Ciudad</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-yellow-accent flex-shrink-0" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-accent flex-shrink-0" />
                <span className="text-gray-300">info@salonmeraki.com</span>
              </div>
            </div>

            {/* Hours */}
            <div className="mt-6">
              <h5 className="text-yellow-accent mb-2">Horarios</h5>
              <div className="text-gray-300 text-sm space-y-1">
                <p>Lun - Sáb: 9:00 AM - 8:00 PM</p>
                <p>Domingo: 10:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-600 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm">
              © 2024 Salon Meraki. Todos los derechos reservados.
            </div>
            
            <div className="flex items-center space-x-1 text-gray-300 text-sm">
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-yellow-accent" />
              <span>para tu belleza</span>
            </div>
            
            <div className="flex space-x-6 text-gray-300 text-sm">
              <a href="#" className="hover:text-yellow-accent transition-colors duration-200">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-yellow-accent transition-colors duration-200">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}