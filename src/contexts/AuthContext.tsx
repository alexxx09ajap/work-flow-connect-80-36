
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";
import { MOCK_USERS, CURRENT_USER } from '@/lib/mockData';

export type UserType = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  role: 'freelancer' | 'client';
  savedJobs?: string[];
  hourlyRate?: number;
  joinedAt?: number;
};

interface AuthContextType {
  currentUser: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(CURRENT_USER);
  const [loading, setLoading] = useState(false);

  // Simulación de iniciar sesión
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulamos un retardo para la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscamos al usuario por email (en un caso real, también verificaríamos la contraseña)
      const user = MOCK_USERS.find(user => user.email === email);
      
      if (!user) {
        throw new Error('Credenciales incorrectas');
      }
      
      setCurrentUser(user);
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

  // Simulación de registro de usuario
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Simulamos un retardo para la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificamos si el email ya está en uso
      if (MOCK_USERS.some(user => user.email === email)) {
        throw new Error('Este email ya está en uso');
      }
      
      // Crear un nuevo usuario
      const newUser: UserType = {
        id: `user${MOCK_USERS.length + 1}`,
        name,
        email,
        role: 'freelancer',
        skills: [],
        joinedAt: Date.now()
      };
      
      // En un caso real, lo añadiríamos a la base de datos
      // Aquí solo lo guardamos en memoria
      MOCK_USERS.push(newUser);
      
      setCurrentUser(newUser);
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

  // Simulación de cierre de sesión
  const logout = async () => {
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentUser(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cerrar sesión"
      });
    }
  };

  // Simulación de actualización de perfil
  const updateUserProfile = async (data: Partial<UserType>) => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizamos el usuario actual en memoria
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      
      // También actualizamos el usuario en nuestra "base de datos" simulada
      const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
      }
      
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el perfil"
      });
      throw error;
    }
  };

  // Simulación de subida de foto de perfil
  const uploadProfilePhoto = async (file: File) => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      // Simulamos un retardo para la "subida"
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generamos una URL simulada para la imagen
      // En un caso real, esto sería una URL de almacenamiento en la nube
      const photoURL = URL.createObjectURL(file);
      
      // Actualizamos el usuario
      setCurrentUser(prev => prev ? { ...prev, photoURL } : null);
      
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada",
      });
      
      return photoURL;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al subir la foto de perfil"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        login, 
        register, 
        logout,
        updateUserProfile,
        uploadProfilePhoto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
