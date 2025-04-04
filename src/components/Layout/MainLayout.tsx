
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Briefcase, MessageCircle, User, Menu, X, LogOut, Plus } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: '/dashboard', label: 'Inicio', icon: Home },
    { path: '/jobs', label: 'Propuestas', icon: Briefcase },
    { path: '/chats', label: 'Mensajes', icon: MessageCircle },
    { path: '/profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-wfc-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-custom flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-wfc-purple">WorkFlowConnect</span>
          </Link>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-wfc-purple text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" /> 
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="default" 
              className="hidden md:flex bg-wfc-purple hover:bg-wfc-purple-medium" 
              onClick={() => navigate('/create-job')}
            >
              <Plus className="h-4 w-4 mr-1" /> Publicar propuesta
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.photoURL} alt={currentUser?.name} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button className="md:hidden" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white p-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isActive
                        ? 'bg-wfc-purple text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
              <Button 
                variant="default" 
                className="bg-wfc-purple hover:bg-wfc-purple-medium w-full mt-2" 
                onClick={() => {
                  navigate('/create-job');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Publicar propuesta
              </Button>
            </nav>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-grow container-custom py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container-custom text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} WorkFlowConnect. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
