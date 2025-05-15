
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, LayoutDashboard, Briefcase, MessageCircle, User, LogOut, Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    setMounted(true);
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const navLinks = [
    { path: '/dashboard', label: 'Inicio', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/jobs', label: 'Propuestas', icon: <Briefcase className="h-5 w-5" /> },
    { path: '/chats', label: 'Mensajes', icon: <MessageCircle className="h-5 w-5" /> },
    { path: '/profile', label: 'Perfil', icon: <User className="h-5 w-5" /> },
  ];
  
  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

  const isActive = (path: string) => {
    // Mejoramos la lógica para rutas anidadas
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-background">
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-sidebar-background border-r border-border shadow-md transform transition-all duration-300 ease-in-out
          ${isMobile ? (sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full') : 'translate-x-0'}
          ${!isMobile && sidebarCollapsed ? 'w-16' : 'w-64'}
          md:relative
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard" className={`flex items-center space-x-2 ${sidebarCollapsed && !isMobile ? 'justify-center' : ''} group`}>
              <div className="w-8 h-8 rounded-md bg-wfc-purple flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:shadow-lg">
                <span className="text-white font-bold">WFC</span>
              </div>
              {(!sidebarCollapsed || isMobile) && (
                <span className="text-lg font-bold text-sidebar-foreground group-hover:text-wfc-purple transition-colors duration-300">WorkFlow Connect</span>
              )}
            </Link>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="transition-transform active:scale-95">
                <X className="h-5 w-5" />
              </Button>
            )}
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="hover:bg-sidebar-accent/50 transition-transform active:scale-95"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
          
          <Separator />
          
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navLinks.map((link, index) => (
                <button
                  key={link.path}
                  onClick={() => handleNavigation(link.path)}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300
                    ${isActive(link.path) 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}
                    ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
                    transform hover:-translate-y-0.5 active:translate-y-0
                  `}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {link.icon}
                  {(!sidebarCollapsed || isMobile) && <span className="ml-3">{link.label}</span>}
                </button>
              ))}
              
              <button
                onClick={() => handleNavigation('/jobs/create')}
                className={`
                  w-full flex items-center px-3 py-2 mt-4 rounded-md text-sm font-medium bg-sidebar-primary text-sidebar-primary-foreground hover:bg-wfc-purple-medium transition-all duration-300 shadow-sm hover:shadow-md
                  ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
                  transform hover:-translate-y-0.5 active:translate-y-0
                `}
              >
                <Plus className="h-5 w-5" />
                {(!sidebarCollapsed || isMobile) && <span className="ml-3">Nueva propuesta</span>}
              </button>
            </nav>
          </div>
          
          <div className={`p-4 flex items-center ${sidebarCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
            {(!sidebarCollapsed || isMobile) ? (
              <>
                <div className="flex items-center flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-1.5 flex items-center space-x-2 w-full transition-all hover:bg-sidebar-accent/50">
                        <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-wfc-purple/30">
                          <AvatarImage src={currentUser?.photoURL} />
                          <AvatarFallback className="bg-wfc-purple-medium text-white">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{currentUser?.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                      <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer transition-colors hover:bg-accent">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer transition-colors hover:bg-accent">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <ThemeToggle />
              </>
            ) : (
              <Avatar 
                className="h-8 w-8 cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-offset-2 hover:ring-wfc-purple/30" 
                onClick={() => setSidebarCollapsed(false)}
              >
                <AvatarImage src={currentUser?.photoURL} />
                <AvatarFallback className="bg-wfc-purple-medium text-white">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {isMobile && (
          <header className="bg-background border-b border-border p-4 flex items-center justify-between shadow-sm">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className="transition-transform active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-md bg-wfc-purple flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold">WFC</span>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full transition-transform active:scale-95">
                    <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-wfc-purple/30">
                      <AvatarImage src={currentUser?.photoURL} />
                      <AvatarFallback className="bg-wfc-purple-medium text-white">
                        {currentUser?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="animate-scale-in">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer transition-colors hover:bg-accent">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer transition-colors hover:bg-accent">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
        )}
        
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className={`flex-1 overflow-y-auto bg-background p-6 transition-all duration-300 animate-fade-in`}>
          <div className="container-custom">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
