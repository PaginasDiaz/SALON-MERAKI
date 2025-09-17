import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, Award, Users, Clock } from 'lucide-react';

export function AboutSection() {
  const stats = [
    { icon: Star, label: 'Años de Experiencia', value: '15+' },
    { icon: Users, label: 'Clientes Satisfechos', value: '5000+' },
    { icon: Award, label: 'Premios Ganados', value: '12' },
    { icon: Clock, label: 'Horas de Servicio', value: '24/7' },
  ];

  const team = [
    {
      name: 'María González',
      role: 'Directora & Estilista Senior',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      specialties: ['Cortes', 'Color', 'Peinados de Novias']
    },
    {
      name: 'Ana Martínez',
      role: 'Colorista Experta',
      image: 'https://images.unsplash.com/photo-1594824388647-82b8b5417e7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      specialties: ['Balayage', 'Mechas', 'Corrección de Color']
    },
    {
      name: 'Carmen López',
      role: 'Especialista en Manicura',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      specialties: ['Nail Art', 'Pedicura Spa', 'Uñas Acrílicas']
    }
  ];

  return (
    <section id="acerca" className="py-20 bg-beige/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl text-salon mb-4">
            Acerca de Salon Meraki
          </h2>
          <p className="text-lg text-neutral-dark max-w-2xl mx-auto">
            Nuestra pasión por la belleza y el bienestar nos impulsa a crear experiencias únicas para cada cliente
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-2xl text-salon">Nuestra Historia</h3>
            <div className="space-y-4 text-neutral-dark">
              <p>
                Salon Meraki nació en 2009 con una visión clara: crear un espacio donde la belleza, 
                el bienestar y la atención personalizada se fusionen para ofrecer una experiencia 
                transformadora a cada cliente.
              </p>
              <p>
                El nombre "Meraki" proviene del griego y significa hacer algo con pasión, 
                creatividad y amor. Esta filosofía define cada servicio que ofrecemos, 
                desde el corte más simple hasta las transformaciones más complejas.
              </p>
              <p>
                A lo largo de más de una década, hemos construido una reputación basada en la 
                excelencia, la innovación y el compromiso con la satisfacción de nuestros clientes. 
                Nuestro equipo de profesionales altamente capacitados se mantiene a la vanguardia 
                de las últimas tendencias y técnicas.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Interior del Salon Meraki"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-accent rounded-full opacity-30"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full opacity-70"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center bg-white border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-salon" />
                </div>
                <div className="text-2xl text-salon mb-2">{stat.value}</div>
                <p className="text-neutral-dark text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Section */}
        <div>
          <h3 className="text-2xl text-salon text-center mb-12">Nuestro Equipo</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="bg-white border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[4/5] overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-salon mb-1">{member.name}</h4>
                    <p className="text-yellow-accent text-sm mb-4">{member.role}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, specIndex) => (
                        <span 
                          key={specIndex}
                          className="text-xs bg-neutral-light text-neutral-dark px-3 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}