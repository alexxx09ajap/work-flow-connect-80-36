import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";

export type UserType = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  role: 'freelancer' | 'client'; // Added role property
};

interface AuthContextType {
  currentUser: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Simulación de datos de usuario para desarrollo
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    photoURL: '/assets/avatars/avatar-1.png',
    bio: 'Desarrollador Full Stack con 5 años de experiencia',
    skills: ['React', 'Node.js', 'Firebase'],
    role: 'freelancer'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    photoURL: '/assets/avatars/avatar-2.png',
    bio: 'Diseñadora UX/UI especializada en experiencias móviles',
    skills: ['UI Design', 'Figma', 'Sketch'],
    role: 'client'
  }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Simular verificación de sesión al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simular verificación de credenciales
      const user = MOCK_USERS.find(user => user.email === email && user.password === password);
      
      if (!user) {
        throw new Error('Credenciales incorrectas');
      }
      
      // Omitir la contraseña al guardar el usuario
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a WorkFlowConnect",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: error instanceof Error ? error.message : "Error al iniciar sesión",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Verificar si el usuario ya existe
      if (MOCK_USERS.some(user => user.email === email)) {
        throw new Error('Este correo ya está registrado');
      }
      
      // Crear nuevo usuario (simulación)
      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        name,
        email,
        photoURL: undefined,
        bio: '',
        skills: [],
        role: 'freelancer'
      };
      
      // Actualizar el contexto
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      toast({
        title: "Registro exitoso",
        description: "¡Bienvenido a WorkFlowConnect!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error instanceof Error ? error.message : "Error al registrar",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const updateUserProfile = async (data: Partial<UserType>) => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    toast({
      title: "Perfil actualizado",
      description: "Tus cambios han sido guardados",
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        login, 
        register, 
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
