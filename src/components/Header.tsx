import { useState } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { BookingModal } from './BookingModal';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const navItems = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Acerca de', href: '#acerca' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-neutral-medium z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl text-salon tracking-wide cursor-pointer" onClick={() => handleNavClick('#inicio')}>
                <span className="text-yellow-accent">Salon</span> Meraki
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-salon hover:text-yellow-accent transition-colors duration-200 cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* CTA Button - Desktop */}
            <div className="hidden md:block">
              <Button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0 px-6 py-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Reservar Cita
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-salon"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-neutral-medium">
              <div className="py-4 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="block w-full text-left text-salon hover:text-yellow-accent transition-colors duration-200 py-2"
                  >
                    {item.name}
                  </button>
                ))}
                <Button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsBookingOpen(true);
                  }}
                  className="w-full bg-yellow-accent hover:bg-yellow-accent-hover text-salon border-0 py-2 rounded-full transition-all duration-200 mt-4"
                >
                  Reservar Cita
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}