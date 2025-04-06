
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageCircle, Users, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-wfc-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-wfc-purple">WorkFlowConnect</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-wfc-purple">Iniciar Sesión</Link>
            <Link to="/register">
              <Button variant="default" className="bg-wfc-purple hover:bg-wfc-purple-medium">
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
            <Link to="/login" className="text-sm text-gray-700 hover:text-wfc-purple">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-wfc-purple to-wfc-magenta text-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                Conecta con los mejores profesionales freelance
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Publica tus proyectos o encuentra trabajo como freelancer en una plataforma diseñada para ti.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="default" size="lg" className="w-full sm:w-auto bg-white text-wfc-purple hover:bg-gray-100">
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
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                alt="Freelancers trabajando" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-wfc-purple dark:text-wfc-purple-medium">
            Todo lo que necesitas en un solo lugar
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-wfc-purple/10 text-wfc-purple mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Propuestas de trabajo</h3>
              <p className="text-gray-600">
                Publica tus proyectos o encuentra oportunidades que se ajusten a tus habilidades.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-wfc-purple/10 text-wfc-purple mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mensajería integrada</h3>
              <p className="text-gray-600">
                Comunícate fácilmente con clientes o freelancers a través de nuestro sistema de chat.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-wfc-purple/10 text-wfc-purple mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Perfiles profesionales</h3>
              <p className="text-gray-600">
                Crea tu perfil destacando tus habilidades y experiencia para atraer más oportunidades.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-wfc-background">
        <div className="container-custom">
          <div className="bg-wfc-purple rounded-lg p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Empieza a conectar con profesionales hoy mismo
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto text-white/90">
              Únete a nuestra comunidad de freelancers y empresas para impulsar tus proyectos o encontrar nuevas oportunidades.
            </p>
            <Link to="/register">
              <Button variant="default" size="lg" className="bg-white text-wfc-purple hover:bg-gray-100">
                Crear una cuenta gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Por qué elegir WorkFlowConnect
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-wfc-purple mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Sin comisiones</h3>
                <p className="text-sm text-gray-600">
                  No cobramos comisiones por los proyectos que completes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-wfc-purple mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Pagos seguros</h3>
                <p className="text-sm text-gray-600">
                  Sistema de pagos seguro y protegido para todas las transacciones.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-wfc-purple mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Soporte 24/7</h3>
                <p className="text-sm text-gray-600">
                  Equipo de soporte disponible para ayudarte cuando lo necesites.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-wfc-purple mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Comunidad global</h3>
                <p className="text-sm text-gray-600">
                  Conecta con profesionales de todo el mundo en nuestra plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
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
                <li><Link to="/" className="hover:text-white">Inicio</Link></li>
                <li><Link to="/register" className="hover:text-white">Registro</Link></li>
                <li><Link to="/login" className="hover:text-white">Iniciar sesión</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Términos de servicio</a></li>
                <li><a href="#" className="hover:text-white">Política de privacidad</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
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
