
/**
 * Landing Page Component
 * 
 * This is the main landing page of the application that is shown to non-authenticated users.
 * It contains:
 * - Header with navigation
 * - Hero section
 * - Features section
 * - Call-to-action section
 * - Benefits section
 * - Footer
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageCircle, Users, CheckCircle } from 'lucide-react';

const Index = () => {
  // Add intersection observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Select all sections to animate
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-wfc-background">
      {/* Header with navigation links */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm backdrop-blur-sm sticky top-0 z-50">
        <div className="container-custom flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-xl font-bold text-wfc-purple transition-all duration-300 group-hover:text-wfc-purple-medium">
              WorkFlowConnect
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-wfc-purple transition-colors duration-300 dark:text-gray-200 dark:hover:text-wfc-purple">
              Iniciar Sesión
            </Link>
            <Link to="/register">
              <Button variant="default" className="bg-wfc-purple hover:bg-wfc-purple-medium animate-pulse-subtle">
                Registrarse
              </Button>
            </Link>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <Link to="/register">
              <Button variant="default" size="sm" className="bg-wfc-purple hover:bg-wfc-purple-medium mr-2">
                Registrarse
              </Button>
            </Link>
            <Link to="/login" className="text-sm text-gray-700 hover:text-wfc-purple dark:text-gray-200 dark:hover:text-wfc-purple">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section with main call-to-action */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-wfc-purple to-wfc-magenta text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTYgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="container-custom relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-right">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Conecta con los mejores profesionales freelance
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Publica tus proyectos o encuentra trabajo como freelancer en una plataforma diseñada para ti.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 stagger-animate">
                <Link to="/register">
                  <Button variant="glass" size="lg" className="w-full sm:w-auto bg-white text-wfc-purple hover:bg-gray-100 shadow-lg">
                    Registrarse Gratis
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block animate-fade-in">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                alt="Freelancers trabajando" 
                className="rounded-lg shadow-xl transform transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section highlighting platform capabilities */}
      <section className="py-16 bg-white dark:bg-gray-800 animate-on-scroll">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-wfc-purple dark:text-wfc-purple-light">
            Todo lo que necesitas en un solo lugar
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 stagger-animate">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-wfc-purple/10 text-wfc-purple mb-4 dark:bg-wfc-purple/20">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Propuestas de trabajo</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Publica tus proyectos o encuentra oportunidades que se ajusten a tus habilidades.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-wfc-purple/10 text-wfc-purple mb-4 dark:bg-wfc-purple/20">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Mensajería integrada</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comunícate fácilmente con clientes o freelancers a través de nuestro sistema de chat.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-wfc-purple/10 text-wfc-purple mb-4 dark:bg-wfc-purple/20">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Perfiles profesionales</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Crea tu perfil destacando tus habilidades y experiencia para atraer más oportunidades.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section encouraging sign up */}
      <section className="py-16 bg-wfc-background dark:bg-gray-900 animate-on-scroll">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-wfc-purple to-wfc-purple-medium rounded-lg p-8 md:p-12 text-white text-center shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Empieza a conectar con profesionales hoy mismo
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto text-white/90">
              Únete a nuestra comunidad de freelancers y empresas para impulsar tus proyectos o encontrar nuevas oportunidades.
            </p>
            <Link to="/register">
              <Button variant="glass" size="lg" className="bg-white text-wfc-purple hover:bg-gray-100 shadow-xl animate-pulse-subtle">
                Crear una cuenta gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Benefits Section listing advantages */}
      <section className="py-16 bg-white dark:bg-gray-800 animate-on-scroll">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 dark:text-white">
            Por qué elegir WorkFlowConnect
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-animate">
            <div className="flex items-start p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <CheckCircle className="h-5 w-5 text-wfc-purple mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1 dark:text-white">Sin comisiones</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  No cobramos comisiones por los proyectos que completes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <CheckCircle className="h-5 w-5 text-wfc-purple mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1 dark:text-white">Pagos seguros</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sistema de pagos seguro y protegido para todas las transacciones.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <CheckCircle className="h-5 w-5 text-wfc-purple mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1 dark:text-white">Soporte 24/7</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Equipo de soporte disponible para ayudarte cuando lo necesites.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <CheckCircle className="h-5 w-5 text-wfc-purple mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1 dark:text-white">Comunidad global</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Conecta con profesionales de todo el mundo en nuestra plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer with links and copyright */}
      <footer className="bg-gray-800 text-white py-12 dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">WorkFlowConnect</h3>
              <p className="text-gray-400 text-sm">
                La plataforma que conecta a profesionales freelance con oportunidades de trabajo en todo el mundo.
              </p>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Enlaces rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors duration-300">Inicio</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors duration-300">Registro</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors duration-300">Iniciar sesión</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Términos de servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Política de privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} WorkFlowConnect. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
